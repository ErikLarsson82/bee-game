import { Container, Sprite, Point, Polygon, Texture, Text } from 'pixi.js'
import { addTicker } from './exported-help-functions'
import { cap } from './pure-help-functions'
import { fontConfig } from './config'

export function ProgressBar (x, y, type, tickerData, max) {
  const container = new Container()
  container.position.x = x
  container.position.y = y
  const progressBarBgSprite = Sprite.fromImage('progress-bar/progress-bg.png')
  const progressSprite = Sprite.fromImage('progress-bar/progress-' + type + '.png')
  addTicker('ui', time => {
    const _max = max === undefined ? 100 : max
    progressSprite.width = cap(0, _max)(tickerData()) / max * 21
  })
  container.addChild(progressBarBgSprite)
  container.addChild(progressSprite)
  return container
}

export const ProgressBar2 = (x, y, type, tickerData, max) => {
  const container = new Container()
  container.position.x = x
  container.position.y = y
  const progressSprite = Sprite.fromImage('content-' + type + '-fill.png')
  addTicker('ui', () => {
    progressSprite.width = cap(0, max)(tickerData()) / max * 43
  })
  container.addChild(progressSprite)
  return container
}

export function Button (x, y, content, callback, hoverover, hoverout, _size) {
  const size = _size === undefined ? 'standard' : _size
  const buttonSprite = Sprite.fromImage(`button-${size}/button-${size}-standard.png`)
  let swallow = false
  buttonSprite.position.x = x
  buttonSprite.position.y = y
  buttonSprite.interactive = true
  if (size === 'large') {
    buttonSprite.hitArea = new Polygon([
      new Point(10, 0),
      new Point(28, 0),
      new Point(38, 10),
      new Point(28, 20),
      new Point(10, 20),
      new Point(0, 10)
    ])
  }
  buttonSprite.buttonMode = true
  buttonSprite.mouseover = () => {
    hoverover && hoverover()
    buttonSprite.texture = Texture.fromImage(`button-${size}/button-${size}-hover.png`)
  }
  buttonSprite.mouseout = () => {
    hoverout && hoverout()
    buttonSprite.texture = Texture.fromImage(`button-${size}/button-${size}-standard.png`)
  }
  buttonSprite.mouseup = () => {
    if (swallow) return
    swallow = true
    buttonSprite.texture = Texture.fromImage(`button-${size}/button-${size}-click.png`)
    setTimeout(() => {
      callback()
      swallow = false
      buttonSprite.texture = Texture.fromImage(`button-${size}/button-${size}-hover.png`)
    }, 50)
  }

  if (typeof content === 'string') {
    const buttonText = new Text(content, { ...fontConfig, fontSize: 22 })
    buttonText.scale.set(0.15, 0.15)
    buttonText.position.x = 7
    buttonText.position.y = 3
    buttonSprite.addChild(buttonText)
  } else if (content !== undefined && content !== null) {
    buttonSprite.addChild(content)
  }

  return buttonSprite
}
