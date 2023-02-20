
function setupGame() {

  // Persist framerate detected by PIXI
  FPS = Math.round(app.ticker.FPS)
  
  scene = 'game'
  document.body.style['background-color'] = '#262b44'
  
  tickers = []
  bees = []
  
  currentCycleIndex = 0
  gameover = false
  keepPlaying = false
  paused = false
  gameSpeed = 1
  hour = 0
  day = 1
  year = 1
  season = 'summer'

  setLastPlayedLevel(levelIndex)

  container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  background = new Container()
  container.addChild(background)

  hexBackground = new Container()
  container.addChild(hexBackground)

  dimmer = new Container()
  container.addChild(dimmer)

  flowerBed = new Container()
  container.addChild(flowerBed)
  
  hexForeground = new Container()
  container.addChild(hexForeground)

  beeContainer = new Container()
  container.addChild(beeContainer)

  foreground = new Container()
  container.addChild(foreground)

  ui = new Container()
  container.addChild(ui)

  if (false) {
    const clickFinder = new Graphics()
    clickFinder.beginFill(0xff0000)
    clickFinder.drawRect(0, 0, WIDTH, HEIGHT)
    clickFinder.alpha = 0.1
    clickFinder.buttonMode = true
    clickFinder.interactive = true
    clickFinder.mousedown = e => {
      console.log('Mouse Click Position', e.data.global.x / 2, e.data.global.y / 2);
    }
    ui.addChild(clickFinder)
  }

  {
    uiTopBar = new Container()

    const topBarContentOffsetY = 5
    
    const colonyLabel = new PIXI.Text('HIVE POPULATION', { ...fontConfig, ...smallFont, fill: colors.orange })
    colonyLabel.position.x = 8
    colonyLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(colonyLabel)

    const gameSpeedLabel = new PIXI.Text('GAME SPEED', { ...fontConfig, ...smallFont, fill: colors.orange })
    gameSpeedLabel.position.x = 337
    gameSpeedLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(gameSpeedLabel)

    populationText = new PIXI.Text('1', { ...fontConfig, ...smallFont, fill: colors.yellow })
    populationText.position.x = 72
    populationText.position.y = topBarContentOffsetY
    uiTopBar.addChild(populationText)

    const timelineText = new PIXI.Text('Year   Day', { ...fontConfig, ...smallFont, fill: 'gray' })
    timelineText.position.x = 110
    timelineText.position.y = topBarContentOffsetY
    uiTopBar.addChild(timelineText)

    const yearLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont })
    yearLabel.anchor.set(1, 0)
    yearLabel.position.x = 134
    yearLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(yearLabel)

    const dayLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont })
    dayLabel.anchor.set(1, 0)
    dayLabel.position.x = 158
    dayLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(dayLabel)
    
    addTicker('ui', time => {
      yearLabel.text = year
      dayLabel.text = day
    })

    function summaryLabel(type, y, color, funcA, funcB) {
      const descriptionLabel = new PIXI.Text(`Total ${type}`, { ...fontConfig, ...smallFont, fill: 'gray' })
      descriptionLabel.position.x = 292
      descriptionLabel.position.y = y
      uiTopBar.addChild(descriptionLabel)

      const divider = new PIXI.Text('/', { ...fontConfig, ...smallFont, fill: 'gray' })
      divider.position.x = 370
      divider.position.y = y
      uiTopBar.addChild(divider)

      const valueLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont, fill: color })
      valueLabel.anchor.set(1, 0)
      valueLabel.position.x = 366
      valueLabel.position.y = y
      uiTopBar.addChild(valueLabel)

      const capacityLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont, fill: color })
      capacityLabel.anchor.set(1, 0)
      capacityLabel.position.x = 396
      capacityLabel.position.y = y
      uiTopBar.addChild(capacityLabel)
    
      addTicker('ui', updateTotals(valueLabel, capacityLabel, type, funcA, funcB))      
    }

    summaryLabel('honey', 40, '#feae34', hex => hex.honey, hex => hex.HONEY_HEX_CAPACITY)
    summaryLabel('nectar', 50, '#2ce8f5', hex => hex.nectar, hex => hex.NECTAR_CAPACITY)
    summaryLabel('pollen', 60, '#fee761', hex => hex.pollen, hex => hex.POLLEN_HEX_CAPACITY)
    summaryLabel('wax', 70, '#e8b796', hex => hex.wax, hex => hex.WAX_HEX_CAPACITY)

    gameSpeedIcon = Sprite.fromImage('images/ui/gamespeed1.png')
    gameSpeedIcon.position.x = 380
    gameSpeedIcon.position.y = topBarContentOffsetY
    uiTopBar.addChild(gameSpeedIcon)

    ui.addChild(uiTopBar)

    pauseFrame = new Graphics()
    pauseFrame.lineStyle(6, colorToHex(colors.darkOrange))
    pauseFrame.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
    ui.addChild(pauseFrame)
  }

  backgroundScene = Sprite.fromImage(`images/scene/${backgroundImage}.png`)
  backgroundScene.interactive = true
  backgroundScene.mouseup = () => setSelected(null)
  background.addChild(backgroundScene)

  // sun
  sun = new Container()
  const summerSunSprite = Sprite.fromImage('images/scene/summer-sun.png')
  const winterSunSprite = Sprite.fromImage('images/scene/winter-sun.png')
  
  sun.winterSun = winterSunSprite
  sun.summerSun = summerSunSprite

  winterSunSprite.visible = false

  sun.addChild(summerSunSprite)
  sun.addChild(winterSunSprite)

  const getSunBubbleText = () => {
    const nextSeasonLength = cycles[currentCycleIndex + 1]
    return `${ season === 'summer' ? 'WINTER' : 'SUMMER' } WILL BE ${ nextSeasonLength } ${ nextSeasonLength === 1 ? 'DAY' : 'DAYS' } LONG`
  }

  sun.interactive = true
  sun.buttonMode = true
  sun.mouseover = () => sun.alpha = 0.8
  sun.mouseout = () => sun.alpha = 1
  sun.mouseup = () => {
    sunBubbleTimer = FPS * 5
    sunBubble.visible = true
    sunBubbleText.text = getSunBubbleText()
  }
  background.addChild(sun)
  
  sunBubble = Sprite.fromImage('images/scene/sun-bubble.png')
  sunBubble.visible = true

  const sunBubbleText = new PIXI.Text(getSunBubbleText(), {
    ...fontConfig, 
    ...smallFont,
    fill: colors.darkGray
  })

  sunBubbleText.position.x = 9
  sunBubbleText.position.y = 6
  sunBubble.addChild(sunBubbleText)
  
  let sunBubbleTimer = FPS * 5

  background.addChild(sunBubble)
  
  addTicker('ui', time => {
    setGameSpeedText()

    let x
    if (season === 'winter') {
      x = Math.round(20 + ((380 / (currentSeasonLength * 24)) * (((day - cycles[currentCycleIndex - 1]) - 1) * 24 + hour)))
    } else if (season === 'summer') {
      x = Math.round(20 + ((380 / (currentSeasonLength * 24)) * ((day - 1) * 24 + hour)))
    }

    sun.position.x = x
    sun.position.y = 228

    if (sunBubble.visible) {
      sunBubble.position.x = sun.position.x - 6
      sunBubble.position.y = sun.position.y + 18
      sunBubbleTimer -= 1
      if (sunBubbleTimer <= 0) {
        sunBubble.visible = false
      }
    }
  })

  // angel bubble
  angelBubble = Sprite.fromImage('images/scene/sun-bubble.png')
  angelBubble.position.x = -7
  angelBubble.position.y = 18

  angelBubbleText = new PIXI.Text('', { ...fontConfig, ...smallFont, fill: colors.darkGray })
  angelBubbleText.position.x = 9
  angelBubbleText.position.y = 6
  angelBubble.addChild(angelBubbleText)
  
  angelBubbleTimer = FPS * 5
  
  addTicker('ui', time => {
    if (angelBubble.parent) {
      angelBubbleTimer -= 1
      if (angelBubbleTimer <= 0) {
        angelBubble.parent.removeChild(angelBubble)
      }
    }
  })

  const jobsPanel = Sprite.fromImage('images/ui/ui-jobs-panel.png')
  jobsPanel.position.x = 20
  jobsPanel.position.y = 25
  background.addChild(jobsPanel)

  const unassignedText = new PIXI.Text('-', { ...fontConfig, ...smallFont })
  unassignedText.anchor.set(1, 0)
  unassignedText.position.x = 73
  unassignedText.position.y = 3
  jobsPanel.addChild(unassignedText)

  const foragerText = new PIXI.Text('-', { ...fontConfig, ...smallFont })
  foragerText.anchor.set(1, 0)
  foragerText.position.x = 52
  foragerText.position.y = 41.5
  jobsPanel.addChild(foragerText)

  const nurserText = new PIXI.Text('-', { ...fontConfig, ...smallFont })
  nurserText.anchor.set(1, 0)
  nurserText.position.x = 50
  nurserText.position.y = 79.5
  jobsPanel.addChild(nurserText)

  const workerText = new PIXI.Text('-', { ...fontConfig, ...smallFont })
  workerText.anchor.set(1, 0)
  workerText.position.x = 53
  workerText.position.y = 117.5
  jobsPanel.addChild(workerText)
  
  addTicker('ui', time => {
    const aliveBees = bees.filter(b => !b.isDead() && !b.isDying())
    const idles = aliveBees.filter(b => b.type === 'idle').length
    const foragers = aliveBees.filter(b => b.type === 'forager').length
    const nurses = aliveBees.filter(b => b.type === 'nurser').length
    const workers = aliveBees.filter(b => b.type === 'worker').length
    unassignedText.text = idles
    foragerText.text = foragers
    nurserText.text = nurses
    workerText.text = workers
    populationText.text = aliveBees.length + 1
  })
  
  hexGrid = new Array(20).fill().map((_, y) => 
    new Array(13).fill().map((_, x) => cellDisabled(x, y, hexForeground))
  )
  
  selectedSprite = new Container()
  selectedSprite.visible = false
  const selectedSpriteSub = Sprite.fromImage('images/ui/selection-cell.png')
  selectedSprite.addChild(selectedSpriteSub)  
  addTicker('ui', time => {
    if (selected) {
      if (selected.label === 'bee') {
        selectedSpriteSub.texture = Texture.fromImage('images/ui/selection-circle.png')
        selectedSprite.position.x = selected.position.x - 1
        selectedSprite.position.y = selected.position.y - 3
      } else {
        selectedSpriteSub.texture = Texture.fromImage('images/ui/selection-cell.png')
        selectedSprite.position.x = selected.position.x
        selectedSprite.position.y = selected.position.y
      }
      selectedSprite.visible = true
    } else {
      selectedSprite.visible = false
    }
  })
  ui.addChild(selectedSprite)

  hoverCellSprite = Sprite.fromImage('images/ui/hover-cell.png')
  hoverCellSprite.visible = false
  addTicker('ui', () => {
    if (hoveredCells.length) {
      hoverCellSprite.visible = true
      hoverCellSprite.position.x = hoveredCells[hoveredCells.length - 1].position.x
      hoverCellSprite.position.y = hoveredCells[hoveredCells.length - 1].position.y
    } else {
      hoverCellSprite.visible = false
    }
  })
  ui.addChild(hoverCellSprite)

  hiveHole = Sprite.fromImage('images/scene/hive-hole.png')
  hiveHole.position.x = 200
  hiveHole.position.y = 214
  hiveHole.anchor.x = 0.5
  hiveHole.anchor.y = 1
  foreground.addChild(hiveHole)

  {
    const haveFoodContainer = new Container()
    haveFoodContainer.position.x = 292
    haveFoodContainer.position.y = 79
    haveFoodContainer.visible = true
    ui.addChild(haveFoodContainer)
    
    const haveFoodLabel = new PIXI.Text(`Winter food`, { ...fontConfig, ...smallFont, fill: 'gray' })
    haveFoodContainer.addChild(haveFoodLabel)

    const haveWinterFood = Sprite.fromImage('images/ui/have-winter-food-progress-background.png')
    haveWinterFood.position.x = 61
    haveFoodContainer.addChild(haveWinterFood)

    haveFoodContainer.addChild(ProgressBar2(61, 0, 'honey', () => {
      haveFoodContainer.visible = season === 'summer' && blizzardWinter
      let meetRequirement = 0
      forEachHexagon(hexGrid, hex => {
        if (hex.type === 'honey' && hex.honey >= 30) {
          meetRequirement++
        }
      })
      const totalBees = bees.filter(bee => bee.type !== 'bookie').length
      return (meetRequirement / totalBees) * 100
    }, 100)) 
  }

  const clickblocker = new Container()
  foreground.addChild(clickblocker)
  const blocker = new Graphics()
  blocker.visible = false
  blocker.beginFill(0x000000)
  blocker.drawRect(0, 0, WIDTH, HEIGHT)
  blocker.alpha = 0.3
  blocker.buttonMode = false
  blocker.interactive = true
  blocker.mousedown = () => {}
  blocker.mouseover = () => {}
  clickblocker.addChild(blocker)
  addTicker('ui', () => {
    blocker.visible = gameover
  })

  panel = new Container()
  ui.addChild(panel)

  addJobsButtons(jobsPanel)

  createWarningSign()
  createSeasonTracker()

  createMap(MAP_SELECTION)
  createFlowers()

  createGameOverUI()

  app.ticker.add(gameloop)
  
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      paused = true
      app.ticker.stop()
    } else {
      app.ticker.start()
    }
    window.setGameSpeedText()
  }
  document.addEventListener('visibilitychange', handleVisibilityChange, false)
}
