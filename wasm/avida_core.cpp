#include <stdint.h>

namespace {
constexpr uint32_t kWidth = 64;
constexpr uint32_t kHeight = 64;
constexpr uint32_t kCellCount = kWidth * kHeight;
constexpr uint32_t kMaxEvents = 2048;

struct Cell {
  uint8_t alive;
  uint8_t energy;
  uint8_t merit;
  uint8_t task;
  uint8_t hue;
  uint8_t age;
  uint8_t genome_lo;
  uint8_t flags;
};

struct Stats {
  uint32_t update;
  uint32_t population;
  uint32_t births;
  uint32_t deaths;
  uint32_t mutations;
  uint32_t mean_merit_x100;
  uint32_t diversity_x100;
  uint32_t max_merit;
  uint32_t task_logic;
  uint32_t task_sensor;
  uint32_t task_replicator;
  uint32_t task_entropy;
  uint32_t mean_energy_x100;
  uint32_t dominant_genome;
  uint32_t event_count;
  uint32_t extinction_count;
};

Cell cells[kCellCount];
Stats stats;
uint32_t genomes[kCellCount];
uint32_t events[kMaxEvents];
uint8_t diversity_buckets[64];
uint32_t rng_state = 0xA51DAEEDu;

uint32_t next_random() {
  uint32_t x = rng_state;
  x ^= x << 13;
  x ^= x >> 17;
  x ^= x << 5;
  rng_state = x == 0 ? 0x9E3779B9u : x;
  return rng_state;
}

uint32_t popcount32(uint32_t value) {
  uint32_t count = 0;
  while (value != 0) {
    value &= value - 1;
    ++count;
  }
  return count;
}

uint8_t genome_hue(uint32_t genome) {
  return static_cast<uint8_t>(((genome >> 2) ^ (genome >> 11) ^ (genome >> 23)) & 0xFFu);
}

uint8_t task_for(uint32_t genome) {
  const uint32_t bits = popcount32(genome);
  const uint32_t alternating = popcount32(genome ^ 0xAAAAAAAAu);
  if ((genome & 0x000000FFu) == ((genome >> 8) & 0x000000FFu)) {
    return 1;
  }
  if (alternating > 22 || alternating < 10) {
    return 2;
  }
  if (((genome >> 16) & 0xFu) == (genome & 0xFu)) {
    return 3;
  }
  if (bits > 23 || bits < 9) {
    return 4;
  }
  return 0;
}

uint8_t merit_for(uint32_t genome) {
  const uint32_t bits = popcount32(genome);
  uint32_t merit = 2 + (bits > 16 ? bits - 16 : 16 - bits);
  const uint8_t task = task_for(genome);
  merit += task * 4;
  merit += ((genome ^ (genome >> 9) ^ (genome >> 19)) & 0x7u);
  return static_cast<uint8_t>(merit > 31 ? 31 : merit);
}

void push_event(uint32_t type, uint32_t index, uint32_t detail) {
  if (stats.event_count >= kMaxEvents) {
    return;
  }
  const uint32_t x = index % kWidth;
  const uint32_t y = index / kWidth;
  events[stats.event_count++] = (type & 0xFu) | ((x & 0x3Fu) << 4) | ((y & 0x3Fu) << 10) |
                                ((detail & 0xFFFFu) << 16);
}

uint32_t wrapped_index(int32_t x, int32_t y) {
  const uint32_t xx = static_cast<uint32_t>((x + static_cast<int32_t>(kWidth)) & 63);
  const uint32_t yy = static_cast<uint32_t>((y + static_cast<int32_t>(kHeight)) & 63);
  return yy * kWidth + xx;
}

void seed_cell(uint32_t index, uint32_t genome, uint8_t energy) {
  genomes[index] = genome;
  cells[index].alive = 1;
  cells[index].energy = energy;
  cells[index].merit = merit_for(genome);
  cells[index].task = task_for(genome);
  cells[index].hue = genome_hue(genome);
  cells[index].age = static_cast<uint8_t>(next_random() & 0x1Fu);
  cells[index].genome_lo = static_cast<uint8_t>(genome & 0xFFu);
  cells[index].flags = 0;
}

uint32_t mutate(uint32_t genome, uint32_t* mutation_count) {
  uint32_t child = genome;
  if ((next_random() % 100u) < 9u) {
    child ^= 1u << (next_random() & 31u);
    ++(*mutation_count);
  }
  if ((next_random() % 100u) < 3u) {
    const uint32_t shift = next_random() & 31u;
    child = (child << shift) | (child >> ((32u - shift) & 31u));
    ++(*mutation_count);
  }
  if ((next_random() % 100u) < 2u) {
    child += 0x9E3779B9u ^ next_random();
    ++(*mutation_count);
  }
  return child;
}

void clear_world() {
  for (uint32_t i = 0; i < kCellCount; ++i) {
    cells[i].alive = 0;
    cells[i].energy = 0;
    cells[i].merit = 0;
    cells[i].task = 0;
    cells[i].hue = 0;
    cells[i].age = 0;
    cells[i].genome_lo = 0;
    cells[i].flags = 0;
    genomes[i] = 0;
  }
}

void tally() {
  for (uint32_t i = 0; i < 64; ++i) {
    diversity_buckets[i] = 0;
  }

  uint32_t population = 0;
  uint32_t merit_sum = 0;
  uint32_t energy_sum = 0;
  uint32_t max_merit = 0;
  uint32_t occupied_buckets = 0;
  uint32_t task_logic = 0;
  uint32_t task_sensor = 0;
  uint32_t task_replicator = 0;
  uint32_t task_entropy = 0;
  uint32_t dominant_bucket = 0;
  uint32_t dominant_count = 0;
  uint32_t bucket_counts[64];

  for (uint32_t i = 0; i < 64; ++i) {
    bucket_counts[i] = 0;
  }

  for (uint32_t i = 0; i < kCellCount; ++i) {
    if (cells[i].alive == 0) {
      continue;
    }
    ++population;
    merit_sum += cells[i].merit;
    energy_sum += cells[i].energy;
    if (cells[i].merit > max_merit) {
      max_merit = cells[i].merit;
    }

    const uint32_t bucket = ((genomes[i] >> 2) ^ (genomes[i] >> 13) ^ genomes[i]) & 63u;
    if (diversity_buckets[bucket] == 0) {
      ++occupied_buckets;
      diversity_buckets[bucket] = 1;
    }
    ++bucket_counts[bucket];
    if (bucket_counts[bucket] > dominant_count) {
      dominant_count = bucket_counts[bucket];
      dominant_bucket = bucket;
    }

    switch (cells[i].task) {
      case 1:
        ++task_logic;
        break;
      case 2:
        ++task_sensor;
        break;
      case 3:
        ++task_replicator;
        break;
      case 4:
        ++task_entropy;
        break;
      default:
        break;
    }
  }

  stats.population = population;
  stats.mean_merit_x100 = population == 0 ? 0 : (merit_sum * 100u) / population;
  stats.mean_energy_x100 = population == 0 ? 0 : (energy_sum * 100u) / population;
  stats.diversity_x100 = (occupied_buckets * 100u) / 64u;
  stats.max_merit = max_merit;
  stats.task_logic = task_logic;
  stats.task_sensor = task_sensor;
  stats.task_replicator = task_replicator;
  stats.task_entropy = task_entropy;
  stats.dominant_genome = dominant_bucket;
}

void update_one() {
  ++stats.update;
  stats.event_count = 0;

  for (uint32_t scan = 0; scan < kCellCount; ++scan) {
    const uint32_t i = (scan + (next_random() & 4095u)) & 4095u;
    if (cells[i].alive == 0) {
      continue;
    }

    const uint8_t task = cells[i].task;
    uint32_t energy_gain = 1u + (cells[i].merit / 5u);
    if (task != 0) {
      energy_gain += task;
    }
    cells[i].energy = static_cast<uint8_t>(cells[i].energy + energy_gain > 255u
                                             ? 255u
                                             : cells[i].energy + energy_gain);
    cells[i].age = static_cast<uint8_t>(cells[i].age == 255u ? 255u : cells[i].age + 1u);

    const bool old_age = cells[i].age > static_cast<uint8_t>(180u + cells[i].merit * 2u);
    const bool unlucky = (next_random() % 12000u) < cells[i].age;
    if (old_age || unlucky) {
      cells[i].alive = 0;
      cells[i].energy = 0;
      ++stats.deaths;
      push_event(3, i, cells[i].merit);
      continue;
    }

    const uint32_t threshold = 76u + (cells[i].merit / 2u);
    if (cells[i].energy < threshold) {
      continue;
    }

    const int32_t x = static_cast<int32_t>(i % kWidth);
    const int32_t y = static_cast<int32_t>(i / kWidth);
    const int32_t dx = static_cast<int32_t>(next_random() % 3u) - 1;
    const int32_t dy = static_cast<int32_t>(next_random() % 3u) - 1;
    const uint32_t target = wrapped_index(x + dx, y + dy);

    uint32_t mutation_count = 0;
    const uint32_t child_genome = mutate(genomes[i], &mutation_count);
    const uint8_t child_merit = merit_for(child_genome);
    const bool target_empty = cells[target].alive == 0;
    const bool can_replace = target_empty || child_merit + (next_random() & 7u) >= cells[target].merit;
    if (!can_replace) {
      cells[i].energy = static_cast<uint8_t>(cells[i].energy - 18u);
      continue;
    }

    const uint8_t parent_task = cells[i].task;
    cells[i].energy = static_cast<uint8_t>(cells[i].energy / 2u);
    seed_cell(target, child_genome, static_cast<uint8_t>(34u + (cells[i].merit & 15u)));
    cells[target].merit = child_merit;
    cells[target].age = 0;
    ++stats.births;
    stats.mutations += mutation_count;
    push_event(1, target, child_merit);
    if (mutation_count > 0) {
      push_event(2, target, mutation_count);
    }
    if (cells[target].task != 0 && cells[target].task != parent_task) {
      push_event(4, target, cells[target].task);
    }
  }

  tally();

  if (stats.population < 8u) {
    ++stats.extinction_count;
    for (uint32_t i = 0; i < 96u; ++i) {
      const uint32_t index = next_random() & 4095u;
      if (cells[index].alive == 0) {
        seed_cell(index, next_random() ^ (0xA5A5A5A5u + i * 7919u), 42);
        ++stats.births;
        push_event(1, index, cells[index].merit);
      }
    }
    tally();
  }
}
}  // namespace

