import { WIDTH, HEIGHT } from '../config'
import { Container, Text, Graphics, Sprite, Texture } from 'pixi.js'
import Bezier from '../bezier'
import { Button } from '../ui'

class SplashScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager

    const text = new Text('Splash Scene', { fill: 0xffffff })
    text.position.set(50, 50)
    this.addChild(text)
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

  const splashscreen = new Graphics()
  splashscreen.beginFill(0xffd601)
  splashscreen.drawRect(0, 0, WIDTH, HEIGHT)
  container.addChild(splashscreen)

  const text = new Container()
  container.addChild(text)

  // eslint-disable-next-line new-cap
  const logo = new Sprite.fromImage('logo.png')
  logo.position.x = 10
  logo.position.y = 50
  container.addChild(logo)

  const welcomeFlapA = Texture.fromImage('bee-drone-flap.png')
  const welcomeFlapB = Texture.fromImage('bee-drone-flop.png')
  const welcomeFlapC = Texture.fromImage('bee-drone-reference.png')
  const welcomeSplashBee = new Sprite(welcomeFlapA)
  welcomeSplashBee.scale.x = 2
  welcomeSplashBee.scale.y = 2
  welcomeSplashBee.position.x = 0
  welcomeSplashBee.position.y = 0
  container.addChild(welcomeSplashBee)

  const targetX = Math.round(WIDTH / 2 / 2) - 25
  const targetY = Math.round(HEIGHT / 2 / 2) - 7
  const points = [
    [-50, -50],
    [10, 90],
    [110, 100],
    [targetX, targetY]
  ]
  const beeBezier = new Bezier(
    ...points.flatMap(p => p)
  )

  const LUT_MAX = 250

  const fadeout = new Bezier({ x: 0, y: 0 }, { x: 0.12, y: 0.78 }, { x: 0, y: 1 }, { x: 1, y: 1 })
  const fadeoutLUT = fadeout.getLUT(LUT_MAX)

  const luts = beeBezier.getLUT(LUT_MAX)

  let counter = 0

  const interval = setInterval(() => {
    const target = Math.round(fadeoutLUT[counter].y * LUT_MAX)
    welcomeSplashBee.position.x = luts[target].x
    welcomeSplashBee.position.y = luts[target].y
    counter++

    welcomeSplashBee.texture = counter % 10 < 5 ? welcomeFlapA : welcomeFlapB

    if (counter >= LUT_MAX) {
      clearInterval(interval)
      welcomeSplashBee.texture = welcomeFlapC
    }
  }, 16.66)

  const welcomeHoney = Sprite.fromImage('honey/cell-honey-full.png')
  welcomeHoney.scale.x = 2
  welcomeHoney.scale.y = 2
  welcomeHoney.position.x = Math.round(WIDTH / 2 / 2) + 5
  welcomeHoney.position.y = Math.round(HEIGHT / 2 / 2) - 1
  container.addChild(welcomeHoney)

  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  const buttonA = Button(Math.round(WIDTH / 2 / 2 / 2) - 20, 100 + (12 * 1), '  Play', () => sceneManager.goToScene('level-select'))
  scaler.addChild(buttonA)

  const buttonB = Button(Math.round(WIDTH / 2 / 2 / 2) - 20, 100 + (12 * 2), 'Debug menu', () => sceneManager.goToScene('debug-menu'))
  scaler.addChild(buttonB)
}

export default SplashScene
