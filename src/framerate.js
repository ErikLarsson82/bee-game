export let FPS = 144
export const ticksToSeconds = number => Math.round(number / FPS)
export const secondsToTicks = number => number * FPS

export function setFPS (f) {
  FPS = f
}

export function getFPS () {
  return FPS
}
