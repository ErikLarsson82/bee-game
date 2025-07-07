import { Graphics, Sprite, Container, Text } from 'pixi.js'
import { WIDTH, HEIGHT } from '../config'
import { loadMapParameters } from '../load-map-parameters'
import MAP_CONFIGURATIONS from '../map-configurations'

class LevelSelectScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager
  }
  init () {
    setup.bind(this)()
  }
}

function setup() {
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

  const logo = new Sprite.fromImage('test-image')
  logo.position.x = 300
  logo.position.y = 200
  container.addChild(logo)

  for (let i = 0; i < 3; i++) {
    const ui = new Sprite.fromImage('ui-box')
    ui.position.x = 10 + (i * 130)
    ui.position.y = 50
    ui.alpha = 0.2
    ui.interactive = true
    ui.mouseover = () => {
      ui.alpha = 1
    }
    ui.mouseout = () => {
      ui.alpha = 0.2
    }
    ui.mouseup = () => {
      loadMapParameters(MAP_CONFIGURATIONS[i], i)
      sceneManager.goToScene('game')
    }
    container.addChild(ui)
  }
}

export default LevelSelectScene
