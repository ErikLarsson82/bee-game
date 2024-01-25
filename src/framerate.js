export let fps = 144
export const ticksToSeconds = number => Math.round(number / fps)
export const secondsToTicks = number => number * fps

export const setFps = f => (fps = f)
