
function setupMenu() {
  scene = 'menu'
  document.body.style['background-color'] = '#ffd601'
  
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const splashscreen = new Graphics()
  splashscreen.beginFill(0xffd601)
  splashscreen.drawRect(0, 0, WIDTH, HEIGHT)
  container.addChild(splashscreen)

  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  MAP_CONFIGURATIONS.forEach((map, idx) => {
    const callback = () => {
      cycles = map.cycles
      currentSeasonLength = cycles[0]
      MAP_SELECTION = map.id
      seeds = map.seeds
      winterHungerMultiplier = map.winterHungerMultiplier
      app.stage.removeChild(container)
      setupGame()
    }
    const button = Button(Math.round(WIDTH/2/2/2)-50, 40 + (idx * 20), map.name, callback, null, null, 'huge')
    scaler.addChild(button)
  })
  
}
