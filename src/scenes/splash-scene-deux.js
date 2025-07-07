import { Container, Text, Graphics, Sprite, Texture } from 'pixi.js'
import { WIDTH, HEIGHT } from '../config'
import Bezier from '../bezier'
import { Button } from '../ui'

class SplashDeuxScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager
  }

  init () {
    setup.bind(this)()
  }
}

function setup () {
  const _container = this
  const sceneManager = this.sceneManager

  document.body.style['background-color'] = '#fff6c5'
  
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  _container.addChild(container)

  const background = new Graphics()
  background.beginFill(0xffd601)
  background.drawRect(0, 0, WIDTH, HEIGHT)
  container.addChild(background)

  const text = new Container()
  container.addChild(text)

  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  const buttonA = Button(Math.round(WIDTH / 2 / 2 / 2) - 20, 100 + (12 * 1), '  Play', () => sceneManager.goToScene('level-select'))
  scaler.addChild(buttonA)
}

export default SplashDeuxScene
