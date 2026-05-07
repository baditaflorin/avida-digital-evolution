import { createIcons, Heart, Pause, Play, RotateCcw, SkipForward, Star, Zap } from 'lucide';
import type { LogRow } from './features/logging/duckdbStore';
import { LocalNarrator, type Narration } from './features/narration/narrator';
import { SimulationClient } from './features/simulation/client';
import type { EvolutionStats, SimulationSnapshot } from './features/simulation/types';
import { VisualizationEngine } from './features/visualization/visualization';
import { loadBuildInfo, loadLatestMainCommit, type BuildInfo } from './services/buildInfo';
import { registerServiceWorker } from './services/serviceWorker';

type AppState = {
  running: boolean;
  speed: number;
  snapshot: SimulationSnapshot | undefined;
  lastFrameAt: number;
  fps: number;
};

const state: AppState = {
  running: false,
  speed: 4,
  snapshot: undefined,
  lastFrameAt: performance.now(),
  fps: 0,
};

let simulation: SimulationClient | undefined;
let renderer: VisualizationEngine | undefined;
let logger: EvolutionLogger | undefined;
const narrator = new LocalNarrator();

type EvolutionLogger = {
  readonly status: string;
  append(stats: EvolutionStats): Promise<void>;
  recent(limit?: number): Promise<LogRow[]>;
};

export const bootstrapApp = async (): Promise<void> => {
  const [buildInfo, latestMain] = await Promise.all([
    loadBuildInfo(),
    loadLatestMainCommit().catch(() => ({})),
    registerServiceWorker(),
  ]);

  renderShell({ ...buildInfo, ...latestMain });
  bindControls();
  await initSimulation();
};

const renderShell = (buildInfo: BuildInfo): void => {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) {
    throw new Error('Missing app root');
  }

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <span class="sigil" aria-hidden="true"></span>
        <div>
          <h1>Avida Digital Evolution</h1>
          <p>v${buildInfo.version} · commit ${buildInfo.latestMainCommit ?? buildInfo.commit}</p>
        </div>
      </div>
      <nav class="toplinks" aria-label="Project links">
        <a class="link-button" href="${buildInfo.repository}" target="_blank" rel="noreferrer">
          <i data-lucide="star" aria-hidden="true"></i>
          <span>Star</span>
        </a>
        <a class="link-button support" href="${buildInfo.paypalUrl}" target="_blank" rel="noreferrer">
          <i data-lucide="heart" aria-hidden="true"></i>
          <span>PayPal</span>
        </a>
      </nav>
    </header>

    <main class="workspace">
      <section class="world-panel" aria-label="Digital evolution world">
        <canvas id="world" aria-label="Avida organism grid"></canvas>
        <div class="world-overlay">
          <span id="renderer-status">Renderer initializing</span>
          <span id="db-status">DuckDB standby</span>
        </div>
      </section>

      <aside class="control-panel">
        <section class="controls" aria-label="Simulation controls">
          <button id="toggle-run" class="primary-action" type="button">
            <i data-lucide="play" aria-hidden="true"></i>
            <span>Start</span>
          </button>
          <button id="step" class="icon-action" type="button" aria-label="Step once">
            <i data-lucide="skip-forward" aria-hidden="true"></i>
          </button>
          <button id="reset" class="icon-action" type="button" aria-label="Reset world">
            <i data-lucide="rotate-ccw" aria-hidden="true"></i>
          </button>
          <button id="burst" class="icon-action" type="button" aria-label="Run burst">
            <i data-lucide="zap" aria-hidden="true"></i>
          </button>
          <label class="speed-control">
            <span>Speed</span>
            <input id="speed" type="range" min="1" max="24" value="${state.speed}" />
          </label>
        </section>

        <section class="stats-grid" aria-label="Evolution statistics">
          ${statTile('Population', 'population', '0')}
          ${statTile('Update', 'update', '0')}
          ${statTile('Diversity', 'diversity', '0%')}
          ${statTile('Mean merit', 'mean-merit', '0')}
          ${statTile('Births', 'births', '0')}
          ${statTile('Mutations', 'mutations', '0')}
        </section>

        <section class="narrator-panel" aria-label="Alien biology narrator">
          <div class="section-heading">
            <h2>Local Narrator</h2>
            <span id="narrator-tone">standby</span>
          </div>
          <h3 id="narrator-title">Waiting for signal</h3>
          <p id="narrator-body">The first lineage scan will appear after the WASM world starts moving.</p>
        </section>

        <section class="log-panel" aria-label="DuckDB evolution log">
          <div class="section-heading">
            <h2>Evolution Log</h2>
            <span id="fps">0 fps</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Upd</th>
                <th>Pop</th>
                <th>Merit</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody id="log-rows"></tbody>
          </table>
        </section>

        <section class="build-panel" aria-label="Build metadata">
          <dl>
            <div><dt>Version</dt><dd>v${buildInfo.version}</dd></div>
            <div><dt>Commit</dt><dd>${buildInfo.latestMainCommit && buildInfo.latestMainCommitUrl ? `<a href="${buildInfo.latestMainCommitUrl}" target="_blank" rel="noreferrer">${buildInfo.latestMainCommit}</a>` : buildInfo.commit}</dd></div>
          </dl>
        </section>
      </aside>
    </main>

    <div id="toast" class="toast" role="status" aria-live="polite"></div>
  `;

  createIcons({
    icons: { Heart, Pause, Play, RotateCcw, SkipForward, Star, Zap },
  });
};

const statTile = (label: string, id: string, value: string): string => `
  <div class="stat-tile">
    <span>${label}</span>
    <strong id="stat-${id}">${value}</strong>
  </div>
