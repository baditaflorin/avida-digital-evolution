export const CELL_WIDTH = 64;
export const CELL_HEIGHT = 64;
export const CELL_COUNT = CELL_WIDTH * CELL_HEIGHT;
export const CELL_STRIDE = 8;

export type EvolutionStats = {
  update: number;
  population: number;
  births: number;
  deaths: number;
  mutations: number;
  meanMerit: number;
  diversity: number;
  maxMerit: number;
  taskLogic: number;
  taskSensor: number;
  taskReplicator: number;
  taskEntropy: number;
  meanEnergy: number;
  dominantGenome: number;
  eventCount: number;
  extinctionCount: number;
};

export type EvolutionEvent = {
  type: 'birth' | 'mutation' | 'death' | 'task';
  x: number;
  y: number;
  detail: number;
};

export type SimulationSnapshot = {
  stats: EvolutionStats;
  cells: Uint8Array;
  events: EvolutionEvent[];
};

export type SimulationWorkerApi = {
  init(seed: number): Promise<SimulationSnapshot>;
  reset(seed: number): Promise<SimulationSnapshot>;
  tick(steps: number): Promise<SimulationSnapshot>;
};
