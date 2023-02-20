const DEBUG_BUTTON = false

function createGameOverUI() {
  const background = Sprite.fromImage('images/ui/game-over-background-failed.png')
  const successTexture = Texture.fromImage('images/ui/game-over-background-success.png')
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

  background.addChild(
  	Button(5, 90, 'Main Menu', () => {
      app.stage.removeChild(container)
      app.ticker.remove(gameloop)
      setupWorldMap3()
    })
  )

  background.addChild(
    Button(66, 90, 'Continue', () => {
      keepPlaying = true
      gameover = false
      background.visible = false
    })
  )

  addTicker('ui', () => {
    if (gameover) {
    	background.visible = true

      if (levelCompleteCriteria(currentCycleIndex)) {
        saveProgress(levelIndex, year)
        background.texture = successTexture
      }
    }
  })
  ui.addChild(background)
}