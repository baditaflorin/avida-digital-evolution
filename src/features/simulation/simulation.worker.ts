import { expose } from 'comlink';
import { CELL_COUNT, CELL_STRIDE, type EvolutionEvent, type SimulationSnapshot } from './types';

type CoreExports = {
  memory: WebAssembly.Memory;
  reset(seed: number): void;
  step(steps: number): void;
  get_cells_ptr(): number;
  get_stats_ptr(): number;
  get_events_ptr(): number;
  get_event_count(): number;
};

const STAT_FIELDS = 16;
const EVENT_TYPE: Record<number, EvolutionEvent['type']> = {
  1: 'birth',
  2: 'mutation',
  3: 'death',
  4: 'task',
};

class SimulationCoreWorker {
  private core: CoreExports | undefined;

  async init(seed: number): Promise<SimulationSnapshot> {
    await this.ensureCore();
    return this.reset(seed);
  }

  async reset(seed: number): Promise<SimulationSnapshot> {
    const core = await this.ensureCore();
    core.reset(seed >>> 0);
    return this.snapshot();
  }

  async tick(steps: number): Promise<SimulationSnapshot> {
    const core = await this.ensureCore();
    core.step(Math.max(1, Math.min(256, Math.floor(steps))));
    return this.snapshot();
  }

  private async ensureCore(): Promise<CoreExports> {
    if (this.core) {
      return this.core;
    }

    const wasmUrl = new URL(
      `${import.meta.env.BASE_URL}wasm/avida_core.wasm`,
      self.location.origin,
    );
    const response = await fetch(wasmUrl);
    if (!response.ok) {
      throw new Error(`Unable to load WASM core (${response.status})`);
    }

    const bytes = await response.arrayBuffer();
    const module = await WebAssembly.instantiate(bytes, {});
    this.core = module.instance.exports as CoreExports;
    return this.core;
  }

  private snapshot(): SimulationSnapshot {
    if (!this.core) {
      throw new Error('Simulation core is not initialized');
    }

    const memory = this.core.memory.buffer;
    const statsWords = new Uint32Array(memory, this.core.get_stats_ptr(), STAT_FIELDS);
    const cells = new Uint8Array(
      memory,
      this.core.get_cells_ptr(),
      CELL_COUNT * CELL_STRIDE,
    ).slice();
    const eventCount = Math.min(this.core.get_event_count(), 2048);
    const rawEvents = new Uint32Array(memory, this.core.get_events_ptr(), eventCount);

    return {
      stats: {
        update: statsWords[0] ?? 0,
        population: statsWords[1] ?? 0,
        births: statsWords[2] ?? 0,
        deaths: statsWords[3] ?? 0,
        mutations: statsWords[4] ?? 0,
        meanMerit: (statsWords[5] ?? 0) / 100,
        diversity: (statsWords[6] ?? 0) / 100,
        maxMerit: statsWords[7] ?? 0,
        taskLogic: statsWords[8] ?? 0,
        taskSensor: statsWords[9] ?? 0,
        taskReplicator: statsWords[10] ?? 0,
        taskEntropy: statsWords[11] ?? 0,
        meanEnergy: (statsWords[12] ?? 0) / 100,
        dominantGenome: statsWords[13] ?? 0,
        eventCount: statsWords[14] ?? 0,
        extinctionCount: statsWords[15] ?? 0,
      },
      cells,
      events: Array.from(rawEvents, decodeEvent),
    };
  }
}

const decodeEvent = (packed: number): EvolutionEvent => {
  const typeId = packed & 0xf;
  return {
    type: EVENT_TYPE[typeId] ?? 'birth',
    x: (packed >> 4) & 0x3f,
    y: (packed >> 10) & 0x3f,
    detail: (packed >> 16) & 0xffff,
  };
};

expose(new SimulationCoreWorker());
