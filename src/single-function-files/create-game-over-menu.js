import { Sprite, Texture } from 'pixi.js'
import { gameover, setKeepPlaying, setGameover } from './game/game-state'
import { addTicker } from './exported-help-functions'
import { Button } from './ui'

const DEBUG_BUTTON = false

export function createGameOverUI (sceneManager, ui) {
  const background = Sprite.fromImage('images/ui/game-over-background-failed.png')
  const successTexture = Texture.fromImage('images/ui/game-over-background-success.png')
  // const failTexture = Texture.fromImage('images/ui/game-over-background-failed.png')
  background.position.x = 146
  background.position.y = 98
  background.visible = false

  if (DEBUG_BUTTON) {
    background.addChild(
      Button(36, 120, 'DEBUG I FINISHED THE LEVEL', () => {
        // Disable this and re-implement please
        /*
        app.stage.removeChild(container)
        app.ticker.remove(gameloop)
        saveProgress(levelIndex, 10)
        setupWorldMap3(true)
        */
      })
    )
  }

  const buttonA = Button(5, 90, 'Main Menu', () => {
    sceneManager.goToScene('level-select')
    // app.stage.removeChild(container)
    // app.ticker.remove(gameloop)
    // setupDebugMenu()
  })
  background.addChild(buttonA)

  const buttonB = Button(66, 90, 'Continue', () => {
    setKeepPlaying(true)
    setGameover(false)
    background.visible = false
  })
  background.addChild(buttonB)

  addTicker('ui', () => {
    if (gameover) {
      background.visible = true

      buttonA.position.x = 5
      buttonB.visible = true
      background.texture = successTexture
      // Reimplement
      /*
      if (true) {
        buttonA.position.x = 5
        buttonB.visible = true
        background.texture = successTexture
      } else {
        buttonA.position.x = 36
        buttonB.visible = false
        background.texture = failTexture
      }
      */
    }
  })
  ui.addChild(background)
}
