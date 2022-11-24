
const DEBUG_MAP_ANIMATION = false

const levels = [
  {
    name: 'Green fields',
    placement:
      {
        x: 236,
        y: 241
      },
    camera:
      {
        x: 0,
        y: 157,
      },
    shitcoins: [
      { x: 233, y: 256 },
      { x: 226, y: 269 },
      { x: 218, y: 281 },
      { x: 205, y: 290 },
      { x: 191, y: 296 },
      { x: 176, y: 295 },
      { x: 163, y: 288 },
      { x: 155, y: 276 },
      { x: 149, y: 264 },
    ]
  },
  {
    name: 'Green gone cold',
    placement:
      {
        x: 145,
        y: 252
      },
    camera:
      {
        x: 0,
        y: 135
      },
    shitcoins: [
      { x: 140, y: 239 },
      { x: 138, y: 227 },
      { x: 142, y: 216 },
      { x: 145, y: 204 },
      { x: 152, y: 192 },
    ]
  },
  {
    name: 'Desert haze',
    placement:
      {
        x: 160,
        y: 179
      },
    camera:
      {
        x: 30,
        y: 50
      },
    shitcoins: [
      { x: 169, y: 168 },
      { x: 178, y: 159 },
      { x: 183, y: 148 },
      { x: 189, y: 138 },
      { x: 197, y: 128 },
      { x: 204, y: 118 },
    ]
  },
  {
    name: 'Blizzard winter',
    placement:
      {
        x: 213,
        y: 108
      },
    camera:
      {
        x: 60,
        y: 0
      },
    shitcoins: []
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

const litTexture = new Texture.fromImage('images/world-map-3/shitcoin.png')

const coinTextures = {
  dim: new Texture.fromImage('images/world-map-3/coin-dim.png'),
  standard: new Texture.fromImage('images/world-map-3/coin.png'),
  hover: new Texture.fromImage('images/world-map-3/coin-hover.png'),
  click: new Texture.fromImage('images/world-map-3/coin-click.png'),
}

const flapTextures = {
  a: Texture.fromImage('images/bee/bee-drone-flap.png'),
  b: Texture.fromImage('images/bee/bee-drone-flop.png'),
  c: Texture.fromImage('images/bee/bee-drone-reference.png')
}

let animating = false
let beeIsAtIndex = null
let welcomeBee = null
let lastPos = null
let worldMapContainer = null
let levelSelect = null

function setupWorldMap3(levelFinished) {
  scene = 'world-map-3'
  document.body.style['background-color'] = '#fff6c5'
  
  worldMapContainer = new Container()
  worldMapContainer.scale.x = DEBUG_MAP_ANIMATION ? 0.4 : 2
  worldMapContainer.scale.y = DEBUG_MAP_ANIMATION ? 0.4 : 2
  app.stage.addChild(worldMapContainer)

  levelIndex = getLastPlayedLevel(levelIndex)
  let startIntroAnimation = levelIndex === -1
  if (levelIndex === -1) levelIndex = 0
  lastPos = 0
  let speed = false

  const mapImage = Sprite.fromImage('images/world-map-3/beegame_map.png')
  mapImage.interactive = true
  mapImage.mousedown = (e) => {
    speed = true
    console.log('Mouse Click Position', e.data.global.x / 2, e.data.global.y / 2);
  }
  mapImage.mouseup = () => {
    speed = false
  }
  worldMapContainer.addChild(mapImage)

  const deadLandSprites = []

  for (var i = 1; i <= 4; i++) {
    const deadLand = Sprite.fromImage(`images/world-map-3/beegame_map_${i}.png`)
    deadLand.alpha = 0
    worldMapContainer.addChild(deadLand)

    if (getLevelProgress(i-1) !== -1) {
      deadLand.alpha = 1
    }

    deadLandSprites.push(deadLand)
  }
  
  levelSelect = Sprite.fromImage('images/world-map-3/level-select.png')
  levelSelect.visible = false
  worldMapContainer.addChild(levelSelect)

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
    app.stage.removeChild(worldMapContainer)
    setupGame()
  }
  const button = Button(39, 91, 'Play', callback)
  levelSelect.addChild(button)

  levelSelect.setSelect = () => {
    levelSelect.visible = true
    levelLabel.texture = levelTextures[beeIsAtIndex]
    levelPreview.texture = levelPreviewTextures[beeIsAtIndex]
    levelText.text = levels[beeIsAtIndex].name
    levelYearLabel.text = getLevelProgress(beeIsAtIndex) === -1 ? '' : `Year record: ${ getLevelProgress(beeIsAtIndex) }`
    levelCompleted.visible = getLevelProgress(beeIsAtIndex) !== -1
    levelSelect.position.x = levels[beeIsAtIndex].placement.x + 70
    levelSelect.position.y = levels[beeIsAtIndex].placement.y - 20
  }

  welcomeBee = new Sprite(flapTextures.a)
  welcomeBee.position.x = 0
  welcomeBee.position.y = 0
  welcomeBee.anchor.set(0.5, 1)

  const shitcoins = []

  const coins = levels.map((level, idx) => {
    shitcoins.push(
      level.shitcoins.map(shit => {
        const shitSprite = new Sprite.fromImage('images/world-map-3/shitcoin-dim.png')
        shitSprite.position.x = shit.x
        shitSprite.position.y = shit.y
        shitSprite.anchor.set(0.5, 0.5)

        // If these coins have been unlocked and was not just now unlocked, show as lit (otherwise, some other code will animate the unlocking)
        if (getLevelProgress(idx) !== -1 && !(levelFinished && beeIsAtIndex === idx)) {
          shitSprite.texture = litTexture
        }
        worldMapContainer.addChild(shitSprite)

        return shitSprite
      })
    )
    const levelSprite = new Sprite.fromImage('images/world-map-3/coin.png')
    levelSprite.position.x = level.placement.x
    levelSprite.position.y = level.placement.y
    levelSprite.anchor.set(0.5, 0.5)

    levelSprite.levelData = level
    levelSprite.levelIdx = idx

    activateLevel(levelSprite, idx)
    
    worldMapContainer.addChild(levelSprite)

    return levelSprite
  })

  worldMapContainer.addChild(welcomeBee) // after level icons

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
      worldMapContainer.addChild(p)
    })

    beePositionInterpolation.forEach(({ x, y }) => {
      const p = new Graphics()
      p.beginFill(0x00f000)
      p.drawRect(x, y, 10, 10)
      worldMapContainer.addChild(p)
    })

    points.forEach(point => {
      const [x, y] = point
      const p = new Graphics()
      p.beginFill(0xff0000)
      p.drawRect(x, y, 10, 10)
      worldMapContainer.addChild(p)
    })

    points2.forEach(point => {
      const [x, y] = point
      const p = new Graphics()
      p.beginFill(0x440000)
      p.drawRect(x, y, 10, 10)
      worldMapContainer.addChild(p)
    })

    animTarget = new Graphics()
    animTarget.beginFill(0x0000ff)
    animTarget.drawRect(0, 0, 10, 10)
    worldMapContainer.addChild(animTarget)

    animTarget2 = new Graphics()
    animTarget2.beginFill(0x0000ff)
    animTarget2.drawRect(0, 0, 10, 10)
    worldMapContainer.addChild(animTarget2)
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
      welcomeBee.texture = cappedCounter % 10 < 5 ? flapTextures.a : flapTextures.b
      const goingLeft = beePositionInterpolation[cappedCounter].x > lastPos
      welcomeBee.scale.x = goingLeft ? 1 : -1
      lastPos = beePositionInterpolation[cappedCounter].x
      welcomeBee.position.x = beePositionInterpolation[cappedCounter].x
      welcomeBee.position.y = beePositionInterpolation[cappedCounter].y
      worldMapContainer.position.x = 0 - Math.round(mapPositionInterpolation[cappedCounter].x)
      worldMapContainer.position.y = 0 - Math.round(mapPositionInterpolation[cappedCounter].y)
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
    if (dirs[0]) worldMapContainer.position.y += 1
    if (dirs[1]) worldMapContainer.position.y -= 1
    if (dirs[2]) worldMapContainer.position.x += 1
    if (dirs[3]) worldMapContainer.position.x -= 1
  }, 16.66)

  window.addEventListener('keydown', e => {
    /*
    if (e.keyCode === 49) {
      worldMapContainer.position.x = 0 - levels[0].camera.x
      worldMapContainer.position.y = 0 - levels[0].camera.y
    }
    if (e.keyCode === 50) {
      worldMapContainer.position.x = 0 - levels[1].camera.x
      worldMapContainer.position.y = 0 - levels[1].camera.y
    }
    if (e.keyCode === 51) {
      worldMapContainer.position.x = 0 - levels[2].camera.x
      worldMapContainer.position.y = 0 - levels[2].camera.y
    }
    */
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
    if (e.keyCode === 49) {
      // reset 1
    }
    if (e.keyCode === 53) {
      // unlock 1
    }
    if (e.keyCode === 57) {
      // animate unlock 1
      animateAwayDeadLand(deadLandSprites[0], shitcoins[0], () => activateLevel(coins[1], 1, true))
    }
    if (e.keyCode === 48) {
      // animate unlock 2
      animateAwayDeadLand(deadLandSprites[1], shitcoins[1], () => activateLevel(coins[2], 2, true))
    }
    if (e.keyCode === 187) {
      // animate unlock 3
      animateAwayDeadLand(deadLandSprites[2], shitcoins[2], () => activateLevel(coins[3], 3, true))
    }
    if (e.keyCode === 219) {
      // animate unlock 4
      animateAwayDeadLand(deadLandSprites[3], shitcoins[3], () => {})
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

  // Trigger animations
  if (levelIndex === 0 && levelFinished) {
    animateAwayDeadLand(deadLandSprites[0], shitcoins[0], () => activateLevel(coins[1], 1, true))
  }
  if (levelIndex === 1 && levelFinished) {
    animateAwayDeadLand(deadLandSprites[1], shitcoins[1], () => activateLevel(coins[2], 2, true))
  }
  if (levelIndex === 2 && levelFinished) {
    animateAwayDeadLand(deadLandSprites[2], shitcoins[2], () => activateLevel(coins[3], 3, true))
  }
  if (levelIndex === 3 && levelFinished) {
    animateAwayDeadLand(deadLandSprites[3], shitcoins[3], () => {})
  }
}


function reset() {
  levelSelect.setSelect()
  welcomeBee.texture = flapTextures.c
  
  welcomeBee.position.x = levels[beeIsAtIndex].placement.x
  welcomeBee.position.y = levels[beeIsAtIndex].placement.y

  worldMapContainer.position.x = 0 - levels[beeIsAtIndex].camera.x
  worldMapContainer.position.y = 0 - levels[beeIsAtIndex].camera.y
}

function activateLevel(coinSprite, idx, force) {
  const isLocked = force === undefined ? idx > 0 && getLevelProgress(idx-1) === -1 : !force
  if (isLocked) {
    coinSprite.texture = coinTextures.dim
  } else {
    coinSprite.texture = coinTextures.standard
  }
    
  coinSprite.interactive = !isLocked
  coinSprite.buttonMode = !isLocked
  coinSprite.mouseover = () => {
    if (animating || isLocked || idx === beeIsAtIndex) return
      coinSprite.texture = coinTextures.hover
    }
    coinSprite.mouseout = () => {
      if (isLocked) return
      coinSprite.texture = coinTextures.standard
    }
    coinSprite.mousedown = () => {
      if (animating || isLocked || idx === beeIsAtIndex) return
      coinSprite.texture = coinTextures.click
      animating = true

      flyToLevel(coinSprite.levelData, coinSprite.levelIdx)
    }
}

function animateAwayDeadLand(sprite, shitcoins, callback) {
  sprite.alpha = 0
  let counter = 0
  
  const interval = setInterval(() => {
    counter++

    shitcoins.forEach((_, idx) => {
      if (counter > idx * 10) {
        shitcoins[idx].texture = litTexture
      }
    })

    if (sprite.alpha <= 1) {
      sprite.alpha += 0.01
    } else {
      callback()
      clearInterval(interval)
    }
  }, 16.66)
}

function flyToLevel(targetLevelData, targetLevelIdx) {
    const PAN_ANIM_DURATION = 200
    let mapPanAnimationCounter = 0
    const mapPanAnimationInterval = setInterval(() => {
      levelSelect.visible = false
      const beeAnimationPoints = [
        [levels[beeIsAtIndex].placement.x, levels[beeIsAtIndex].placement.y],
        [levels[beeIsAtIndex].placement.x, levels[beeIsAtIndex].placement.y],
        [targetLevelData.placement.x, targetLevelData.placement.y],
        [targetLevelData.placement.x, targetLevelData.placement.y],
      ]
      const beeBetweenLevelsAnimation = new Bezier(
        ...beeAnimationPoints.flatMap(p => p)
      )
      const beeBetweenPositionInterpolation = generateBezierLUTS(beeBetweenLevelsAnimation, easeInOutButFasterAnimation, PAN_ANIM_DURATION)

      welcomeBee.texture = mapPanAnimationCounter % 10 < 5 ? flapTextures.a : flapTextures.b
      const goingLeft = beeBetweenPositionInterpolation[mapPanAnimationCounter].x > lastPos
      welcomeBee.scale.x = goingLeft ? 1 : -1
      lastPos = beeBetweenPositionInterpolation[mapPanAnimationCounter].x

      welcomeBee.position.x = Math.round(beeBetweenPositionInterpolation[mapPanAnimationCounter].x)
      welcomeBee.position.y = Math.round(beeBetweenPositionInterpolation[mapPanAnimationCounter].y)

      const cameraAnimationPoints = [
        [levels[beeIsAtIndex].camera.x, levels[beeIsAtIndex].camera.y],
        [levels[beeIsAtIndex].camera.x, levels[beeIsAtIndex].camera.y],
        [targetLevelData.camera.x, targetLevelData.camera.y],
        [targetLevelData.camera.x, targetLevelData.camera.y],
      ]
      const cameraBetweenLevelsAnimation = new Bezier(
        ...cameraAnimationPoints.flatMap(p => p)
      )
      const cameraBetweenPositionInterpolation = generateBezierLUTS(cameraBetweenLevelsAnimation, easeInOutAnimation, PAN_ANIM_DURATION)

      worldMapContainer.position.x = 0 - Math.round(cameraBetweenPositionInterpolation[mapPanAnimationCounter].x)
      worldMapContainer.position.y = 0 - Math.round(cameraBetweenPositionInterpolation[mapPanAnimationCounter].y)

      mapPanAnimationCounter++
      if (mapPanAnimationCounter >= PAN_ANIM_DURATION) {
        beeIsAtIndex = targetLevelIdx
        clearInterval(mapPanAnimationInterval)
        animating = false
        reset()          
      }
    }, 16.66)
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
