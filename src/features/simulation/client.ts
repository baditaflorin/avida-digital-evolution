import { wrap, type Remote } from 'comlink';
import type { SimulationSnapshot, SimulationWorkerApi } from './types';

export class SimulationClient {
  private worker: Worker;
  private api: Remote<SimulationWorkerApi>;

  constructor() {
    this.worker = new Worker(new URL('./simulation.worker.ts', import.meta.url), {
      type: 'module',
    });
    this.api = wrap<SimulationWorkerApi>(this.worker);
  }

  init(seed: number): Promise<SimulationSnapshot> {
    return this.api.init(seed);
  }

  reset(seed: number): Promise<SimulationSnapshot> {
    return this.api.reset(seed);
  }

  tick(steps: number): Promise<SimulationSnapshot> {
    return this.api.tick(steps);
  }

  dispose(): void {
    this.worker.terminate();
  }
}
