import { WIDTH, HEIGHT } from '../config'
import { Container, Graphics, Sprite } from 'pixi.js'
import { Button } from '../ui'
import { loadMapParameters } from '../load-map-parameters'
import MAP_CONFIGURATIONS from '../map-configurations'

class LevelSelectScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager
  }

  init () {
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

    const buttonLevelOne = Button(70, 20, Sprite.fromImage('images/ui/button-large/button-large-content-level-1.png'), () => {
      showPopup()
    }, null, null, 'large')
    container.addChild(buttonLevelOne)

    const buttonDimA = Sprite.fromImage('button-large/button-large-standard.png')
    buttonDimA.position.x = 110
    buttonDimA.position.y = 20
    buttonDimA.alpha = 0.2
    container.addChild(buttonDimA)

    const buttonDimB = Sprite.fromImage('button-large/button-large-standard.png')
    buttonDimB.position.x = 150
    buttonDimB.position.y = 20
    buttonDimB.alpha = 0.2
    container.addChild(buttonDimB)

    const buttonLevelTwo = Button(70, 110, Sprite.fromImage('images/ui/button-large/button-large-content-level-1.png'), () => {
      showPopup()
    }, null, null, 'large')
    container.addChild(buttonLevelTwo)

    const tutorialText = Sprite.fromImage('images/ui/text/tutorial.png')
    tutorialText.position.x = 80
    tutorialText.position.y = 10
    container.addChild(tutorialText)

    const campaignText = Sprite.fromImage('images/ui/text/campaign.png')
    campaignText.position.x = 80
    campaignText.position.y = 100
    container.addChild(campaignText)

    const sandboxText = Sprite.fromImage('images/ui/text/sandbox.png')
    sandboxText.position.x = 80
    sandboxText.position.y = 190
    container.addChild(sandboxText)

    const dimmer = new Graphics()
    dimmer.beginFill(0xffd601)
    dimmer.drawRect(0, 0, WIDTH, HEIGHT)
    dimmer.alpha = 0
    container.addChild(dimmer)

    const popup = Sprite.fromImage('images/ui/level-select/level-select-popup.png')
    popup.position.x = 100
    popup.position.y = 30
    popup.visible = false
    container.addChild(popup)

    const buttonCancel = Button(10, 215, Sprite.fromImage('images/ui/button-large/button-large-content-cancel.png'), () => {
      hidePopup()
    }, null, null, 'large')
    popup.addChild(buttonCancel)

    const buttonPlay = Button(150, 215, Sprite.fromImage('images/ui/button-large/button-large-content-play.png'), () => {
      loadMapParameters(MAP_CONFIGURATIONS[0], 0)
      sceneManager.goToScene('game')
    }, null, null, 'large')
    popup.addChild(buttonPlay)

    const objective = Sprite.fromImage('images/ui/level-select/objective-survive-one-winter.png')
    objective.position.x = 28
    objective.position.y = 62
    popup.addChild(objective)

    const difficulty = Sprite.fromImage('images/ui/level-select/difficulty-medium.png')
    difficulty.position.x = 72
    difficulty.position.y = 110
    popup.addChild(difficulty)

    const preview = Sprite.fromImage('images/layout-preview/level-1.png')
    preview.position.x = 75
    preview.position.y = 166
    preview.scale.set(0.3, 0.3)
    popup.addChild(preview)

    function showPopup () {
      popup.visible = true
      dimmer.alpha = 0.8
    }

    function hidePopup () {
      popup.visible = false
      dimmer.alpha = 0
    }
  }
}

export default LevelSelectScene
