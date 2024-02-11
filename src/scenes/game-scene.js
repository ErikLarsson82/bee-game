import { Container, Text, Graphics, Sprite, Texture } from 'pixi.js'
import app from '../setup-pixi'
import { WIDTH, HEIGHT, fontConfig, smallFont, colors } from '../config'
import { fps, setFps } from '../framerate'
import { forEachHexagon, HEX_AMOUNT_HEIGHT, HEX_AMOUNT_WIDTH } from '../hex'
import { cellDisabled } from '../cells'
import { ProgressBar2 } from '../ui'
import {
  setTickers,
  setBees,
  setFlowers,
  setCurrentCycleIndex,
  setGameover,
  setKeepPlaying,
  setPaused,
  setGameSpeed,
  setHour,
  setDay,
  setYear,
  setSeason,
  setAngelBubbleTimer,
  season,
  hour,
  day,
  year,
  currentSeasonLength,
  previousSeasonLength,
  angelBubbleTimer,
  bees,
  selected,
  hoveredCells,
  blizzardWinter,
  gameover,
  currentMapInit,
  hexGrid,
  setHexGrid,
  setHoveredCells,
  setAngels,
  winterHungerMultiplier
} from '../game/game-state'
import {
  updateSelected,
  updateGameSpeedText,
  addTicker,
  updateTotals,
  addJobsButtons
} from '../exported-help-functions'

import { createWarningSign } from '../single-function-files/create-warning-sign'
import { createSeasonTracker } from '../single-function-files/create-season-tracker'
import { createQueen } from '../single-function-files/create-queen'
import { createFlowers } from '../single-function-files/create-flowers'
import { createGameOverUI } from '../single-function-files/create-game-over-menu'

import { colorToHex } from '../pure-help-functions'
import {
  setBeeContainer,
  setHatchContainer,
  setGameSpeedIcon,
  setPauseFrame,
  backgroundImage,
  setHexBackground,
  setPanel,
  setBackgroundScene,
  setSun,
  setAngelBubble,
  setAngelBubbleText,
  setHiveHole,
  setForeground,
  setHexForeground,
  backgroundColor
} from '../game/pixi-elements'
import { gameloop } from '../game-loop'

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

  destroy () {
    console.log('is this destroyed?')
    app.ticker.remove(gameloop)
  }
}

