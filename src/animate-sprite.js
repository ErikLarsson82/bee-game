import { Sprite, BaseTexture, Texture, Rectangle, loader } from 'pixi.js'
import { fps } from './framerate'
import { addTicker } from './exported-help-functions'
import { gameSpeed } from './game/game-state'

export function animateSprite (sprite, name, amount, w, h, _loop, callback, _timelocked) {
  const frame = new Sprite()

  const texture = Texture.from(name)
  const baseTexture = BaseTexture.from(texture)
  const resourceFrames = loader.resources.sheet.data.frames[name]
  if (resourceFrames === undefined) throw new Error(`sprite named ${name} is missing`)
  const offset = resourceFrames.frame

  const frames = []
  const offx = offset.x
  const offy = offset.y

  for (let i = 0; i < amount; i++) {
    frames.push(
      new Texture(baseTexture, new Rectangle((i * w) + offx, offy, w, h))
    )
  }

  let delay = 0
  let pause = false
  const loop = _loop === undefined ? true : _loop
  const timelocked = _timelocked === undefined ? false : _timelocked
  const frameDurationModifier = 0.1
  const MOD = fps * frameDurationModifier

  const handler = {
    sprite: frame,
    restart: () => {
      delay = 0
      pause = false
      return handler
    },
    start: () => {
      pause = false
      return handler
    },
    pause: () => {
      pause = true
      return handler
    },
    isRunning: () => {
      return !pause
    }
  }

  addTicker('game-stuff', () => {
    if (pause) return
    delay += timelocked ? 1 : gameSpeed
    if (delay >= MOD * amount) {
      if (loop) {
        delay = 0
      } else {
        handler.pause()
        callback && callback()
      }
    }
    const currentFrame = Math.min(Math.max(0, Math.floor(delay / MOD)), amount)
    frame.texture = frames[currentFrame]
  })

  sprite.addChild(frame)
  return handler
}
