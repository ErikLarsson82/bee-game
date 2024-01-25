import {
  setCycles,
  setBlizzardWinter,
  setLevelIndex,
  setCurrentCycleIndex,
  setCurrentCycle,
  setCurrentSeasonLength,
  setCurrentMapInit,
  setSeeds,
  setWinterHungerMultiplier,
  setKillNonPollinatedFlowers
} from './game/game-state'

import {
  setBackgroundImage,
  setBackgroundColor
} from './game/pixi-elements'

export function loadMapParameters (map, idx) {
  setCycles(Array.from(map.cycles))
  setBackgroundImage(map.backgroundImage)
  setBackgroundColor(map.backgroundColor)
  setBlizzardWinter(map.blizzardWinter)
  setLevelIndex(idx)
  setCurrentCycleIndex(0)
  setCurrentCycle(map.cycles[0])
  setCurrentSeasonLength(map.cycles[0])
  setCurrentMapInit(map.init)
  setSeeds(map.seeds)
  setWinterHungerMultiplier(map.winterHungerMultiplier)
  setKillNonPollinatedFlowers(map.killNonPollinatedFlowers)
}