`;

const bindControls = (): void => {
  byId<HTMLButtonElement>('toggle-run').addEventListener('click', () => {
    state.running = !state.running;
    updateRunButton();
    if (state.running) {
      void loop();
    }
  });

  byId<HTMLButtonElement>('step').addEventListener('click', () => {
    void advance(1, true);
  });

  byId<HTMLButtonElement>('burst').addEventListener('click', () => {
    void advance(80, true);
  });

  byId<HTMLButtonElement>('reset').addEventListener('click', () => {
    void resetWorld();
  });

  byId<HTMLInputElement>('speed').addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    state.speed = Number(target.value);
    localStorage.setItem('avida-speed', String(state.speed));
  });
};

const initSimulation = async (): Promise<void> => {
  const savedSpeed = Number(localStorage.getItem('avida-speed'));
  if (Number.isFinite(savedSpeed) && savedSpeed > 0) {
    state.speed = savedSpeed;
    byId<HTMLInputElement>('speed').value = String(savedSpeed);
  }

  simulation = new SimulationClient();

  const canvas = byId<HTMLCanvasElement>('world');
  renderer = new VisualizationEngine(canvas, (status) => {
    byId('renderer-status').textContent = `${status.renderer} · WebGPU ${status.webgpu}`;
  });
  await renderer.init();
  window.addEventListener('resize', () => renderer?.resize());

  state.snapshot = await simulation.init(Date.now() >>> 0);
  renderer.render(state.snapshot);
  renderStats(state.snapshot.stats);
  updateNarration(narrator.narrate(state.snapshot, true));
  void initLogger(state.snapshot.stats);
};

const initLogger = async (initialStats: EvolutionStats): Promise<void> => {
  try {
    byId('db-status').textContent = 'DuckDB warming';
    const { EvolutionLogStore } = await import('./features/logging/duckdbStore');
    const store = new EvolutionLogStore();
    await store.init();
    logger = store;
    byId('db-status').textContent = store.status;
    await appendLog(initialStats);
  } catch (error) {
    byId('db-status').textContent = 'Session log fallback';
    if (import.meta.env.DEV) {
      console.warn(error);
    }
  }
};

const resetWorld = async (): Promise<void> => {
  if (!simulation || !renderer) {
    return;
  }
  state.snapshot = await simulation.reset((Date.now() ^ Math.floor(Math.random() * 2 ** 31)) >>> 0);
  renderer.render(state.snapshot);
  renderStats(state.snapshot.stats);
  updateNarration(narrator.narrate(state.snapshot, true));
  await appendLog(state.snapshot.stats);
};

const loop = async (): Promise<void> => {
  while (state.running) {
    await advance(state.speed, false);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

const advance = async (steps: number, forceNarration: boolean): Promise<void> => {
  if (!simulation || !renderer) {
    return;
  }

  try {
    state.snapshot = await simulation.tick(steps);
    renderer.render(state.snapshot);
    renderStats(state.snapshot.stats);
    updateFps();
    const narration = narrator.narrate(state.snapshot, forceNarration);
    updateNarration(narration);
    if (state.snapshot.stats.update % 10 === 0 || forceNarration) {
      await appendLog(state.snapshot.stats);
    }
  } catch (error) {
    state.running = false;
    updateRunButton();
    toast(error instanceof Error ? error.message : 'Simulation failed');
  }
};

const appendLog = async (stats: EvolutionStats): Promise<void> => {
  if (!logger) {
    return;
  }
  await logger.append(stats);
  renderLogRows(await logger.recent());
};

const renderStats = (stats: EvolutionStats): void => {
  byId('stat-population').textContent = String(stats.population);
  byId('stat-update').textContent = String(stats.update);
  byId('stat-diversity').textContent = `${Math.round(stats.diversity)}%`;
  byId('stat-mean-merit').textContent = stats.meanMerit.toFixed(1);
  byId('stat-births').textContent = String(stats.births);
  byId('stat-mutations').textContent = String(stats.mutations);
};

const renderLogRows = (rows: LogRow[]): void => {
  byId('log-rows').innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${row.update}</td>
          <td>${row.population}</td>
          <td>${row.mean_merit.toFixed(1)}</td>
          <td>${row.task_total}</td>
        </tr>
      `,
    )
    .join('');
};

const updateNarration = (narration: Narration | undefined): void => {
  if (!narration) {
    return;
  }
  byId('narrator-title').textContent = narration.title;
  byId('narrator-body').textContent = narration.body;
  byId('narrator-tone').textContent = narration.tone;
  byId('narrator-tone').setAttribute('data-tone', narration.tone);
};

const updateRunButton = (): void => {
  const button = byId<HTMLButtonElement>('toggle-run');
  button.innerHTML = state.running
    ? '<i data-lucide="pause" aria-hidden="true"></i><span>Pause</span>'
    : '<i data-lucide="play" aria-hidden="true"></i><span>Start</span>';
  createIcons({ icons: { Pause, Play } });
};

const updateFps = (): void => {
  const now = performance.now();
  const delta = now - state.lastFrameAt;
  state.lastFrameAt = now;
  if (delta > 0) {
    state.fps = Math.round(1000 / delta);
    byId('fps').textContent = `${state.fps} fps`;
  }
};

const toast = (message: string): void => {
  const node = byId('toast');
  node.textContent = message;
  node.classList.add('is-visible');
  window.setTimeout(() => node.classList.remove('is-visible'), 5000);
};

const byId = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Missing element #${id}`);
  }
  return element as T;
};
