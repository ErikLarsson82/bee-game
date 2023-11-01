const DEBUG_BUTTON = false

function createGameOverUI() {
  const background = Sprite.fromImage('images/ui/game-over-background-failed.png')
  const successTexture = Texture.fromImage('images/ui/game-over-background-success.png')
  const failTexture = Texture.fromImage('images/ui/game-over-background-failed.png')
  background.position.x = 146
  background.position.y = 98
  background.visible = false

  if (DEBUG_BUTTON) {
    background.addChild(
      Button(36, 120, 'DEBUG I FINISHED THE LEVEL', () => {
        app.stage.removeChild(container)
        app.ticker.remove(gameloop)
        saveProgress(levelIndex, 10)
        setupWorldMap3(true)
      })
    )
  }

  const buttonA = Button(5, 90, 'Main Menu', () => {
    app.stage.removeChild(container)
    app.ticker.remove(gameloop)
    setupDebugMenu()
  })
  background.addChild(buttonA)

  const buttonB = Button(66, 90, 'Continue', () => {
    keepPlaying = true
    gameover = false
    background.visible = false
  })
  background.addChild(buttonB)

  addTicker('ui', () => {
    if (gameover) {
      background.visible = true

      if (levelCompleteCriteria(currentCycleIndex) && !keepPlaying) {
        buttonA.position.x = 5
        buttonB.visible = true

        saveProgress(levelIndex, year)
        background.texture = successTexture
      } else {
        buttonA.position.x = 36
        buttonB.visible = false
        background.texture = failTexture
      }
    }
  })
  ui.addChild(background)
}