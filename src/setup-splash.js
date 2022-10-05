
function setupSplash() {
  scene = 'splash'
  document.body.style['background-color'] = '#fff6c5'
    
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const splashscreen = new Graphics()
  splashscreen.beginFill(0xffd601)
  splashscreen.drawRect(0, 0, WIDTH, HEIGHT)
  container.addChild(splashscreen)

  const title = new PIXI.Text('Bee Game', { ...fontConfig, ...hugeFont, fill: '#c96f10' })
  title.anchor.set(0.5, 0)
  title.position.x = Math.round(WIDTH / 2 / 2) + 8
  title.position.y = 30
  container.addChild(title)

  const catchphrase = new PIXI.Text('No bee puns guaranteed', { ...fontConfig, ...massiveFont, fill: 'black' })
  catchphrase.anchor.set(0.5, 0)
  catchphrase.position.x = Math.round(WIDTH / 2 / 2)
  catchphrase.position.y = 110
  container.addChild(catchphrase)

  const welcomeBee = Sprite.fromImage('images/bee/bee-drone-reference.png')
  welcomeBee.scale.x = 2
  welcomeBee.scale.y = 2
  welcomeBee.position.x = Math.round(WIDTH / 2 / 2) - 25
  welcomeBee.position.y = Math.round(HEIGHT / 2 / 2) - 0
  splashscreen.addChild(welcomeBee)

  const welcomeHoney = Sprite.fromImage('images/hex/honey/cell-honey-full.png')
  welcomeHoney.scale.x = 2
  welcomeHoney.scale.y = 2
  welcomeHoney.position.x = Math.round(WIDTH / 2 / 2) + 5
  welcomeHoney.position.y = Math.round(HEIGHT / 2 / 2) - 1
  splashscreen.addChild(welcomeHoney)

  const callbackA = () => {
    app.stage.removeChild(container)
    setupMenu()
  }
  const callbackB = () => {
    app.stage.removeChild(container)
    setupWorldMap()
  }
  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  const buttonA = Button(Math.round(WIDTH/2/2/2)-20, 120, '  Play', callbackA)
  scaler.addChild(buttonA)

  const buttonB = Button(Math.round(WIDTH/2/2/2)-20, 140, 'World Map', callbackB)
  scaler.addChild(buttonB)
}