function setupGame () {
  const _container = this
  const sceneManager = this.sceneManager
  // Persist framerate detected by PIXI
  setFps(Math.round(app.ticker.FPS))

  document.body.style['background-color'] = '#262b44'

  setTickers([])
  setBees([])
  setFlowers([])
  setHoveredCells([])
  setAngels([])

  setCurrentCycleIndex(0)
  setGameover(false)
  setKeepPlaying(false)
  setPaused(false)
  setGameSpeed(1)
  setHour(0)
  setDay(1)
  setYear(1)
  setSeason('summer')

  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  _container.addChild(container)

  const colorBackground = new Container()
  container.addChild(colorBackground)
  const fullColorBackground = new Graphics()
  fullColorBackground.beginFill(backgroundColor)
  fullColorBackground.drawRect(0, 0, WIDTH, HEIGHT)
  colorBackground.addChild(fullColorBackground)

  const background = new Container()
  container.addChild(background)

  const hexBackground = new Container()
  container.addChild(hexBackground)
  setHexBackground(hexBackground)

  const dimmer = new Container()
  container.addChild(dimmer)
  const dimmerSquare = new Graphics()
  dimmerSquare.beginFill(0x000000)
  dimmerSquare.drawRect(0, 0, WIDTH, HEIGHT)
  dimmerSquare.alpha = 0
  dimmer.addChild(dimmerSquare)
  addTicker('ui', () => {
    dimmerSquare.alpha = season === 'summer' && hour < 3 && day === 1 ? 0 : 1 - (Math.sin(Math.PI * ((hour) % 24 / 24)) * 1.5) - 0.7
  })

  const uiHangarComponents = new Container()
  container.addChild(uiHangarComponents)

  const flowerBed = new Container()
  container.addChild(flowerBed)

  const hexForeground = new Container()
  container.addChild(hexForeground)
  setHexForeground(hexForeground)

  const hatchContainer = new Container()
  container.addChild(hatchContainer)
  setHatchContainer(hatchContainer)

  const beeContainer = new Container()
  container.addChild(beeContainer)
  setBeeContainer(beeContainer)

  const foreground = new Container()
  container.addChild(foreground)
  setForeground(foreground)

  const ui = new Container()
  container.addChild(ui)

  // eslint-disable-next-line no-constant-condition
  if (false) {
    const clickFinder = new Graphics()
    clickFinder.beginFill(0xff0000)
    clickFinder.drawRect(0, 0, WIDTH, HEIGHT)
    clickFinder.alpha = 0.1
    clickFinder.buttonMode = true
    clickFinder.interactive = true
    clickFinder.mousedown = e => {
      console.log('Mouse Click Position', e.data.global.x / 2, e.data.global.y / 2)
    }
    ui.addChild(clickFinder)
  }

  let populationText, uiTopBar
  {
    uiTopBar = new Container()

    const topBarContentOffsetY = 5

    const colonyLabel = new Text('HIVE POPULATION', { ...fontConfig, ...smallFont, fill: colors.orange })
    colonyLabel.position.x = 8
    colonyLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(colonyLabel)

    const gameSpeedLabel = new Text('GAME SPEED', { ...fontConfig, ...smallFont, fill: colors.orange })
    gameSpeedLabel.position.x = 337
    gameSpeedLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(gameSpeedLabel)

    populationText = new Text('1', { ...fontConfig, ...smallFont, fill: colors.yellow })
    populationText.position.x = 72
    populationText.position.y = topBarContentOffsetY
    uiTopBar.addChild(populationText)

    const seasonText = new Text('-', { ...fontConfig, ...smallFont, fill: 'white' })
    seasonText.position.x = 236
    seasonText.position.y = topBarContentOffsetY + 8
    uiTopBar.addChild(seasonText)

    const timelineText = new Text('Year   Day   Hour', { ...fontConfig, ...smallFont, fill: '#8b9bb4' })
    timelineText.position.x = 110
    timelineText.position.y = topBarContentOffsetY
    uiTopBar.addChild(timelineText)

    const yearLabel = new Text('-', { ...fontConfig, ...smallFont })
    yearLabel.anchor.set(1, 0)
    yearLabel.position.x = 134
    yearLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(yearLabel)

    const dayLabel = new Text('-', { ...fontConfig, ...smallFont })
    dayLabel.anchor.set(1, 0)
    dayLabel.position.x = 158
    dayLabel.position.y = topBarContentOffsetY
    uiTopBar.addChild(dayLabel)

    const hourLabel = new Text('-', { ...fontConfig, ...smallFont })
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

    function summaryLabel (type, y, color, funcA, funcB) {
      const descriptionLabel = new Text(type, { ...fontConfig, ...smallFont, fill: '#8b9bb4' })
      descriptionLabel.position.x = 322
      descriptionLabel.position.y = y
      uiTopBar.addChild(descriptionLabel)

      const divider = new Text('/', { ...fontConfig, ...smallFont, fill: '#8b9bb4' })
      divider.position.x = 370
      divider.position.y = y
      uiTopBar.addChild(divider)

      const valueLabel = new Text('-', { ...fontConfig, ...smallFont, fill: color })
      valueLabel.anchor.set(1, 0)
      valueLabel.position.x = 366
      valueLabel.position.y = y
      uiTopBar.addChild(valueLabel)

      const capacityLabel = new Text('-', { ...fontConfig, ...smallFont, fill: color })
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

    const gameSpeedIcon = Sprite.fromImage('gamespeed1.png')
    gameSpeedIcon.position.x = 380
    gameSpeedIcon.position.y = topBarContentOffsetY
    uiTopBar.addChild(gameSpeedIcon)
    setGameSpeedIcon(gameSpeedIcon)

    ui.addChild(uiTopBar)

    const pauseFrame = new Graphics()
    pauseFrame.lineStyle(6, colorToHex(colors.darkOrange))
    pauseFrame.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
    ui.addChild(pauseFrame)
    setPauseFrame(pauseFrame)
  }

  // sun
  const sun = new Container()
  const summerSunSprite = Sprite.fromImage('summer-sun.png')
  const winterSunSprite = Sprite.fromImage('winter-sun.png')

  sun.winterSun = winterSunSprite
  sun.summerSun = summerSunSprite

  winterSunSprite.visible = false

  sun.addChild(summerSunSprite)
  sun.addChild(winterSunSprite)

  setSun(sun)
  background.addChild(sun)

  addTicker('ui', time => {
    updateGameSpeedText()

    sun.position.x = 290
    sun.position.y = 290 - (Math.sin((hour / 24) * Math.PI) * 45)
  })

  const backgroundScene = Sprite.fromImage(`${backgroundImage}.png`)
  backgroundScene.interactive = true
  backgroundScene.mouseup = () => updateSelected(null)
  setBackgroundScene(backgroundScene)
  background.addChild(backgroundScene)

  // angel bubble
  const angelBubble = Sprite.fromImage('sun-bubble.png')
  angelBubble.position.x = -7
  angelBubble.position.y = 18
  setAngelBubble(angelBubble)

  const angelBubbleText = new Text('', { ...fontConfig, ...smallFont, fill: colors.darkGray })
  angelBubbleText.position.x = 9
  angelBubbleText.position.y = 6
  angelBubble.addChild(angelBubbleText)
  setAngelBubbleText(angelBubbleText)

  setAngelBubbleTimer(fps * 5)

  addTicker('ui', time => {
    if (angelBubble.parent) {
      setAngelBubbleTimer(angelBubbleTimer - 1)
      if (angelBubbleTimer <= 0) {
        angelBubble.parent.removeChild(angelBubble)
      }
    }
  })

  const jobsPanel = Sprite.fromImage('ui-jobs-panel.png')
  jobsPanel.position.x = 20
  jobsPanel.position.y = 25
  uiHangarComponents.addChild(jobsPanel)

  addJobsButtons(jobsPanel)

  const jobs = ['idle', 'forager', 'nurser', 'worker']

  jobs.forEach((type, idx) => {
    const jobCounterHex = Sprite.fromImage('button-jobs/button-alt.png')
    jobCounterHex.position.x = 63
    jobCounterHex.position.y = (idx * 38) + 3
    jobsPanel.addChild(jobCounterHex)

    const textLabel = new Text('-', { ...fontConfig, ...smallFont, fill: '#4b0b12' })
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

  setHexGrid(
    new Array(HEX_AMOUNT_HEIGHT).fill().map((_, y) =>
      new Array(HEX_AMOUNT_WIDTH).fill().map((_, x) => cellDisabled(x, y, hexForeground))
    )
  )

  const selectedSprite = new Container()
  selectedSprite.visible = false
  const selectedSpriteSub = Sprite.fromImage('selection-cell.png')
  selectedSprite.addChild(selectedSpriteSub)
  addTicker('ui', time => {
    if (selected) {
      if (selected.label === 'bee') {
        selectedSpriteSub.texture = Texture.fromImage('selection-circle.png')
        selectedSprite.position.x = selected.position.x - 1
        selectedSprite.position.y = selected.position.y - 3
      } else {
        selectedSpriteSub.texture = Texture.fromImage('selection-cell.png')
        selectedSprite.position.x = selected.position.x
        selectedSprite.position.y = selected.position.y
      }
      selectedSprite.visible = true
    } else {
      selectedSprite.visible = false
    }
  })
  ui.addChild(selectedSprite)

  const hoverCellSprite = Sprite.fromImage('hover-cell.png')
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

  const hiveHole = Sprite.fromImage('hive-hole.png')
  hiveHole.position.x = 200
  hiveHole.position.y = 214
  hiveHole.anchor.x = 0.5
  hiveHole.anchor.y = 1
  setHiveHole(hiveHole)
  // foreground.addChild(hiveHole) // don't add it

  {
    const haveFoodContainer = new Container()
    haveFoodContainer.position.x = 292
    haveFoodContainer.position.y = 79
    haveFoodContainer.visible = true
    ui.addChild(haveFoodContainer)

    const haveFoodLabel = new Text('Winter food', { ...fontConfig, ...smallFont, fill: 'gray' })
    haveFoodContainer.addChild(haveFoodLabel)

    const haveWinterFood = Sprite.fromImage('have-winter-food-progress-background.png')
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

  const panel = new Container()
  ui.addChild(panel)
  setPanel(panel)

  createWarningSign()
  createSeasonTracker(uiTopBar)

  createQueen(beeContainer)
  currentMapInit(beeContainer)
  createFlowers(flowerBed)

  createGameOverUI(sceneManager, ui)

  for (let i = winterHungerMultiplier; i > 0; i--) {
    const snowball = Sprite.fromImage('images/ui/snowball.png')
    snowball.position.x = 244 - (i * 6)
    snowball.position.y = 5
    window.snowball = snowball
    ui.addChild(snowball)
  }

  app.ticker.add(gameloop)

  function handleVisibilityChange () {
    if (document.visibilityState === 'hidden') {
      setPaused(true)
      app.ticker.stop()
    } else {
      app.ticker.start()
    }
  }
  document.addEventListener('visibilitychange', handleVisibilityChange, false)
}

export default GameScene
