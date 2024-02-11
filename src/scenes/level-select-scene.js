import { WIDTH, HEIGHT } from '../config'
import { Container, Graphics, Sprite } from 'pixi.js'
import { placement } from '../exported-help-functions'
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

    const worldMapBackground = Sprite.fromImage('images/world-map-3/beegame_map_clean.png')
    container.addChild(worldMapBackground)

    MAP_CONFIGURATIONS.filter(x => x.display === 'tutorial')
      .forEach((_, idx) => {
        const x = 70 + (idx * 20)
        const button = Button(x, 20, Sprite.fromImage(`images/ui/button-large/button-large-content-level-${idx}.png`), () => {
          showPopup()
        }, null, null, 'large')
        container.addChild(button)
      })

    MAP_CONFIGURATIONS.filter(x => x.display === 'campaign')
      .forEach((_, idx) => {
        const x = 70 + (idx * 50)
        const button = Button(x, 110, Sprite.fromImage(`images/ui/button-large/button-large-content-level-${idx + 1}.png`), () => {
          showPopup()
        }, null, null, 'large')
        if (idx > 0) {
          button.alpha = 0.3
          button.interactive = false
          button.buttonMode = false
        }
        container.addChild(button)
      })

    MAP_CONFIGURATIONS.filter(x => x.display === 'sandbox')
      .forEach((_, idx) => {
        const x = 70 + (idx * 50)
        const button = Button(x, 110, Sprite.fromImage(`images/ui/button-large/button-large-content-level-${idx + 1}.png`), () => {
          showPopup()
        }, null, null, 'large')
        container.addChild(button)
      })

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
