import type { EvolutionStats, SimulationSnapshot } from '../simulation/types';

export type Narration = {
  title: string;
  body: string;
  tone: 'calm' | 'excited' | 'warning';
};

const formatPct = (value: number): string => `${Math.round(value)}%`;

export class LocalNarrator {
  private previous: EvolutionStats | undefined;
  private lastUpdate = 0;

  narrate(snapshot: SimulationSnapshot, force = false): Narration | undefined {
    const stats = snapshot.stats;
    if (!force && stats.update - this.lastUpdate < 25) {
      return undefined;
    }

    const previous = this.previous;
    this.previous = stats;
    this.lastUpdate = stats.update;

    if (!previous) {
      return {
        title: 'First Contact',
        body: `The world opens with ${stats.population} digital organisms. Early lineages are scattered, hungry, and mostly simple.`,
        tone: 'calm',
      };
    }

    const deltaPopulation = stats.population - previous.population;
    const deltaMutations = stats.mutations - previous.mutations;
    const deltaBirths = stats.births - previous.births;
    const taskTotal = stats.taskLogic + stats.taskSensor + stats.taskReplicator + stats.taskEntropy;

    if (stats.extinctionCount > previous.extinctionCount) {
      return {
        title: 'Bottleneck',
        body: 'A collapse swept the grid. The nursery reseeded the world, and selection now has a new founding population to sculpt.',
        tone: 'warning',
      };
    }

    if (deltaMutations > 30 && stats.diversity > previous.diversity) {
      return {
        title: 'Mutation Bloom',
        body: `${deltaMutations} mutations landed in the recent window. Diversity climbed to ${formatPct(stats.diversity)}, suggesting several genomes found viable niches at once.`,
        tone: 'excited',
      };
    }

    if (
      taskTotal > 0 &&
      taskTotal >
        previous.taskLogic + previous.taskSensor + previous.taskReplicator + previous.taskEntropy
    ) {
      return {
        title: 'New Behavior',
        body: `A task-bearing lineage is spreading. ${taskTotal} organisms now express logic, sensing, replication, or entropy-skewed behavior.`,
        tone: 'excited',
      };
    }

    if (deltaPopulation > 80) {
      return {
        title: 'Expansion',
        body: `The population surged by ${deltaPopulation}. Replicators with mean merit ${stats.meanMerit.toFixed(1)} are converting open space into descendants.`,
        tone: 'excited',
      };
    }

    if (deltaPopulation < -80) {
      return {
        title: 'Selection Pressure',
        body: `The grid shed ${Math.abs(deltaPopulation)} organisms. Age, hunger, and competition are pruning weak lineages faster than they reproduce.`,
        tone: 'warning',
      };
    }

    return {
      title: 'Drift',
      body: `${deltaBirths} births and ${deltaMutations} mutations passed through a mostly stable ecology. The dominant genome bucket is ${stats.dominantGenome}.`,
      tone: 'calm',
    };
  }
}
