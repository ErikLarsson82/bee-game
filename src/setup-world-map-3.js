
const DEBUG_MAP_ANIMATION = false

const levels = [
  {
    name: 'Green fields',
    placement:
      {
        x: 98,
        y: 306
      },
    camera:
      {
        x: 0,
        y: 157,
      }
  },
  {
    name: 'Green gone cold',
    placement:
      {
        x: 113,
        y: 233
      },
    camera:
      {
        x: 0,
        y: 135
      }
  },
  {
    name: 'Desert haze',
    placement:
      {
        x: 155,
        y: 169
      },
    camera:
      {
        x: 30,
        y: 50
      }
  },
  {
    name: 'Blizzard winter',
    placement:
      {
        x: 212,
        y: 136
      },
    camera:
      {
        x: 60,
        y: 0
      }
  }

]

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

const easeInOutButFasterAnimation = new Bezier(
  ...[
    [0, 0],
    [0.59, 0.21],
    [0.67, 0.89],
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

  levelIndex = getLastPlayedLevel(levelIndex)
  let startIntroAnimation = levelIndex === -1
  if (levelIndex === -1) levelIndex = 0
  let animating = false
  let beeIsAtIndex = null
  let lastPos = 0
  let speed = false

  const mapImage = Sprite.fromImage('images/world-map-3/temp-ref.png')
  mapImage.interactive = true
  mapImage.mousedown = (e) => {
    speed = true
    console.log('Mouse Click Position', e.data.global.x / 2, e.data.global.y / 2);
  }
  mapImage.mouseup = () => {
    speed = false
  }
  container.addChild(mapImage)

  const levelSelect = Sprite.fromImage('images/world-map-3/level-select.png')
  levelSelect.visible = false
  container.addChild(levelSelect)

  const levelTextures = [
    Texture.fromImage('images/world-map-3/level-1-label.png'),
    Texture.fromImage('images/world-map-3/level-2-label.png'),
    Texture.fromImage('images/world-map-3/level-3-label.png'),
    Texture.fromImage('images/world-map-3/level-4-label.png'),
  ]
  const levelLabel = new Sprite(levelTextures[beeIsAtIndex])
  levelLabel.position.x = 31
  levelLabel.position.y = 9
  levelSelect.addChild(levelLabel)

  const levelCompleted = Sprite.fromImage('images/world-map-3/checkmark.png')
  levelCompleted.position.x = 10
  levelCompleted.position.y = 10
  levelCompleted.visible = false
  levelSelect.addChild(levelCompleted)

  const levelText = new PIXI.Text('-', { ...fontConfig, ...smallFont, fill: colors.orange })
  levelText.position.x = 21
  levelText.position.y = 25
  levelSelect.addChild(levelText)

  const levelYearLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont, fill: 'white' })
  levelYearLabel.position.x = 21
  levelYearLabel.position.y = 34
  levelSelect.addChild(levelYearLabel)

  const levelPreviewTextures = [
    Texture.fromImage('images/world-map-3/preview-level-1.png'),
    Texture.fromImage('images/world-map-3/preview-level-2.png'),
    Texture.fromImage('images/world-map-3/preview-level-3.png'),
    Texture.fromImage('images/world-map-3/preview-level-4.png'),
  ]
  const levelPreview = new Sprite(levelPreviewTextures[beeIsAtIndex])
  levelPreview.position.x = 10
  levelPreview.position.y = 40
  levelPreview.width = 100
  levelPreview.height = 50
  levelSelect.addChild(levelPreview)

  const callback = () => {
    const map = MAP_CONFIGURATIONS[beeIsAtIndex]
    loadMapParameters(map, beeIsAtIndex)
    app.stage.removeChild(container)
    setupGame()
  }
  const button = Button(39, 91, 'Play', callback)
  levelSelect.addChild(button)

  const welcomeFlapA = Texture.fromImage('images/bee/bee-drone-flap.png')
  const welcomeFlapB = Texture.fromImage('images/bee/bee-drone-flop.png')
  const welcomeFlapC = Texture.fromImage('images/bee/bee-drone-reference.png')
  const welcomeBee = new Sprite(welcomeFlapA)
  welcomeBee.position.x = 0
  welcomeBee.position.y = 0
  welcomeBee.anchor.set(0.5, 1)

  const reset = () => {
    welcomeBee.texture = welcomeFlapC
    levelSelect.visible = true
    levelLabel.texture = levelTextures[beeIsAtIndex]
    levelPreview.texture = levelPreviewTextures[beeIsAtIndex]
    levelText.text = levels[beeIsAtIndex].name
    levelYearLabel.text = getLevelProgress(beeIsAtIndex) === -1 ? '' : `Year record: ${ getLevelProgress(beeIsAtIndex) }`
    levelCompleted.visible = getLevelProgress(beeIsAtIndex) !== -1
    levelSelect.position.x = levels[beeIsAtIndex].placement.x + 70
    levelSelect.position.y = levels[beeIsAtIndex].placement.y - 20

    welcomeBee.position.x = levels[beeIsAtIndex].placement.x
    welcomeBee.position.y = levels[beeIsAtIndex].placement.y

    container.position.x = 0 - levels[beeIsAtIndex].camera.x
    container.position.y = 0 - levels[beeIsAtIndex].camera.y
  }
  
  levels.forEach((level, idx) => {
    const coins = {
      dim: new Texture.fromImage('images/world-map-3/coin-dim.png'),
      standard: new Texture.fromImage('images/world-map-3/coin.png'),
      hover: new Texture.fromImage('images/world-map-3/coin-hover.png'),
      click: new Texture.fromImage('images/world-map-3/coin-click.png'),
    }
    const levelSprite = new Sprite(coins.standard)
    const isLocked = idx > 0 && getLevelProgress(idx-1) === -1
    if (isLocked) {
      levelSprite.texture = coins.dim
    }
    levelSprite.position.x = level.placement.x
    levelSprite.position.y = level.placement.y
    levelSprite.anchor.set(0.5, 0.5)
    levelSprite.interactive = !isLocked
    levelSprite.buttonMode = !isLocked
    levelSprite.mouseover = () => {
      if (animating || isLocked || idx === beeIsAtIndex) return
      levelSprite.texture = coins.hover
    }
    levelSprite.mouseout = () => {
      if (isLocked) return
      levelSprite.texture = coins.standard
    }
    levelSprite.mousedown = () => {
      if (animating || isLocked || idx === beeIsAtIndex) return
      levelSprite.texture = coins.click
      animating = true

      const PAN_ANIM_DURATION = 200
      let mapPanAnimationCounter = 0
      const mapPanAnimationInterval = setInterval(() => {
        levelSelect.visible = false
        const beeAnimationPoints = [
          [levels[beeIsAtIndex].placement.x, levels[beeIsAtIndex].placement.y],
          [levels[beeIsAtIndex].placement.x, levels[beeIsAtIndex].placement.y],
          [levels[idx].placement.x, levels[idx].placement.y],
          [levels[idx].placement.x, levels[idx].placement.y],
        ]
        const beeBetweenLevelsAnimation = new Bezier(
          ...beeAnimationPoints.flatMap(p => p)
        )
        const beeBetweenPositionInterpolation = generateBezierLUTS(beeBetweenLevelsAnimation, easeInOutButFasterAnimation, PAN_ANIM_DURATION)

        welcomeBee.texture = mapPanAnimationCounter % 10 < 5 ? welcomeFlapA : welcomeFlapB
        const goingLeft = beeBetweenPositionInterpolation[mapPanAnimationCounter].x > lastPos
        welcomeBee.scale.x = goingLeft ? 1 : -1
        lastPos = beeBetweenPositionInterpolation[mapPanAnimationCounter].x

        welcomeBee.position.x = beeBetweenPositionInterpolation[mapPanAnimationCounter].x
        welcomeBee.position.y = beeBetweenPositionInterpolation[mapPanAnimationCounter].y

        const cameraAnimationPoints = [
          [levels[beeIsAtIndex].camera.x, levels[beeIsAtIndex].camera.y],
          [levels[beeIsAtIndex].camera.x, levels[beeIsAtIndex].camera.y],
          [levels[idx].camera.x, levels[idx].camera.y],
          [levels[idx].camera.x, levels[idx].camera.y],
        ]
        const cameraBetweenLevelsAnimation = new Bezier(
          ...cameraAnimationPoints.flatMap(p => p)
        )
        const cameraBetweenPositionInterpolation = generateBezierLUTS(cameraBetweenLevelsAnimation, easeInOutAnimation, PAN_ANIM_DURATION)

        container.position.x = 0 - Math.round(cameraBetweenPositionInterpolation[mapPanAnimationCounter].x)
        container.position.y = 0 - Math.round(cameraBetweenPositionInterpolation[mapPanAnimationCounter].y)

        mapPanAnimationCounter++
        if (mapPanAnimationCounter >= PAN_ANIM_DURATION) {
          beeIsAtIndex = idx
          clearInterval(mapPanAnimationInterval)
          animating = false
          reset()          
        }
      }, 16.66)
    }
    container.addChild(levelSprite)
  })

  container.addChild(welcomeBee) // after level icons

  const ANIM_DURATION = 500
  
  const points = [
    [210, 0],
    [110, 200],
    [levels[0].camera.x + 50, levels[0].camera.y],
    [levels[0].camera.x, levels[0].camera.y],
  ]
  const worldMapAnimation = new Bezier(
    ...points.flatMap(p => p)
  )
  const mapPositionInterpolation = generateBezierLUTS(worldMapAnimation, easeInOutAnimation, ANIM_DURATION)

  const points2 = [
    [300, 100],
    [150, 20],
    [levels[0].placement.x + 100, levels[0].placement.y],
    [levels[0].placement.x, levels[0].placement.y],    
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
      p.beginFill(0x440000)
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
  
  let counter = 0
  
  if (startIntroAnimation) {
    if (DEBUG_MAP_ANIMATION) return
    const interval = setInterval(() => {
      levelSelect.visible = false
      const cappedCounter = Math.min(counter, ANIM_DURATION)
      welcomeBee.texture = cappedCounter % 10 < 5 ? welcomeFlapA : welcomeFlapB
      const goingLeft = beePositionInterpolation[cappedCounter].x > lastPos
      welcomeBee.scale.x = goingLeft ? 1 : -1
      lastPos = beePositionInterpolation[cappedCounter].x
      welcomeBee.position.x = beePositionInterpolation[cappedCounter].x
      welcomeBee.position.y = beePositionInterpolation[cappedCounter].y
      container.position.x = 0 - mapPositionInterpolation[cappedCounter].x
      container.position.y = 0 - mapPositionInterpolation[cappedCounter].y
      counter++
      if (counter >= ANIM_DURATION) {
        clearInterval(interval)
        beeIsAtIndex = 0
        reset()
      }
    }, 16.66)
  } else {
    beeIsAtIndex = levelIndex
    reset()
  }

  const dirs = [false, false, false, false]
  
  setInterval(() => {
    if (speed) counter = counter + 40
    if (dirs[0]) container.position.y += 10
    if (dirs[1]) container.position.y -= 10
    if (dirs[2]) container.position.x += 10
    if (dirs[3]) container.position.x -= 10
  }, 16.66)

  window.addEventListener('keydown', e => {
    if (e.keyCode === 49) {
      container.position.x = 0 - levels[0].camera.x
      container.position.y = 0 - levels[0].camera.y
    }
    if (e.keyCode === 50) {
      container.position.x = 0 - levels[1].camera.x
      container.position.y = 0 - levels[1].camera.y
    }
    if (e.keyCode === 51) {
      container.position.x = 0 - levels[2].camera.x
      container.position.y = 0 - levels[2].camera.y
    }
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
