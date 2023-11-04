
function loadMapParameters(map, idx) {
  cycles = Array.from(map.cycles)
  backgroundImage = map.backgroundImage
  backgroundColor = map.backgroundColor
  blizzardWinter = map.blizzardWinter
  levelIndex = idx
  currentCycleIndex = 0
  currentCycle = cycles[0]
  currentSeasonLength = cycles[0]
  currentMapInit = map.init
  seeds = map.seeds
  winterHungerMultiplier = map.winterHungerMultiplier  
  killNonPollinatedFlowers = map.killNonPollinatedFlowers
}
