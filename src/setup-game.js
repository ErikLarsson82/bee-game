
function setupGame() {

  // Persist framerate detected by PIXI
  FPS = Math.round(app.ticker.FPS)
  
  scene = 'game'
  document.body.style['background-color'] = '#262b44'

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

    populationText = new PIXI.Text('1', { ...picoFontConfig, ...smallFont, fill: colors.yellow })
    populationText.position.x = 72
    populationText.position.y = topBarContentOffsetY
    uiTopBar.addChild(populationText) 

    const timelineText = new PIXI.Text('Year   Day   Hour', { ...picoFontConfig, ...smallFont, fill: 'gray' })
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

    const hourLabel = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
    hourLabel.anchor.set(1, 0)
    hourLabel.position.x = 184
    hourLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(hourLabel)

    const nextSeasonLength = new PIXI.Text('-', { ...picoFontConfig, ...smallFont })
    nextSeasonLength.anchor.set(1, 0)
    nextSeasonLength.position.x = 260
    nextSeasonLength.position.y = topBarContentOffsetY
    uiTopBar.addChild(nextSeasonLength)

    addTicker('ui', time => {
      yearLabel.text = year
      dayLabel.text = day
      hourLabel.text = Math.round(hour)
      nextSeasonLength.text = cycles[1]
    })

    pausedText = new PIXI.Text('Playing', { ...picoFontConfig, ...largeFont })
    pausedText.position.x = 370
    pausedText.position.y = topBarContentOffsetY
    uiTopBar.addChild(pausedText)

    ui.addChild(uiTopBar)

    pauseFrame = new Graphics()
    pauseFrame.lineStyle(10, 0xf77622);
    pauseFrame.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
    ui.addChild(pauseFrame)
  }

  backgroundScene = Sprite.fromImage('images/scene/background-summer.png')
  backgroundScene.interactive = true
  backgroundScene.mouseup = () => setSelected(null)
  background.addChild(backgroundScene)

  nightDimmer = new Graphics()
  nightDimmer.beginFill(0x000000)
  nightDimmer.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
  nightDimmer.alpha = 0
  nightDimmer.visible = true

  addTicker('ui', time => {
    setGameSpeedText()
  })

  addTicker('game-stuff', time => {
    const isNight = hour > 21
    const isDay = !isNight
    if (nightDimmer.alpha < 0.4 && isNight) {
      nightDimmer.alpha += transferTo(0.4).inSeconds(2)
    }
    if (nightDimmer.alpha > 0 && isDay) {
      nightDimmer.alpha -= transferTo(0.4).inSeconds(2)
    } 
    nightDimmer.alpha = cap(0, 0.4)(nightDimmer.alpha)
  })
  dimmer.addChild(nightDimmer)

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
  selectedSpriteSub.position.x = -2
  selectedSpriteSub.position.y = -2
  selectedSprite.addChild(selectedSpriteSub)  
  addTicker('ui', time => {
    if (selected) {
      if (selected.label === 'bee') {
        selectedSpriteSub.texture = Texture.fromImage('images/ui/selection-circle.png')
        selectedSprite.position.x = selected.position.x + 1
        selectedSprite.position.y = selected.position.y - 1
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

  panel = new Container()
  ui.addChild(panel)

  addJobsButtons(jobsPanel)

  createWarningSign()
  createSeasonTracker()

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
