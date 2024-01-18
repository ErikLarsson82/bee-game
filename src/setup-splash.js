
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

  const logo = new Sprite.fromImage('images/splash/logo.png')
  logo.position.x = 10
  logo.position.y = 50
  container.addChild(logo)

  const welcomeFlapA = Texture.fromImage('images/bee/bee-drone-flap.png')
  const welcomeFlapB = Texture.fromImage('images/bee/bee-drone-flop.png')
  const welcomeFlapC = Texture.fromImage('images/bee/bee-drone-reference.png')
  const welcomeSplashBee = new Sprite(welcomeFlapA)
  welcomeSplashBee.scale.x = 2
  welcomeSplashBee.scale.y = 2
  welcomeSplashBee.position.x = 0
  welcomeSplashBee.position.y = 0
  container.addChild(welcomeSplashBee)

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
    welcomeSplashBee.position.x = luts[target].x
    welcomeSplashBee.position.y = luts[target].y
    counter++

    welcomeSplashBee.texture = counter % 10 < 5 ? welcomeFlapA : welcomeFlapB
    
    if (counter >= LUT_MAX) {
      clearInterval(interval)
      welcomeSplashBee.texture = welcomeFlapC
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
    setupDebugMenu()
  }
  const callbackB = () => {
    app.stage.removeChild(container)
    setupWorldMap()
  }
  const callbackC = () => {
    app.stage.removeChild(container)
    setupWorldMap2()
  }
  const callbackD = () => {
    // This is the "official" one
    app.stage.removeChild(container)
    setupWorldMap3()
  }
  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  
  // const buttonA = Button(Math.round(WIDTH/2/2/2)-20, 100 + (12 * 0), '  Play', callbackA)
  // scaler.addChild(buttonA)

  const buttonB = Button(Math.round(WIDTH/2/2/2)-20, 100 + (12 * 0), 'World Map', setupWorldMap3)
  scaler.addChild(buttonB)
  
  // const buttonC = Button(Math.round(WIDTH/2/2/2)-20, 100 + (12 * 2), 'World Map 2', callbackC)
  // scaler.addChild(buttonC)
  
  // const buttonD = Button(Math.round(WIDTH/2/2/2)-20, 100 + (12 * 1), 'World Map 1', callbackB)
  // scaler.addChild(buttonD)

}
