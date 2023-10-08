let MAP_CONFIGURATIONS = [
  {
    name: 'Level 1 - Green fields',
    id: 'default',
    cycles: [5, 2, 5, 2, 5, 2, 4, 3, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 16, 16, 18, 18, 20, 20, 24, 24, 30, 30],
    seeds: 1,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-summer',
    blizzardWinter: false
  },
  {
    name: 'Level 2 - Green gone cold',
    id: 'generous start',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 3,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-summer-cold',
    blizzardWinter: false
  },
  {
    name: 'Level 3 - Desert haze',
    id: 'some-hexes-blocked',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 3,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-desert',
    blizzardWinter: false
  },
  {
    name: 'Level 4 - Blizzard winter',
    id: 'corner start',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1],
    seeds: 1,
    winterHungerMultiplier: 5,
    backgroundImage: 'background-hurricane',
    blizzardWinter: true
  },
  {
    // Give players many many empty hexagons to choose from
    name: 'Experiment: - Many empty hex',
    id: 'many empty',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1],
    seeds: 1,
    winterHungerMultiplier: 4,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  },
  {
    // Give players lots of resources at the start, but have winters be pretty punishing
    name: 'Experiment: Generous start - punishing',
    id: 'generous start',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 4,
    winterHungerMultiplier: 4,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  },
  {
    // Bees are VERY hungry during winter, albeit they are short - this one could be considered a very hard map, especially to get far
    name: 'Experiment: Hunger winter - escalating',
    id: 'corner start',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 3, 3, 3, 3, 4, 3, 4, 3, 5, 3, 6, 3, 7, 3, 8, 3, 9, 3, 10, 3, 11],
    seeds: 2,
    winterHungerMultiplier: 5,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  },
  {
    // Not much to start with and winter coming fast
    name: 'Experiment: Fast winter',
    id: 'fast winter',
    cycles: [1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    seeds: 1,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  }
]
