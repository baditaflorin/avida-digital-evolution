import { describe, expect, it } from 'vitest';
import { LocalNarrator } from './narrator';
import type { SimulationSnapshot } from '../simulation/types';

const snapshot = (overrides: Partial<SimulationSnapshot['stats']>): SimulationSnapshot => ({
  cells: new Uint8Array(),
  events: [],
  stats: {
    update: 0,
    population: 100,
    births: 0,
    deaths: 0,
    mutations: 0,
    meanMerit: 2,
    diversity: 10,
    maxMerit: 3,
    taskLogic: 0,
    taskSensor: 0,
    taskReplicator: 0,
    taskEntropy: 0,
    meanEnergy: 20,
    dominantGenome: 1,
    eventCount: 0,
    extinctionCount: 0,
    ...overrides,
  },
});

describe('LocalNarrator', () => {
  it('describes a mutation bloom when diversity rises', () => {
    const narrator = new LocalNarrator();
    narrator.narrate(snapshot({ update: 1 }), true);
    const narration = narrator.narrate(
      snapshot({ update: 40, mutations: 44, diversity: 32, births: 80 }),
      true,
    );

    expect(narration?.title).toBe('Mutation Bloom');
  });
});
