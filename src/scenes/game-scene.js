import { Container, Text } from 'pixi.js'
import app from './setup-pixi'
import { setFPS } from './config'
import { setTickers } from './game/tickers'
import { setBees } from './game/bees'

class GameScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager

    const text = new Text('GameScene', { fill: 0xffffff })
    text.position.set(50, 50)
    this.addChild(text)
  }

  init () {
    setupGame.bind(this)()
  }
}

function setupGame () {
  // Persist framerate detected by PIXI
  setFPS(Math.round(app.ticker.FPS))

  document.body.style['background-color'] = '#262b44'

  setTickers([])
  setBees([])

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

  const colorBackground = new Container()
  container.addChild(colorBackground)
  const fullColorBackground = new Graphics()
  fullColorBackground.beginFill(backgroundColor)
  fullColorBackground.drawRect(0, 0, WIDTH, HEIGHT)
  colorBackground.addChild(fullColorBackground)

  background = new Container()
  container.addChild(background)

  hexBackground = new Container()
  container.addChild(hexBackground)

  dimmer = new Container()
  container.addChild(dimmer)
  const dimmerSquare = new Graphics()
  dimmerSquare.beginFill(0x000000)
  dimmerSquare.drawRect(0, 0, WIDTH, HEIGHT)
  dimmerSquare.alpha = 0
  dimmer.addChild(dimmerSquare)
  addTicker('ui', () => {
    dimmerSquare.alpha = season === 'summer' && hour < 3 && day === 1 ? 0 : 1 - (Math.sin(Math.PI * ((hour) % 24 / 24)) * 1.5) - 0.7
  })

  uiHangarComponents = new Container()
  container.addChild(uiHangarComponents)

  flowerBed = new Container()
  container.addChild(flowerBed)
  
  hexForeground = new Container()
  container.addChild(hexForeground)

  hatchContainer = new Container()
  container.addChild(hatchContainer)

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

    seasonText = new PIXI.Text('-', { ...fontConfig, ...smallFont, fill: 'white' })
    seasonText.position.x = 236
    seasonText.position.y = topBarContentOffsetY + 8
    uiTopBar.addChild(seasonText)

    const timelineText = new PIXI.Text('Year   Day   Hour', { ...fontConfig, ...smallFont, fill: '#8b9bb4' })
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

    const hourLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont })
    hourLabel.anchor.set(1, 0)
    hourLabel.position.x = 188
    hourLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(hourLabel)
    
    addTicker('ui', time => {
      yearLabel.text = year
      dayLabel.text = day
      hourLabel.text = Math.round(hour)

      const label = season === 'summer' ? 'Summer' : 'Winter'
      const count = season === 'summer' ? currentSeasonLength + 1 - day : currentSeasonLength + previousSeasonLength + 1 - day
      seasonText.text = `${label} - ${count} days left`
    })

    function summaryLabel(type, y, color, funcA, funcB) {
      const descriptionLabel = new PIXI.Text(type, { ...fontConfig, ...smallFont, fill: '#8b9bb4' })
      descriptionLabel.position.x = 322
      descriptionLabel.position.y = y
      uiTopBar.addChild(descriptionLabel)

      const divider = new PIXI.Text('/', { ...fontConfig, ...smallFont, fill: '#8b9bb4' })
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

  // sun
  sun = new Container()
  const summerSunSprite = Sprite.fromImage('images/scene/summer-sun.png')
  const winterSunSprite = Sprite.fromImage('images/scene/winter-sun.png')
  
  sun.winterSun = winterSunSprite
  sun.summerSun = summerSunSprite

  winterSunSprite.visible = false

  sun.addChild(summerSunSprite)
  sun.addChild(winterSunSprite)

  background.addChild(sun)
  
  addTicker('ui', time => {
    setGameSpeedText()

    sun.position.x = 290
    sun.position.y = 290 - (Math.sin((hour / 24) * Math.PI) * 45)
  })

  backgroundScene = Sprite.fromImage(`images/scene/${backgroundImage}.png`)
  backgroundScene.interactive = true
  backgroundScene.mouseup = () => setSelected(null)
  background.addChild(backgroundScene)

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
  uiHangarComponents.addChild(jobsPanel)
  
  addJobsButtons(jobsPanel)

  const jobs = ['idle', 'forager', 'nurser', 'worker']
  
  jobs.forEach((type, idx) => {
    const jobCounterHex = new Sprite.fromImage('images/ui/button-jobs/button-alt.png')
    jobCounterHex.position.x = 63
    jobCounterHex.position.y = (idx * 38) + 3
    jobsPanel.addChild(jobCounterHex)

    const textLabel = new PIXI.Text('-', { ...fontConfig, ...smallFont, fill: '#4b0b12' })
    textLabel.position.x = 12
    textLabel.position.y = 3
    textLabel.anchor.set(1, 0)
    
    addTicker('ui', time => {
      const aliveBees = bees.filter(b => !b.isDead() && !b.isDying())
      textLabel.text = aliveBees.filter(b => b.type === type).length
    })

    jobCounterHex.addChild(textLabel)
  })
  
  addTicker('ui', time => {
    const aliveBees = bees.filter(b => !b.isDead() && !b.isDying())
    populationText.text = aliveBees.length + 1
  })
  
  hexGrid = new Array(HEX_AMOUNT_HEIGHT).fill().map((_, y) => 
    new Array(HEX_AMOUNT_WIDTH).fill().map((_, x) => cellDisabled(x, y, hexForeground))
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
  // foreground.addChild(hiveHole) // don't add it

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

  createWarningSign()
  createSeasonTracker()
  
  createQueen(beeContainer)
  currentMapInit(beeContainer)
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


export default GameScene
