
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

  const text = new Container()
  container.addChild(text)

  const title = new PIXI.Text('Bee Game', { ...fontConfig, ...hugeFont, fill: '#c96f10' })
  title.anchor.set(0.5, 0)
  title.position.x = Math.round(WIDTH / 2 / 2) + 8
  title.position.y = 30
  text.addChild(title)

  const catchphrase = new PIXI.Text('No bee puns guaranteed', { ...fontConfig, ...massiveFont, fill: 'black' })
  catchphrase.anchor.set(0.5, 0)
  catchphrase.position.x = Math.round(WIDTH / 2 / 2)
  catchphrase.position.y = 110
  text.addChild(catchphrase)

  const welcomeFlapA = Texture.fromImage('images/bee/bee-drone-flap.png')
  const welcomeFlapB = Texture.fromImage('images/bee/bee-drone-flop.png')
  const welcomeFlapC = Texture.fromImage('images/bee/bee-drone-reference.png')
  const welcomeBee = new Sprite(welcomeFlapA)
  welcomeBee.scale.x = 2
  welcomeBee.scale.y = 2
  welcomeBee.position.x = 0
  welcomeBee.position.y = 0
  container.addChild(welcomeBee)

  const targetX = Math.round(WIDTH / 2 / 2) - 25
  const targetY = Math.round(HEIGHT / 2 / 2) - 7
  const points = [
    [-50, -50],
    [10, 90],
    [110, 100],
    [targetX, targetY],
  ]
  points.forEach(point => {
    return
    const [x, y] = point
    const p = new Graphics()
    p.beginFill(0xff0000)
    p.drawRect(x, y, 2, 2)
    container.addChild(p)
  })
  const beeBezier = new Bezier(
    ...points.flatMap(p => p)
  )

  const LUT_MAX = 250

  const fadeout = new Bezier({ x: 0, y: 0 }, { x: 0.12, y: 0.78 }, { x: 0, y: 1 }, { x: 1, y: 1 })
  const fadeoutLUT = fadeout.getLUT(LUT_MAX)

  const luts = beeBezier.getLUT(LUT_MAX)
  
  let counter = 0

  const interval = setInterval(() => {
    const target = Math.round(fadeoutLUT[counter].y * LUT_MAX)
    welcomeBee.position.x = luts[target].x
    welcomeBee.position.y = luts[target].y
    counter++

    welcomeBee.texture = counter % 10 < 5 ? welcomeFlapA : welcomeFlapB
    
    if (counter >= LUT_MAX) {
      clearInterval(interval)
      welcomeBee.texture = welcomeFlapC
    }
  }, 16.66)

  const welcomeHoney = Sprite.fromImage('images/hex/honey/cell-honey-full.png')
  welcomeHoney.scale.x = 2
  welcomeHoney.scale.y = 2
  welcomeHoney.position.x = Math.round(WIDTH / 2 / 2) + 5
  welcomeHoney.position.y = Math.round(HEIGHT / 2 / 2) - 1
  container.addChild(welcomeHoney)

  const callbackA = () => {
    app.stage.removeChild(container)
    setupMenu()
  }
  const callbackB = () => {
    app.stage.removeChild(container)
    setupWorldMap2()
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
