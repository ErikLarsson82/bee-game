
function createGameOverUI() {
  const background = Sprite.fromImage('images/ui/game-over-background.png')
  background.position.x = 146
  background.position.y = 98
  background.visible = false

  background.addChild(
  	Button(36, 90, 'Main Menu', () => {
      app.stage.removeChild(container)
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