
function createGameOverUI() {
  const background = Sprite.fromImage('images/ui/game-over-background.png')
  background.position.x = 146
  background.position.y = 98
  background.visible = false

  background.addChild(
    Button(36, 120, 'DEBUG I FINISHED THE LEVEL', () => {
      app.stage.removeChild(container)
      app.ticker.remove(gameloop)
      saveProgress(levelIndex, 10)
      setupWorldMap3(true)
    })
  )

  background.addChild(
  	Button(36, 90, 'Main Menu', () => {
      app.stage.removeChild(container)
      app.ticker.remove(gameloop)
      setupWorldMap3()
    })
  )

  addTicker('ui', () => {
    if (gameover) {
    	background.visible = true
    }
  })
  ui.addChild(background)
}