extern "C" {
void reset(uint32_t seed) {
  rng_state = seed == 0 ? 0xA51DAEEDu : seed;
  clear_world();
  stats.update = 0;
  stats.population = 0;
  stats.births = 0;
  stats.deaths = 0;
  stats.mutations = 0;
  stats.mean_merit_x100 = 0;
  stats.diversity_x100 = 0;
  stats.max_merit = 0;
  stats.task_logic = 0;
  stats.task_sensor = 0;
  stats.task_replicator = 0;
  stats.task_entropy = 0;
  stats.mean_energy_x100 = 0;
  stats.dominant_genome = 0;
  stats.event_count = 0;
  stats.extinction_count = 0;

  for (uint32_t i = 0; i < 760u; ++i) {
    const uint32_t index = next_random() & 4095u;
    if (cells[index].alive == 0) {
      seed_cell(index, next_random() ^ (i * 0x9E3779B9u), static_cast<uint8_t>(45u + (next_random() & 31u)));
    }
  }
  tally();
}

void step(uint32_t steps) {
  const uint32_t safe_steps = steps > 256u ? 256u : steps;
  for (uint32_t i = 0; i < safe_steps; ++i) {
    update_one();
  }
}

uint32_t get_width() { return kWidth; }
uint32_t get_height() { return kHeight; }
uint32_t get_cells_ptr() { return reinterpret_cast<uint32_t>(&cells[0]); }
uint32_t get_stats_ptr() { return reinterpret_cast<uint32_t>(&stats); }
uint32_t get_events_ptr() { return reinterpret_cast<uint32_t>(&events[0]); }
uint32_t get_event_count() { return stats.event_count; }
}
