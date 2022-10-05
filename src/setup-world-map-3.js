
const DEBUG_MAP_ANIMATION = false

const linearAnimation = new Bezier(
  ...[
    [0, 0],
    [0.5, 0.5],
    [0.5, 0.5],
    [1, 1],
  ].flatMap(p => p)
)

const easeOutAnimation = new Bezier(
  ...[
    [0, 0],
    [0, 1],
    [0, 1],
    [1, 1],
  ].flatMap(p => p)
)

const easeInOutAnimation = new Bezier(
  ...[
    [0, 0],
    [0.59, 0.21],
    [0, 1],
    [1, 1],
  ].flatMap(p => p)
)

function setupWorldMap3() {
  scene = 'world-map-3'
  document.body.style['background-color'] = '#fff6c5'
  
  const container = new Container()
  container.scale.x = DEBUG_MAP_ANIMATION ? 0.4 : 2
  container.scale.y = DEBUG_MAP_ANIMATION ? 0.4 : 2
  app.stage.addChild(container)

  const mapImage = Sprite.fromImage('images/world-map-3/sample.png')
  container.addChild(mapImage)

  const welcomeFlapA = Texture.fromImage('images/bee/bee-drone-flap.png')
  const welcomeFlapB = Texture.fromImage('images/bee/bee-drone-flop.png')
  const welcomeFlapC = Texture.fromImage('images/bee/bee-drone-reference.png')
  const welcomeBee = new Sprite(welcomeFlapA)
  welcomeBee.scale.x = 2
  welcomeBee.scale.y = 2
  welcomeBee.position.x = 0
  welcomeBee.position.y = 0
  welcomeBee.anchor.set(0.5, 0)
  container.addChild(welcomeBee)

  const ANIM_DURATION = 700
  
  const points = [
    [300, 500],
    [800, 500],
    [400, 130],
    [160, 130],
  ]
  const worldMapAnimation = new Bezier(
    ...points.flatMap(p => p)
  )
  const mapPositionInterpolation = generateBezierLUTS(worldMapAnimation, easeInOutAnimation, ANIM_DURATION)

  const points2 = [
    [120, 400],
    [800, 500],
    [400, 130],
    [160, 140],
  ]
  const beeAnimation = new Bezier(
    ...points2.flatMap(p => p)
  )
  const beePositionInterpolation = generateBezierLUTS(beeAnimation, easeInOutAnimation, ANIM_DURATION)

  let animTarget, animTarget2

  if (DEBUG_MAP_ANIMATION) {
    mapPositionInterpolation.forEach(({ x, y }) => {
      const p = new Graphics()
      p.beginFill(0x00ff00)
      p.drawRect(x, y, 10, 10)
      container.addChild(p)
    })

    beePositionInterpolation.forEach(({ x, y }) => {
      const p = new Graphics()
      p.beginFill(0x00f000)
      p.drawRect(x, y, 10, 10)
      container.addChild(p)
    })

    points.forEach(point => {
      const [x, y] = point
      const p = new Graphics()
      p.beginFill(0xff0000)
      p.drawRect(x, y, 10, 10)
      container.addChild(p)
    })

    points2.forEach(point => {
      const [x, y] = point
      const p = new Graphics()
      p.beginFill(0xfc0000)
      p.drawRect(x, y, 10, 10)
      container.addChild(p)
    })

    animTarget = new Graphics()
    animTarget.beginFill(0x0000ff)
    animTarget.drawRect(0, 0, 10, 10)
    container.addChild(animTarget)

    animTarget2 = new Graphics()
    animTarget2.beginFill(0x0000ff)
    animTarget2.drawRect(0, 0, 10, 10)
    container.addChild(animTarget2)
  }
  

  let animCounter = 0
  setInterval(() => {
    if (!DEBUG_MAP_ANIMATION) return
    animTarget.position.x = mapPositionInterpolation[animCounter].x
    animTarget.position.y = mapPositionInterpolation[animCounter].y
    animTarget2.position.x = beePositionInterpolation[animCounter].x
    animTarget2.position.y = beePositionInterpolation[animCounter].y
    animCounter++
    if (animCounter > ANIM_DURATION) animCounter = 0
  }, 16.66)
  
  let counter = 1
  let lastPos = 0
  const interval = setInterval(() => {
    if (DEBUG_MAP_ANIMATION) return
    const cappedCounter = Math.min(counter, ANIM_DURATION)
    welcomeBee.texture = cappedCounter % 10 < 5 ? welcomeFlapA : welcomeFlapB
    const goingLeft = beePositionInterpolation[cappedCounter].x > lastPos
    welcomeBee.scale.x = goingLeft ? 2 : -2
    lastPos = beePositionInterpolation[cappedCounter].x
    welcomeBee.position.x = beePositionInterpolation[cappedCounter].x
    welcomeBee.position.y = beePositionInterpolation[cappedCounter].y
    container.position.x = 0 - mapPositionInterpolation[cappedCounter].x
    container.position.y = 0 - mapPositionInterpolation[cappedCounter].y
    counter++
    if (counter >= ANIM_DURATION) {
      clearInterval(interval)
      welcomeBee.texture = welcomeFlapC
    }
  }, 16.66)

  const dirs = [false, false, false, false]
  let speed = false

  setInterval(() => {
    if (speed) counter = counter + 100
    if (dirs[0]) mapImage.position.y += 10
    if (dirs[1]) mapImage.position.y -= 10
    if (dirs[2]) mapImage.position.x += 10
    if (dirs[3]) mapImage.position.x -= 10
  }, 16.66)

  window.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
      speed = true
    }
    if (e.keyCode === 87) {
      dirs[0] = true
    }
    if (e.keyCode === 83) {
      dirs[1] = true
    }
    if (e.keyCode === 65) {
      dirs[2] = true
    }
    if (e.keyCode === 68) {
      dirs[3] = true      
    }
  })
  window.addEventListener('keyup', e => {
    if (e.keyCode === 13) {
      speed = false
    }
    if (e.keyCode === 87) {
      dirs[0] = false
    }
    if (e.keyCode === 83) {
      dirs[1] = false
    }
    if (e.keyCode === 65) {
      dirs[2] = false
    }
    if (e.keyCode === 68) {
      dirs[3] = false      
    }
  })
}


function generateBezierLUTS(originBezierCurve, temporalBezier, amount) {
  let output = []
  for (var i = 0; i < amount; i++) {
    const t = i / amount
    const { y } = temporalBezier.compute(t)
    const calc = originBezierCurve.compute(y)
    output.push({ x: calc.x, y: calc.y })
  }
  const calc2 = originBezierCurve.compute(1)
  output.push({ x: calc2.x, y: calc2.y })
  return output
}

/*
const points = [
  [0, 0],
  [0, 1],
  [0, 1],
  [1, 1],
]
const linearAnimation = new Bezier(
  ...[
  [0, 0],
  [0, 1],
  [0, 1],
  [1, 1],
].flatMap(p => p)
)
const points2 = [
  [100, 25],
  [10, 90],
  [110, 110],
  [150, 195],
]
const outputcurve = new Bezier(
  ...points2.flatMap(p => p)
)

const result = generateBezierLUTS(outputcurve, linearAnimation, 100)
console.log(result)
*/