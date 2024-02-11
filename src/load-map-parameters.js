import {
  setCycles,
  setBlizzardWinter,
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

import MAP_CONFIGURATIONS from './map-configurations'

export function loadMapParameters (name) {
  const {
    cycles,
    backgroundImage,
    backgroundColor,
    blizzardWinter,
    init,
    seeds,
    winterHungerMultiplier,
    killNonPollinatedFlowers
  } = MAP_CONFIGURATIONS.find(x => x.name === name)

  setCycles(Array.from(cycles))
  setBackgroundImage(backgroundImage)
  setBackgroundColor(backgroundColor)
  setBlizzardWinter(blizzardWinter)
  setCurrentCycleIndex(0)
  setCurrentCycle(cycles[0])
  setCurrentSeasonLength(cycles[0])
  setCurrentMapInit(init)
  setSeeds(seeds)
  setWinterHungerMultiplier(winterHungerMultiplier)
  setKillNonPollinatedFlowers(killNonPollinatedFlowers)
}
