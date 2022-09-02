
function setupGame() {

  // Persist framerate detected by PIXI
  FPS = Math.round(app.ticker.FPS)
  
  scene = 'game'
  document.body.style['background-color'] = '#262b44'
  
  currentCycleIndex = 0

  const container = new Container()
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
    
    const colonyLabel = new PIXI.Text('HIVE POPULATION', { ...picoFontConfig, ...smallFont, fill: colors.orange })
    colonyLabel.position.x = 8
    colonyLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(colonyLabel)

    const gameSpeedLabel = new PIXI.Text('GAME SPEED', { ...picoFontConfig, ...smallFont, fill: colors.orange })
    gameSpeedLabel.position.x = 337
    gameSpeedLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(gameSpeedLabel)

    populationText = new PIXI.Text('1', { ...picoFontConfig, ...smallFont, fill: colors.yellow })
    populationText.position.x = 72
    populationText.position.y = topBarContentOffsetY
    uiTopBar.addChild(populationText)

    const timelineText = new PIXI.Text('Year   Day', { ...picoFontConfig, ...smallFont, fill: 'gray' })
    timelineText.position.x = 110
    timelineText.position.y = topBarContentOffsetY
    uiTopBar.addChild(timelineText)
    
    const yearLabel = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
    yearLabel.anchor.set(1, 0)
    yearLabel.position.x = 134
    yearLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(yearLabel)

    const dayLabel = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
    dayLabel.anchor.set(1, 0)
    dayLabel.position.x = 158
    dayLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(dayLabel)

    const nextSeasonLength = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
    nextSeasonLength.anchor.set(1, 0)
    nextSeasonLength.position.x = 260
    nextSeasonLength.position.y = topBarContentOffsetY
    uiTopBar.addChild(nextSeasonLength)

    addTicker('ui', time => {
      yearLabel.text = year
      dayLabel.text = day
      nextSeasonLength.text = cycles[currentCycleIndex + 1]
    })

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

  backgroundScene = Sprite.fromImage('images/scene/background-summer.png')
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

  const nextSeason = () => season === 'summer' ? 'winter' : 'summer'

  sun.interactive = true
  sun.buttonMode = true
  const dayLabel = cycles[currentCycleIndex + 1] === 1 ? 'DAY' : 'DAYS'
  sun.mouseover = () => sun.alpha = 0.8
  sun.mouseout = () => sun.alpha = 1
  sun.mouseup = () => {
    sunBubbleTimer = FPS * 5
    sunBubble.visible = true
    sunBubbleText.text = `${ nextSeason().toUpperCase() } WILL BE ${ cycles[currentCycleIndex + 1] } ${ dayLabel } LONG`
  }
  background.addChild(sun)
  
  sunBubble = Sprite.fromImage('images/scene/sun-bubble.png')
  sunBubble.visible = true

  const sunBubbleText = new PIXI.Text(`${ nextSeason().toUpperCase() } WILL BE ${ cycles[currentCycleIndex + 1] } ${ dayLabel } LONG`, { 
    ...picoFontConfig, 
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

  angelBubbleText = new PIXI.Text('', { ...picoFontConfig, ...smallFont, fill: colors.darkGray })
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

  const unassignedText = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
  unassignedText.anchor.set(1, 0)
  unassignedText.position.x = 73
  unassignedText.position.y = 3
  jobsPanel.addChild(unassignedText)

  const foragerText = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
  foragerText.anchor.set(1, 0)
  foragerText.position.x = 52
  foragerText.position.y = 41.5
  jobsPanel.addChild(foragerText)

  const nurserText = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
  nurserText.anchor.set(1, 0)
  nurserText.position.x = 50
  nurserText.position.y = 79.5
  jobsPanel.addChild(nurserText)

  const workerText = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
  workerText.anchor.set(1, 0)
  workerText.position.x = 53
  workerText.position.y = 117.5
  jobsPanel.addChild(workerText)
  
  addTicker('ui', time => {
    const aliveBees = bees.filter(b => !b.isDead())
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
  
  hexGrid = new Array(13).fill().map((_, x) => 
    new Array(20).fill().map((_, y) => cellDisabled(x, y, hexForeground))
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

  panel = new Container()
  ui.addChild(panel)

  addJobsButtons(jobsPanel)

  createWarningSign()

  createMap(MAP_SELECTION)
  createFlowers()

  app.ticker.add((delta) => gameloop(delta))

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
