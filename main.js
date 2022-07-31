const MAP_SELECTION = 'default'
let DEBUG = false

const fontConfig = {
    fontFamily: '"Lucida Console", Monaco, monospace',
    fontSize: 8,
    fontWeight: 'bolder',
    fill: 'black'
}

// Works on PC =  "PICO-8 mono Regular"'
// Works on MAC = 'pico8'
const picoFontConfig = {
    fontFamily: 'pico8',
    fill: 'white'
}

const smallFont = { fontSize: 4 }
const largeFont = { fontSize: 8 }
const massiveFont = { fontSize: 16 }
const hugeFont = { fontSize: 50 }

const l = console.log
const pretty = number => Math.round(number/1000)

const FPS = 144
const ticksToSeconds = number => Math.round(number/FPS)
const secondsToTicks = number => number * FPS

const speeds = {
  1: 0.4,
  4: 0.6,
  8: 1,
  64: 2
}

const Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    Texture = PIXI.Texture,
    PictureSprite = PIXI.extras.PictureSprite,
    settings = PIXI.settings,
    Transform = PIXI.Transform

loader.add("pico8-mono.ttf")
loader.load(setupSplash)
//loader.load(setup)

const WIDTH = 1063
const HEIGHT = 735
const app = new PIXI.Application(WIDTH, HEIGHT, { antialias: false })
document.getElementById('container').appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x000000
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

let cycles = [5, 1, 5, 2, 5, 2, 4, 3, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 16, 16, 18, 18, 20, 20, 24, 24, 30, 30]

let gameSpeed = 1
let paused = false
let hour = 0
let day = 1
let year = 1
let seeds = 1
let season = 'summer'

let scene = null
let selected = null
let queen = null

let panel = null
let background = null
let ui = null
let uiTopBar = null
let populationText = null
let selectedSprite = null
let beeContainer = null
let nightDimmer = null
let backgroundScene = null
let hexBackground = null
let hexForeground = null
let flowerBed = null
let pausedText = null
let pauseFrame = null

let hexGrid = []
let flowers = []
let tickers = []
const bees = []

function setupSplash() {
  scene = 'splash'
  
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const splashscreen = new Graphics()
  splashscreen.beginFill(0xffd601)
  splashscreen.drawRect(0, 0, WIDTH, HEIGHT)
  container.addChild(splashscreen)

  const title = new PIXI.Text('Bee Game', { ...picoFontConfig, ...hugeFont, fill: '#c96f10' })
  title.anchor.set(0.5, 0)
  title.position.x = Math.round(WIDTH / 2 / 2)
  title.position.y = 30
  container.addChild(title)

  const catchphrase = new PIXI.Text('No bee puns guaranteed', { ...picoFontConfig, ...massiveFont, fill: 'black' })
  catchphrase.anchor.set(0.5, 0)
  catchphrase.position.x = Math.round(WIDTH / 2 / 2)
  catchphrase.position.y = 110
  container.addChild(catchphrase)

  const welcomeBee = Sprite.fromImage('images/bee/bee-drone-reference.png')
  welcomeBee.scale.x = 2
  welcomeBee.scale.y = 2
  welcomeBee.position.x = Math.round(WIDTH / 2 / 2) - 25
  welcomeBee.position.y = Math.round(HEIGHT / 2 / 2) - 0
  splashscreen.addChild(welcomeBee)

  const welcomeHoney = Sprite.fromImage('cell-honey-full.png')
  welcomeHoney.scale.x = 2
  welcomeHoney.scale.y = 2
  welcomeHoney.position.x = Math.round(WIDTH / 2 / 2) + 5
  welcomeHoney.position.y = Math.round(HEIGHT / 2 / 2) - 1
  splashscreen.addChild(welcomeHoney)

  const callback = () => {
    document.body.style['background-color'] = '#fff4bc'
    app.stage.removeChild(container)
    setup()
  }
  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  const button = Button(Math.round(WIDTH/2/2/2)-20, 120, '  Play', callback)
  scaler.addChild(button)
}

function setup() {
  scene = 'game'

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
    uiTopBar = new Graphics()
    uiTopBar.beginFill(0x000000)
    uiTopBar.drawRect(0, 0, 1024, 20)
    
    const colonyLabel = new PIXI.Text('Colony population', { ...picoFontConfig, ...largeFont, fill: 'gray' })
    colonyLabel.position.x = 5
    colonyLabel.position.y = 4
    uiTopBar.addChild(colonyLabel)

    populationText = new PIXI.Text('-', { ...picoFontConfig, ...largeFont })
    populationText.position.x = 156
    populationText.position.y = 4
    uiTopBar.addChild(populationText)

    const timelineText = new PIXI.Text('Year   Day   Hour', { ...picoFontConfig, ...largeFont, fill: 'gray' })
    timelineText.position.x = 210
    timelineText.position.y = 4
    uiTopBar.addChild(timelineText)
    
    const yearLabel = new PIXI.Text('-', { ...picoFontConfig, ...largeFont })
    yearLabel.anchor.set(1, 0)
    yearLabel.position.x = 260
    yearLabel.position.y = 4
    uiTopBar.addChild(yearLabel)

    const dayLabel = new PIXI.Text('-', { ...picoFontConfig, ...largeFont })
    dayLabel.anchor.set(1, 0)
    dayLabel.position.x = 308
    dayLabel.position.y = 4
    uiTopBar.addChild(dayLabel)

    const hourLabel = new PIXI.Text('-', { ...picoFontConfig, ...largeFont })
    hourLabel.anchor.set(1, 0)
    hourLabel.position.x = 364
    hourLabel.position.y = 4
    uiTopBar.addChild(hourLabel)

    addTicker('ui', time => {
      yearLabel.text = year
      dayLabel.text = day
      hourLabel.text = Math.round(hour)
    })

    pausedText = new PIXI.Text('Playing', { ...picoFontConfig, ...largeFont })
    pausedText.position.x = 470
    pausedText.position.y = 4
    uiTopBar.addChild(pausedText)

    pauseFrame = new Graphics()
    pauseFrame.lineStyle(10, 0x000000);
    pauseFrame.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
    ui.addChild(pauseFrame)

    ui.addChild(uiTopBar)
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

  const jobsPanel = Sprite.fromImage('ui-jobs-panel.png')
  jobsPanel.position.x = 140
  jobsPanel.position.y = 95
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
  
  hexGrid = new Array(9).fill().map((_, x) => 
    new Array(9).fill().map((_, y) => cellDisabled(x, y, hexForeground))
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
        selectedSprite.position.x = selected.position.x + 2
        selectedSprite.position.y = selected.position.y + 1
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
  hexForeground.addChild(selectedSprite)

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


function setGameSpeedText() {
  if (paused) {
    pausedText.text = 'Paused'
  } else if (gameSpeed === 1) {
    pausedText.text = '>'
  } else if (gameSpeed === 4) {
    pausedText.text = '>>'
  } else if (gameSpeed === 8) {
    pausedText.text = '>>>'
  } else if (gameSpeed === 64) {
    pausedText.text = '>>>>>>>'
  }
  pauseFrame.visible = paused
}

function singularOrPluralDay(amount) {
  if (amount === 1) return `${amount} day`
  return `${amount} days`
} 

function createSeasonTracker() {
  let storedCycles = null
  let lastStoredCycle = null
  let summerDayOffset = null

  const seasonTracker = Sprite.fromImage('images/ui/season-tracker/background.png')
  seasonTracker.position.x = 384
  seasonTracker.position.y = 3
  uiTopBar.addChild(seasonTracker)

  const seasonTrackerLabel = new PIXI.Text('Loading', { ...picoFontConfig, fontSize: 4 })
  seasonTrackerLabel.position.x = 378
  seasonTrackerLabel.position.y = 13
  uiTopBar.addChild(seasonTrackerLabel)

  const summerProgress = Sprite.fromImage('images/ui/season-tracker/bar-summer.png')
  const summerTexture = Texture.fromImage('images/ui/season-tracker/bar-summer.png')
  const winterTexture = Texture.fromImage('images/ui/season-tracker/bar-winter.png')
  summerProgress.position.x = 1
  summerProgress.position.y = 1
  seasonTracker.addChild(summerProgress)
  
  addTicker('ui', time => {
    const isSummer = season === 'summer'
    if (lastStoredCycle !== cycles.length) {
      summerDayOffset = isSummer ? 0 : storedCycles
      storedCycles = cycles[0]
      lastStoredCycle = cycles.length
    }
    const maxWidth = 65
    const dayFraction = (day-1-summerDayOffset) / storedCycles
    const hourFraction = hour / (storedCycles * 24)
    summerProgress.width = 65 * (dayFraction + hourFraction)
    const seasonLabel = isSummer ? 'Summer' : 'Winter'
    seasonTrackerLabel.text = `${seasonLabel} - ${singularOrPluralDay(cycles[0])} left` 
    summerProgress.texture = isSummer
      ? summerTexture
      : winterTexture
  })
}

function createWarningSign() {
  const queenWarning = Sprite.fromImage('images/queen/dialogue.png')
  queenWarning.dismissed = false
  queenWarning.position.x = 0
  queenWarning.position.y = 0
  queenWarning.visible = true
  queenWarning.interactive = true
  queenWarning.buttonMode = true
  queenWarning.mouseup = (e) => {
    queenWarning.dismissed = true
  }
  foreground.addChild(queenWarning)

  const textHeading = new PIXI.Text('WINTER IN ONE DAY', { ...picoFontConfig, fill: 'black' })
  textHeading.scale.set(0.15, 0.15)
  textHeading.position.x = 10
  textHeading.position.y = 3
  queenWarning.addChild(textHeading)

  addTicker('game-stuff', () => {
    queenWarning.position.x = queen.position.x - 2
    queenWarning.position.y = queen.position.y - 18

    if (season === 'winter') queenWarning.dismissed = false
    queenWarning.visible = isDayBeforeWinter() && !queenWarning.dismissed
  })
}

function isDayBeforeWinter() {
  return cycles[0] === 1 && season === 'summer'
}

function generateRandomId() {
  const chars = 'abcdefghijklmnopqrstuvx'
  let str = ''
  for (let i = 0; i < 20; i++) {
    str += chars[Math.floor(Math.random()*(chars.length-1))]
  }
  return str + '_' + Math.random()
}

function addTicker(type, func) {
  const id = generateRandomId()
  const tickerObject = {
    id,
    type,
    func,
    remove: false
  }
  tickers.push(tickerObject)
  return tickerObject
}

function removeTicker(id) {
  tickers.forEach(ticker => {
    if (ticker.id === id) {
      ticker.remove = true
    }
  })
}

function isUI(ticker) {
  return ticker.type === 'ui'
}

function isGameStuff(ticker) {
  return ticker.type === 'game-stuff'
}

function isBee() {

}

function gameloop(delta, manualTick) {
  const newTickers = tickers.filter(ticker => ticker.remove === false)
  if (tickers.length > newTickers.length) {
    newTickers.filter(ticker => ticker.remove).forEach(ticker => {
      delete ticker
    })
    tickers = tickers.filter(ticker => ticker.remove === false)
  }

  tickers.filter(isUI).forEach(ticker => ticker.func());

  if (selected && selected.panelContent) {
    const { x, y } = selected.panelPosition && selected.panelPosition() || { x: 350, y: 100 }
    panel.position.x = x
    panel.position.y = y
  }

  if (paused && !manualTick) return
  
  tickers.filter(isGameStuff).forEach(ticker => ticker.func());

  {
    // Time management
    hour += transferTo(24).inMinutes(5)

    if (hour > 24) {
      hour = 0
      day++
      cycles[0]--
      if (cycles[0] === 0) {
        cycles = cycles.slice(1)
        season = season === 'summer' ? 'winter' : 'summer'
        if (season === 'summer') {
          backgroundScene.texture = Texture.fromImage('images/scene/background-summer.png')        
          year++
          day = 1
          createFlowers()
        } else {
          backgroundScene.texture = Texture.fromImage('images/scene/background-winter.png')
          killFlowers()
          killBroodlings()
        }
      }
    }
  }
}

function createFlowers() {
  const positions = [10, -50, 60, -110, 120, -160, 170]
  for (var f = 0; f < seeds; f++) {
    const flower = Sprite.fromImage('images/scene/flower.png')

    const flipped = Math.random() < 0.5

    const flowerExclamation = Sprite.fromImage('exclamation-warning-mild.png')
    flowerExclamation.position.x = flipped ? -10 : 10
    flowerExclamation.position.y = -20
    flowerExclamation.visible = false
    flower.addChild(flowerExclamation)

    makeOccupiable(flower)
    makeSelectable(flower, 'flower')

    flower.POLLINATION_REQUIREMENT = 100
    flower.pollinationLevel = 0
    flower.isPollinated = () => flower.pollinationLevel >= flower.POLLINATION_REQUIREMENT
    
    flower.scale.x = flipped ? -1 : 1
    flower.anchor.set(flipped ? 0.6 : 0.2, 0.2)
    flower.position.x = Math.round((WIDTH / 4) + (positions[f] ? positions[f] : f))
    flower.position.y = 330
    flowerBed.addChild(flower)

    flower.panelLabel = () => false
    flower.panelPosition = () => flower.position

    flower.panelContent = () => {
      const container = new Container()
      
      const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
      whiteLine.position.x = 0
      whiteLine.position.y = -30
      container.addChild(whiteLine)

      const content = Sprite.fromImage('images/ui/content-flower.png')
      content.position.x = 72
      content.position.y = -29
      container.addChild(content)

      container.addChild(ProgressBar(124, -15, 'flower', () => flower.pollinationLevel, flower.POLLINATION_REQUIREMENT))

      const textHeading = new PIXI.Text('FLOWER', { ...picoFontConfig })
      textHeading.scale.set(0.15, 0.15)
      textHeading.position.x = 105
      textHeading.position.y = -26
      container.addChild(textHeading)

      const textDescription = new PIXI.Text('POLLINATED', { ...picoFontConfig, fill: '#96a5bc' })
      textDescription.scale.set(0.15, 0.15)
      textDescription.position.x = 82
      textDescription.position.y = -16
      container.addChild(textDescription)

     return container
    }

    addTicker('game-stuff', () => {
      flowerExclamation.visible = isDayBeforeWinter() && !flower.isPollinated()
      if (flower.isPollinated()) {
        flower.texture = Texture.fromImage('images/scene/flower-pollinated.png')        
      }
    })

    flowers.push(flower)
  }
}

function killFlowers() {
  if (flowers.filter(flower => flower.isPollinated()).length === flowers.length) {
    seeds++
  }
  if (selected && selected.label === 'flower') setSelected(null)
  flowers.forEach(flower => {
    flower.removeChild(flower.flowerSprite)
    delete flower.flowerSprite
    flowerBed.removeChild(flower)
    delete flower    
  })
  flowers = []
}

function killBroodlings() {
  forEachHexagon(hexGrid, hex => {
    if (hex.type === 'brood' && ['egg', 'larvae'].includes(hex.content)) {
      hex.kill()
    }
  })
}

function addJobsButtons(jobsPanel) {
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 2; j++) {
      {
        const button = Sprite.fromImage(j === 0 ? 'minus.png' : 'plus.png')
        button.position.x = 54 + (j * 12)
        button.position.y = 41 + (i * 38)
        button.interactive = true
        button.buttonMode = true
        button.alpha = 1
        button.mouseover = () => button.alpha = 0.7
        button.mouseout = () => button.alpha = 1
        const idx = ['forager', 'nurser', 'worker']
        const type = idx[i]
        const action = j === 0 ? 'remove' : 'add'
        button.mousedown = () => jobs(action, type)
        jobsPanel.addChild(button)
      }
    }
  }
}

function createMap(m) {
  createQueen(beeContainer)
   
  if (m === 'default') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)

    replaceHex([0, 0], 'prepared', 'activate').instantlyPrepare()
    replaceHex([0, 8], 'prepared', 'activate').instantlyPrepare()
    replaceHex([8, 0], 'prepared', 'activate').instantlyPrepare()
    replaceHex([8, 8], 'prepared', 'activate').instantlyPrepare()

    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)
  }

  if (m === 'die') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(1).setPollen(60)
  }

  if (m === 'loe') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(40).setAge(80).setWax(10)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60).setWax(10)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20).setWax(10)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10).setWax(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6).setWax(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5).setWax(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0).setWax(10)

    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)
    replaceHex([4, 5], 'prepared', 'activate').instantlyPrepare()
    replaceHex([4, 3], 'prepared', 'activate').instantlyPrepare()
  }

  if (m === 'die test') {
    createBee(beeContainer, 'idle').setHunger(60).setAge(99.8)
    createBee(beeContainer, 'idle').setHunger(60).setAge(99.7)
    createBee(beeContainer, 'idle').setHunger(40).setAge(70 - 20)
    
    replaceHex([2, 2], 'wax', 'activate')
    replaceHex([2, 3], 'honey', 'activate').setHoney(30)
  }

  if (m === 'stress') {
    seeds = 100

    for (let i = 0; i <100; i++) {
      createBee(beeContainer, 'forager') //.setPollen(30)
    }
    for (let i = 0; i <100; i++) {
      createBee(beeContainer, 'nurser')
    }
    for (let i = 0; i <100; i++) {
      createBee(beeContainer, 'worker')
    }
    
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const type = ['pollen', 'honey', 'wax', 'brood', 'converter'][Math.floor(Math.random()*5)]
        replaceHex([x, y], type, 'activate')
        // replaceSelectedHex(type)
        //activateAdjacent(x, y)  
      }
    }
  }

  if (m === 'prepared') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')
    setSelected(hexGrid[0][0])
    replaceSelectedHex('prepared').instantlyPrepare()
  }

  if (m === 'kill brood') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'nurser')
    
    setSelected(hexGrid[0][0])
    replaceSelectedHex('converter').setNectar(15)
    setSelected(hexGrid[0][1])
    replaceSelectedHex('pollen').setPollen(120)
    setSelected(hexGrid[0][2])

    setSelected(hexGrid[2][2])
    replaceSelectedHex('brood')
    setSelected(hexGrid[2][3])
    replaceSelectedHex('brood')
    setSelected(hexGrid[2][4])
    replaceSelectedHex('brood')

    setSelected(hexGrid[4][2])
    replaceSelectedHex('brood')
    setSelected(hexGrid[4][3])
    replaceSelectedHex('brood')
    setSelected(hexGrid[4][4])
    replaceSelectedHex('brood')
  }

  if (m === 'playtest') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey')
    setSelected(hexGrid[0][1])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][2])
    replaceSelectedHex('converter')
    setSelected(hexGrid[0][3])
    replaceSelectedHex('brood')
  }

  if (m === 'pollination scenario') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][1])
    replaceSelectedHex('converter')
  }

  if (m === 'honey-deposits') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager').setPollen(20)
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(60)
    setSelected(hexGrid[0][1])
    replaceSelectedHex('honey').setHoney(60)
  }

  if (m === 'sparse') {
    createBee(beeContainer, 'worker')
  }

  if (m === 'jobs') {
    paused = false
    for (var i = 0; i < 6; i++) {
      createBee(beeContainer, 'idle')
    }

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(15)
    setSelected(hexGrid[0][1])
    replaceSelectedHex('honey')
    setSelected(hexGrid[0][2])
    replaceSelectedHex('honey')

    setSelected(hexGrid[1][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[2][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[3][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[4][0])
    replaceSelectedHex('pollen')

    setSelected(hexGrid[0][3])
    replaceSelectedHex('converter').setNectar(15)
    setSelected(hexGrid[0][4])
    replaceSelectedHex('converter')
  }


  if (m === 'deposit nectar sceanrio') {
    createBee(beeContainer, 'forager').setNectar(18)
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('converter')
  }

  if (m === 'deposit honey sceanrio') {
    createBee(beeContainer, 'worker').setHoney(20)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('honey')
  }


  if (m === 'converter sceanrio') {
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(0)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('converter').setNectar(15)
  }

  if (m === 'brooder scenario') {
    // Things are prepared with pollen so you can breed directly
    createBee(beeContainer, 'nurser').setPollen(20)
    createBee(beeContainer, 'forager').setPollen(20)
    createQueen(beeContainer)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey')

    setSelected(hexGrid[0][2])
    replaceSelectedHex('pollen')
    hexGrid[0][2].pollen = hexGrid[0][2].POLLEN_HEX_CAPACITY
    
    setSelected(hexGrid[0][3])
    replaceSelectedHex('pollen')
    hexGrid[0][3].pollen = hexGrid[0][3].POLLEN_HEX_CAPACITY   

    setSelected(hexGrid[2][1])
    replaceSelectedHex('brood')
    hexGrid[2][1].setContents('egg')
  }  

  setSelected(null)
}

function activateAdjacent(_x, _y) {
  const instructions = _x % 2 === 0 ? DIRECTIONS_FLAT_EVEN : DIRECTIONS_FLAT_ODD
  for (direction in instructions) {
    const modifier = instructions[direction]
    const target = hexGrid[_x + modifier.x] && hexGrid[_x + modifier.x][_y + modifier.y]
    if (target && target.isDisabled && target.isDisabled()) {
      hexGrid[_x + modifier.x][_y + modifier.y] = cellEmpty(_x + modifier.x, _y + modifier.y, hexForeground, hexBackground)
    }
  }
}

function setSelected(item) {
  // start with cleanup of panel
  panel.removeChildren()
  
  selected = item || null

  if (!item) {
    return;  
  }

  panel.addChild(item.panelContent())

  if (item.label && !(item.panelLabel && item.panelLabel() !== true)) {
    const panelText = new PIXI.Text(item.label, { ...fontConfig })
    panelText.position.x = 6
    panelText.position.y = 2
    panel.addChild(panelText)
  }
}

function makeSelectable(sprite, label) {
  sprite.label = label || 'no name'
  sprite.interactive = true
  sprite.buttonMode = true
  sprite.alpha = 1
  sprite.mouseover = () => sprite.alpha = 0.7
  sprite.mouseout = () => sprite.alpha = 1
  sprite.mousedown = () => setSelected(sprite)
}

function makeOccupiable(parent) {
  const spotClaimed = PIXI.Sprite.fromImage('spot-claimed.png')
  spotClaimed.visible = false
  parent.addChild(spotClaimed)

  parent.slot = null
  parent.slotCounter = 0
  
  parent.isUnclaimed = attemptee => {
    if (!attemptee) {
      console.error('Needs input')
      return
    }
    return parent.slot === null || parent.slot === attemptee
  }

  parent.claimSlot = item => {
    parent.slot = item
    parent.slotCounter = secondsToTicks(1)
  }

  addTicker('game-stuff', time => {
    if (parent.slot) {
      parent.slotCounter = parent.slotCounter - gameSpeed
      if (parent.slotCounter <= 0) {
        parent.slot = null
      }
    }
    // spotClaimed.visible = !!parent.slot // enable for debug
  })
}

function makeFlyable(sprite) {
  sprite.vx = 0
  sprite.vy = 0
  sprite.flyTo = targetSprite => {
    if (!targetSprite) {
      targetSprite = {
        position: {
          x: sprite.idle.x,
          y: sprite.idle.y
        }
      }
    }
    const x = targetSprite.position.x - sprite.position.x
    const y = targetSprite.position.y - sprite.position.y

    sprite.setShadowPosition()
    if (x === 0 && y === 0) return
    const direction = new PIXI.Point(x, y).normalize()

    sprite.vx += direction.x * 0.030 * (gameSpeed * 5)
    sprite.vy += direction.y * 0.030 * (gameSpeed * 5)

    const distanceToTarget = distance(sprite, targetSprite)

    let maxSpeed = 0.28

    if (distanceToTarget < 12) maxSpeed = 0.17
    if (distanceToTarget < 9) maxSpeed = 0.12
    if (distanceToTarget < 6) maxSpeed = 0.07
    if (distanceToTarget < 3) maxSpeed = 0.05

    let velocity = new PIXI.Point(sprite.vx, sprite.vy)

    if (velocity.magnitude() > velocity.normalize().magnitude() * maxSpeed * gameSpeed) {
      velocity = new PIXI.Point(velocity.normalize().x * maxSpeed * gameSpeed, velocity.normalize().y * maxSpeed * gameSpeed)
    }
    sprite.vx = velocity.x
    sprite.vy = velocity.y

    sprite.position.x += sprite.vx
    sprite.position.y += sprite.vy
    snapTo(sprite, targetSprite)

    sprite.setShadowPosition()
  }
  sprite.isMoving = () => {
    return sprite.vx !== 0 || sprite.vy !== 0
  }
}

 

function makeHexDetectable(bee) {
  bee.isAtType = type => {
    const hexesInGrid = filterHexagon(hexGrid, hex => hex.type === type && samePosition(bee, hex))
    if (hexesInGrid.length > 0) return hexesInGrid[0]

    const flowerResult = flowers.filter(flower => samePosition(bee, flower))
    if (flowerResult.length > 0 && type === 'flower') return flowerResult[0]
    return null
  }
}

function goIdle(bee) {
  bee.position.x = bee.idle.x
  bee.position.y = bee.idle.y
}

function samePosition(a, b) {
  if (b) {
    return a.position.x === b.position.x && a.position.y === b.position.y
  } else {
    return function prepared(c) {
      return a.position.x === c.position.x && a.position.y === c.position.y
    }
  } 
}

function distance(a, b) {
  const x2 = Math.abs(a.position.x - b.position.x) * 2
  const y2 = Math.abs(a.position.y - b.position.y) * 2
  return Math.sqrt(x2 + y2)
}

function snapTo(a, b) {
  const threshold = gameSpeed > 4 ? 4 : 2.5 
  if (distance(a, b) < threshold) {
    a.position.x = b.position.x
    a.position.y = b.position.y
    a.vx = 0
    a.vy = 0
  }
}

const f = {
  converter: cellConverter,
  brood: cellBrood,
  pollen: cellPollen,
  honey: cellHoney,
  wax: cellWax,
  prepared: cellPrepared
}

function replaceHex(coordinate, type, activate) {
  const [x, y] = coordinate

  if (activate === 'activate') activateAdjacent(x, y)

  hexForeground.removeChild(hexGrid[x][y])
  delete hexGrid[x][y]
  
  if (!f[type]) {
    console.error('No type!')
  }
  const newHex = f[type](x, y, hexForeground)
  hexGrid[x][y] = newHex


  return newHex
}

function replaceSelectedHex(type) {
  let returnHex = null
  hexGrid.forEach((row, xIdx) => row.forEach((hex, yIdx) => {
    if (hex === selected) {
      hexForeground.removeChild(hex)
      delete hex
      
      if (!f[type]) {
        console.error('No type!')
      }
      const newHex = f[type](xIdx, yIdx, hexForeground)
      hexGrid[xIdx][yIdx] = newHex
      returnHex = newHex
      setSelected(newHex)
    }
  }))
  return returnHex;
}

function cap(min, max) {
  return value => Math.max(Math.min(max, value), min)
}

function toGameTick(seconds) {
  return seconds * FPS
}

function fromSeconds(gameTicks) {
  return gameTicks / 144
}

function rate(capacity, seconds) {
  return capacity / (seconds * FPS) * gameSpeed
}

function transferTo(capacity) {
  return {
    inSeconds: seconds => rate(capacity, seconds),
    inMinutes: minutes => {
      const seconds = minutes * 60
      return rate(capacity, seconds)
    }
  }
}

function typeIdlePos(type, pos) {
  const rowHeight = 38
  const beesPerRow = 8
  const baseline = 106
  const y = {
    unassigned: baseline,
    idle: baseline,
    [null]: baseline,
    forager: baseline + (1 * rowHeight),
    nurser: baseline + (2 * rowHeight),
    worker: baseline + (3 * rowHeight),
  }[type]

  return {
    x: 210 - (pos % beesPerRow) * 11,
    y: y + (Math.floor(pos / beesPerRow) * 10)
  }
}

function getIdlePosition(type) {
  const filteredBees = bees.filter(x => x.type === type && !x.isDead())
  let found = false
  let idx = 0
  let comparee = null
  do {
    comparee = typeIdlePos(type, idx)
    const occupied = filteredBees.find(({ idle }) => {
      const { x, y } = idle
      return comparee.x === x && comparee.y === y
    })
    if (occupied) {
      idx++
    } else {
      found = true
    }
    
  } while(!found)

  return comparee
}

function makeHungry(bee) {
  bee.HUNGER_CAPACITY = 100
  bee.hunger = bee.HUNGER_CAPACITY
  bee.isDead = () => bee.hunger <= 0 || bee.age >= 100
  bee.isWellFed = () => bee.hunger >= bee.HUNGER_CAPACITY
  bee.isHungry = () => bee.hunger < 30
  bee.setHunger = amount => { bee.hunger = cap(0, bee.HUNGER_CAPACITY)(amount); return bee }

  bee.consumeEnergy = () => {
    // A bee will survive approx 15 minuter at speed 1 with a full belly, which is 15 min * 60 sec = 900 sec
    // 900 sec * 144 FPS = 129600 game ticks
    // 100 hunger value points / 129600 gameticks = 0.00077160 reduction in hunger each tick
    bee.hunger -= transferTo(bee.HUNGER_CAPACITY).inSeconds(900)
    bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)

    if (bee.hunger <= 0) {
      bee.setType('dead')
    }
  }

  bee.eat = () => {
    bee.hunger += transferTo(bee.HUNGER_CAPACITY).inSeconds(20)      
    bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)
  }

  bee.feedBee = () => {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.honey > 0 && hex.isUnclaimed(bee))
    
    const honeyTarget = bee.isAtType('honey')
    if (honeyTarget && !bee.isWellFed() && honeyTarget.honey > 0) {
      honeyTarget.claimSlot(bee)
      bee.eat()
      honeyTarget.honey -= transferTo(honeyTarget.HONEY_HEX_CAPACITY).inSeconds(40)
      if (bee.isWellFed()) {
        bee.position.y = honeyTarget.position.y - 5
      }
      return true
    } else {
      bee.consumeEnergy()
    }

    if (honeyHex.length > 0 && bee.isHungry()) {
      honeyHex[0].claimSlot(bee)
      bee.flyTo(honeyHex[0])
      return true
    }
    return false
  }
}

function makeParticleCreator(bee) {
  bee.particleDelay = 0
  bee.particleActive = true
  let transferRate = 0

  bee.disableParticle = () => bee.particleActive = false

  bee.removeParticleTicker = () => {
    bee.disableParticle()
    bee.particleTicker.remove = true
  }

  bee.particleTicker = addTicker('game-stuff', time => {
    if (!bee.particleActive) return bee.removeParticleTicker()
    if (bee.pollenSack < bee.POLLEN_SACK_CAPACITY) return

    if (bee.particleDelay <= 0) {
      transferRate = (Math.random() * 1) + 0.8
      bee.particleDelay = 1

      const pollenPixel = Sprite.fromImage('pollen-pixel.png')
      pollenPixel.position.x = bee.position.x + 2 + (Math.random() * 4)
      pollenPixel.position.y = bee.position.y + 4 + (Math.random() * 3) - 1.5
      let lifetime = 0
      const removeParticle = () => pollenPixel.particle.remove = true 
      pollenPixel.particle = addTicker('game-stuff', time => {
        if (!bee.particleActive) {
          removeParticle()
          foreground.removeChild(pollenPixel)
          delete pollenPixel
          return
        }
        pollenPixel.position.y += 0.0003 * FPS * gameSpeed
        lifetime += transferTo(1).inSeconds(1)
        if (lifetime > 1) {
          removeParticle()
          foreground.removeChild(pollenPixel)
          delete pollenPixel
        }
      })
      foreground.addChild(pollenPixel)
      return
    }
    bee.particleDelay -= transferTo(1).inSeconds(transferRate)
  })
}

const isForager = b => b.type === 'forager'
const isIdle = b => b.type === 'idle'

function jobs(addOrRemove, type) {
  const aliveBees = bees.filter(bee => !bee.isDead())
  const availableBees = aliveBees.filter(addOrRemove === 'add' ? isIdle : x=>x.type===type)

  if (availableBees.length > 0) {
    availableBees[0].setType(addOrRemove === 'add' ? type : 'idle')
  }
}

function increaseForagers() {
  const idleBees = bees.filter(isIdle)

  if (idleBees.length > 0) {
    idleBees[0].type = 'forager'
  }
}

function decreaseForagers() {
  const foragerBees = bees.filter(isForager)

  if (foragerBees.length > 0) {
    foragerBees[0].type = 'idle'
  }
}

function createQueen(parent) {
  const queenSprite = PIXI.Sprite.fromImage('images/queen/bee-queen.png')

  makeSelectable(queenSprite, 'queen')
  queenSprite.type = 'queen'
  
  const queenWingAddon = Sprite.fromImage('images/queen/bee-queen-wings-flapped.png')
  queenWingAddon.visible = false
  queenSprite.addChild(queenWingAddon)
  
  const queenLegAddon = Sprite.fromImage('images/queen/bee-queen-legs-jerk.png')
  queenLegAddon.visible = false
  queenSprite.addChild(queenLegAddon)
  
  queenSprite.idle = {
    x: 250,
    y: 56
  }
  goIdle(queenSprite)
  queenSprite.animationTicker = Math.random() * 100
  queenSprite.delay = 0

  makeFlyable(queenSprite)
  makeHexDetectable(queenSprite)

  queenSprite.setShadowPosition = () => {}

  const helperText = () => {
    if (season === 'winter') return 'Does not\nlay eggs\nin winter'
    if (queenSprite.isAtType('brood')) return 'Laying egg'
    if (!queenSprite.isMoving()) return 'Cannot find\nempty brood\nhexagon to\nlay eggs in'
    return '-'
  }   

  queenSprite.panelLabel = () => false
  queenSprite.panelPosition = () => ({ x: queenSprite.position.x + 8, y: queenSprite.position.y + 5 })

  queenSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-queen.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    const textHeading = new PIXI.Text('QUEEN', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 100
    textHeading.position.y = -26
    container.addChild(textHeading)

    const helper = new PIXI.Text('Loading...', { ...picoFontConfig })
    helper.scale.set(0.15, 0.15)
    helper.position.x = 82
    helper.position.y = -14
    container.addChild(helper)

    addTicker('ui', () => helper.text = helperText())
    
    return container
  }

  addTicker('game-stuff', time => {
    queenSprite.animationTicker += speeds[gameSpeed]
    
    const targetBrood = queenSprite.isAtType('brood')
    
    queenWingAddon.visible = (queenSprite.vx !== 0 || queenSprite.vy !== 0) && Math.sin(queenSprite.animationTicker) > 0
    queenLegAddon.visible = (queenSprite.vx === 0 && queenSprite.vy === 0 && targetBrood) && Math.sin(queenSprite.animationTicker) > 0

    if (targetBrood && season === 'summer') {
      queenSprite.delay += transferTo(1).inSeconds(30)
      if (queenSprite.delay < 1) return true
      queenSprite.delay = 0
      targetBrood.setContents('egg')
      queenSprite.position.y = queenSprite.position.y - 5
      return true
    }

    const emptyBroodCells = filterHexagon(hexGrid, hex => hex.type === 'brood' && !hex.isOccupiedWithOffspring() && hex.paused === false)
    if (emptyBroodCells.length > 0 && season === 'summer') {
      queenSprite.flyTo(emptyBroodCells[0])
      return true
    }
    queenSprite.flyTo(null)
    return false
  })

  queen = queenSprite
  parent.addChild(queenSprite)
}

function createBee(parent, type, startPosition) {
  const bee = Sprite.fromImage('images/bee/bee-drone-body.png')
  bee.opacity = 1
  
  const shadow = Sprite.fromImage('images/bee/shadow.png')
  bee.addChild(shadow)
  
  const animationSprite = Sprite.fromImage('images/hex/nectar/cell-conversion-animation-a.png')
  animationSprite.position.y = -2
  animationSprite.visible = true
  animationSprite.delay = 0
  bee.addChild(animationSprite)
  
  const beeAddon = Sprite.fromImage('images/bee/bee-drone-legs.png')
  beeAddon.position.x = -1
  beeAddon.position.y = -1
  beeAddon.opacity = 1
  bee.addChild(beeAddon)
  const honeyDrop = Sprite.fromImage('drop-honey.png')
  honeyDrop.position.x = 2
  honeyDrop.position.y = 6
  bee.addChild(honeyDrop)
  const nectarDrop = Sprite.fromImage('drop-nectar.png')
  nectarDrop.position.x = 0
  nectarDrop.position.y = 5
  bee.addChild(nectarDrop)
  const waxDrop = Sprite.fromImage('drop-wax.png')
  waxDrop.position.x = -2
  waxDrop.position.y = 5
  bee.addChild(waxDrop)
  const beeExclamation = Sprite.fromImage('exclamation-warning-severe.png')
  beeExclamation.position.x = 12
  beeExclamation.position.y = -2
  beeExclamation.visible = false
  bee.addChild(beeExclamation)
  makeSelectable(bee, 'bee')
  makeHungry(bee)
  makeParticleCreator(bee)
  const isAt = samePosition(bee)
  bee.idle = getIdlePosition(type)
  goIdle(bee)
  if (startPosition) {
    bee.position.x = startPosition.x
    bee.position.y = startPosition.y
  }
  makeFlyable(bee)
  makeHexDetectable(bee)
  bee.animationTicker = Math.random() * 100
  bee.NECTAR_SACK_CAPACITY = 20
  bee.POLLEN_SACK_CAPACITY = 20
  bee.HONEY_SACK_CAPACITY = 10
  bee.WAX_SACK_CAPACITY = 10
  
  bee.age = 0
  bee.setAge = amount => { bee.age = amount; return bee }
  bee.pollenSack = 0
  bee.setPollen = amount => { bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(amount); return bee }
  bee.nectarSack = 0
  bee.setNectar = amount => { bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(amount); return bee }
  bee.honeySack = 0
  bee.setHoney = amount => { bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(amount); return bee }
  bee.waxSack = 0
  bee.setWax = amount => { bee.waxSack = cap(0, bee.WAX_SACK_CAPACITY)(amount); return bee }
  bee.type = type || 'unassigned'
  bee.setType = type => { bee.type = type; bee.idle = getIdlePosition(type) }
  bee.determineIfVisible = () => bee.isAtType('converter') ? bee.hideBee() : bee.showBee()
  bee.showBee = () => {
    bee.opacity = 1
    beeAddon.visible = true
  }
  bee.hideBee = () => {
    bee.opacity = 0
    beeAddon.visible = false
  }

  bee.destroy = () => {
    bee.removeUiTicker()
    bee.removeTicker()
    bee.removeParticleTicker()
  }
  
  const isPollenSackFull = () => bee.pollenSack >= bee.POLLEN_SACK_CAPACITY
  const isPollenSackEmpty = () => !(bee.pollenSack > 0)

  const isNectarSackFull = () => bee.nectarSack >= bee.NECTAR_SACK_CAPACITY
  const isNectarSackEmpty = () => !(bee.nectarSack > 0)

  const isHoneySackFull = () => bee.honeySack >= bee.HONEY_SACK_CAPACITY
  const isHoneySackEmpty = () => !(bee.honeySack > 0)

  const isWaxSackFull = () => bee.waxSack >= bee.WAX_SACK_CAPACITY
  const isWaxSackEmpty = () => !(bee.waxSack > 0)

  const helperText = () => {
    if (bee.type === 'dead' && bee.hunger === 0) {
      return 'Bee died\nof hunger'
    }
    if (bee.type === 'dead') {
      return 'Bee died\nof old age'
    }
    if (bee.type === 'worker' && bee.isHungry()) {
      return '  Bee is\nhungry\n\nWorkers\neat when\nmaking honey'
    }
    if (bee.type !== 'worker' && bee.isHungry()) {
      return '  Bee is\nhungry\n\nNeeds access\nto honey\nhexagon'
    }
    if (bee.type === 'forager' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y && isPollenSackFull()) {
      return 'Cannot find\nunoccupied\npollen hexagon'
    }
    if (bee.type === 'forager' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Cannot find\nunoccupied\nflower'
    }
    if (bee.type === 'nurser' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      if (isPollenSackFull()) {
        return 'Cannot find\nlarvae'
      } else {
        return 'Cannot find\npollen hexagon'
      }
    }
    if (bee.type === 'worker' && !bee.isMoving() && isHoneySackFull() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Honey sack\nfull. Cannot\nfind honey\nhexagon to\ndeposit honey\ntoo'
    }
    if (bee.type === 'worker' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Cannot find a\nconverter hex\nfilled with\nnectar'
    }
    if (bee.type === 'idle') {
      return 'Bee needs\na job'
    }
    return ''
  }

  bee.panelLabel = () => false
  bee.panelPosition = () => ({ x: bee.position.x + 8, y: bee.position.y + 5 })

  bee.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = -3
    whiteLine.position.y = -38
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-boilerplate.png')
    content.position.x = 72
    content.position.y = -37
    container.addChild(content)

    const beeExclamationLabel = Sprite.fromImage('exclamation-warning-severe.png')
    beeExclamationLabel.position.x = 84
    beeExclamationLabel.position.y = 29
    beeExclamationLabel.visible = false
    container.addChild(beeExclamationLabel)

    const bs = -23
    const p = [bs, bs + (1 * 9), bs + (2 * 9), bs + (3 * 9), bs + (4 * 9), bs + (5 * 9)]
    container.addChild(ProgressBar(112, p[0], 'hunger', () => bee.hunger, bee.HUNGER_CAPACITY))
    container.addChild(ProgressBar(112, p[1], 'honey', () => bee.honeySack, bee.HONEY_SACK_CAPACITY))
    container.addChild(ProgressBar(112, p[2], 'nectar', () => bee.nectarSack, bee.NECTAR_SACK_CAPACITY))
    container.addChild(ProgressBar(112, p[3], 'wax', () => bee.waxSack, bee.WAX_SACK_CAPACITY))
    container.addChild(ProgressBar(112, p[4], 'pollen', () => bee.pollenSack, bee.POLLEN_SACK_CAPACITY))
    container.addChild(ProgressBar(112, p[5], 'age', () => bee.age, 100))
    
    const textHeading = new PIXI.Text('BEE', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 100
    textHeading.position.y = -34
    container.addChild(textHeading)

    const texts = ['HUNGER', 'HONEY', 'NECTAR', 'WAX', 'POLLEN', 'AGE']

    texts.forEach((text, idx) => {
      const textDescription = new PIXI.Text(text, { ...picoFontConfig, fill: '#96a5bc' })
      textDescription.scale.set(0.15, 0.15)
      textDescription.position.x = 82
      textDescription.position.y = -24 + (idx * 9)
      container.addChild(textDescription)
    })

    const helper = new PIXI.Text('Loading...', { ...picoFontConfig, lineHeight: 44 })
    helper.scale.set(0.15, 0.15)
    helper.position.x = 82
    helper.position.y = 31
    container.addChild(helper)

    addTicker('ui', () => {
      beeExclamationLabel.visible = bee.isHungry() && !bee.isDead()
      helper.text = helperText().toUpperCase()
    })
    
    return container
  }

  function flyToAndDepositNectar() {
    
    const targetHex = bee.isAtType('converter')
    if (targetHex && !isNectarSackEmpty()) {
      targetHex.claimSlot(bee)
      bee.nectarSack -= transferTo(bee.NECTAR_SACK_CAPACITY).inSeconds(5)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)
      targetHex.nectar += transferTo(targetHex.NECTAR_CAPACITY).inSeconds(5)
      targetHex.nectar = cap(0, targetHex.NECTAR_CAPACITY)(targetHex.nectar)
      return true
    }

    if (!isNectarSackFull()) return false

    const converterNeedsNectar = filterHexagon(hexGrid, hex => hex.type === 'converter' && !hex.isNectarFull() && hex.isUnclaimed(bee))
    
    if (converterNeedsNectar.length === 0) return false

    converterNeedsNectar[0].claimSlot(bee)
    bee.flyTo(converterNeedsNectar[0])
    
    return true
  }

  function pollinateFlower() {
    const flower = bee.isAtType('flower')
    const needsResource = !(isPollenSackFull() && isNectarSackFull())
    if (flower && needsResource) { 
      flower.claimSlot(bee)
      flower.pollinationLevel += transferTo(flower.POLLINATION_REQUIREMENT).inSeconds(200)
      flower.pollinationLevel = cap(0, flower.POLLINATION_REQUIREMENT)(flower.pollinationLevel)
      bee.pollenSack += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(40)
      bee.nectarSack += transferTo(bee.NECTAR_SACK_CAPACITY).inSeconds(40)
      bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)
      if (isPollenSackFull() && isNectarSackFull()) {
        bee.position.y = flower.position.y - 5
      }
      return true
    }    
    return false
  }

  function flyToFlower() {
    const flower = flowers.find(flower => flower.isUnclaimed(bee))
    const needsResource = !(isPollenSackFull() && isNectarSackFull())

    if (needsResource && flower) {
      flower.claimSlot(bee)
      bee.flyTo(flower)
      return true
    }
    return false
  }

  function depositPollen() {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)  
    bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)
    if (isPollenSackEmpty() || hex.isPollenFull()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function refillPollen() {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)  
    bee.pollenSack += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)
    if (isPollenSackFull() || hex.isPollenEmpty()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function refillWax() {
    const hex = bee.isAtType('wax')
    if (!hex) return false
    hex.claimSlot(bee)  
    bee.waxSack += transferTo(bee.WAX_SACK_CAPACITY).inSeconds(30)
    bee.wax = cap(0, bee.WAX_SACK_CAPACITY)(bee.waxSack)
    hex.wax -= transferTo(bee.WAX_SACK_CAPACITY).inSeconds(30)
    hex.wax = cap(0, hex.WAX_HEX_CAPACITY)(hex.wax)
    if (isWaxSackFull() || hex.isWaxEmpty()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }


  function flyToPollenToDeposit() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenFull())
    if (pollenHex.length === 0 || isPollenSackEmpty()) return false
    pollenHex[0].claimSlot(bee)
    bee.flyTo(pollenHex[0])      
    return true
  }

  function flyToPollenToRefill() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenEmpty())
    if (pollenHex.length === 0 || isPollenSackFull()) return false
    pollenHex[0].claimSlot(bee)
    bee.flyTo(pollenHex[0])      
    return true
  }

  function flyToBroodling() {
    const larvaeHex = filterHexagon(hexGrid, hex => 
      hex.type === 'brood' &&
      hex.content === 'larvae' &&
      hex.isUnclaimed(bee) && 
      !hex.isWellFed()
    ).sort((a, b) => a.nutrition > b.nutrition ? 1 : -1)

    if (larvaeHex.length === 0 || isPollenSackEmpty()) return false
    larvaeHex[0].claimSlot(bee)
    bee.flyTo(larvaeHex[0])
    return true
  }

  function flyToCleanBrood() {
    const deadLarvaeHex = filterHexagon(hexGrid, hex => 
      hex.type === 'brood' &&
      hex.isUnclaimed(bee) && 
      hex.isDead()
    )

    if (deadLarvaeHex.length === 0) return false
    deadLarvaeHex[0].claimSlot(bee)
    bee.flyTo(deadLarvaeHex[0])
    return true
  }

  function nurseBroodling() {
    const isAtAnyLarvae = filterHexagon(hexGrid, hex => hex.type === 'brood' && hex.content === 'larvae' && hex.isUnclaimed(bee) && isAt(hex))
    if (isAtAnyLarvae.length === 0 || isPollenSackEmpty()) return false
    
    isAtAnyLarvae[0].claimSlot(bee)
    bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(40)
    isAtAnyLarvae[0].nutrition += transferTo(isAtAnyLarvae[0].NUTRITION_CAPACITY).inSeconds(10)
    isAtAnyLarvae[0].nutrition = cap(0, isAtAnyLarvae[0].NUTRITION_CAPACITY)(isAtAnyLarvae[0].nutrition) 
    return true   
  }

  function cleanBrood() {
    const hex = bee.isAtType('brood')
    if (!hex) return false
    hex.claimSlot(bee)  
    hex.corpseCleaned -= transferTo(hex.CORPSE_DELAY).inSeconds(10)
    if (hex.corpseCleaned <= 0) {
      bee.position.y = hex.position.y - 5
    }
    return true    
  }

  function ageBee() {
    bee.age += transferTo(100).inMinutes(70)
    if (bee.age >= 100) {
      bee.setType('dead')
      return true
    }
  }

  function idle() {
    bee.showBee()
    if (ageBee()) return
    if (bee.feedBee()) return
    bee.flyTo(null)
  }

  function forager() {
    bee.showBee()
    if (ageBee()) return
    if (bee.feedBee()) return
    if (pollinateFlower()) return
    if (depositPollen()) return    
    if (flyToAndDepositNectar()) return
    if (flyToPollenToDeposit()) return    
    if (flyToFlower()) return    
    bee.flyTo(null)
  }

  function nurser() {
    bee.showBee()
    if (ageBee()) return
    if (bee.feedBee()) return
    if (refillPollen()) return
    if (nurseBroodling()) return
    if (season !== 'summer') {
      if (cleanBrood()) return
      if (flyToCleanBrood()) return
    }  
    if (flyToPollenToRefill()) return
    if (flyToBroodling()) return
    bee.flyTo(null)
  }

  function worker() {
    bee.determineIfVisible()
    if (ageBee()) return
    if (season === 'summer') {
      if (depositHoney()) return
      if (flyToHoney()) return
      bee.consumeEnergy()
    } else {
      if (bee.feedBee()) return
    }
    if (refillWax()) return
    if (prepareCell()) return
    if (flyToPrepareCell()) return
    if (flyToWax()) return
    if (convertNectar()) return
    if (flyToConverter()) return
    bee.flyTo(null)
  }

  function convertNectar() {
    const hex = bee.isAtType('converter')
    if (!hex || isHoneySackFull()) return false
    hex.claimSlot(bee)
    hex.nectar -= transferTo(hex.NECTAR_CAPACITY).inSeconds(30)
    hex.nectar = cap(0, hex.NECTAR_CAPACITY)(hex.nectar)
    bee.honeySack += transferTo(bee.HONEY_SACK_CAPACITY).inSeconds(30)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)
    bee.eat()
    if (isHoneySackFull() || hex.isNectarEmpty()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToConverter() {
    const converterHex = filterHexagon(hexGrid, hex => hex.type === 'converter' && hex.isUnclaimed(bee) && !hex.isNectarEmpty())
    if (converterHex.length === 0 || isHoneySackFull()) return false
    converterHex[0].claimSlot(bee)
    bee.flyTo(converterHex[0])      
    return true
  }

  function depositHoney() {
    const hex = bee.isAtType('honey')
    if (!hex) return false
    hex.claimSlot(bee)

    hex.honey += transferTo(hex.HONEY_HEX_CAPACITY / 3).inSeconds(5)
    hex.honey = cap(0, hex.HONEY_HEX_CAPACITY)(hex.honey)

    bee.honeySack -= transferTo(bee.HONEY_SACK_CAPACITY).inSeconds(5)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)

    if (isHoneySackEmpty() || hex.isHoneyFull()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToHoney() {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.isUnclaimed(bee) && !hex.isHoneyFull())
    if (honeyHex.length === 0 || !isHoneySackFull()) return false
    honeyHex[0].claimSlot(bee)
    bee.flyTo(honeyHex[0])      
    return true
  }

  function flyToWax() {
    const waxHex = filterHexagon(hexGrid, hex => hex.type === 'wax' && hex.isUnclaimed(bee) && !hex.isWaxEmpty())
    if (waxHex.length === 0 || isWaxSackFull()) return false
    waxHex[0].claimSlot(bee)
    bee.flyTo(waxHex[0])      
    return true
  }

  function prepareCell() {
    if (isWaxSackEmpty()) return
    const hex = bee.isAtType('prepared')
    if (!hex) return false
    hex.claimSlot(bee)

    hex.completeness += transferTo(100).inSeconds(20)
    hex.completeness = cap(0, 100)(hex.completeness)

    bee.waxSack -= transferTo(bee.WAX_SACK_CAPACITY).inSeconds(5)
    bee.waxSack = cap(0, bee.WAX_SACK_CAPACITY)(bee.waxSack)
    
    if (hex.completeness >= 100) {
      activateAdjacent(hex.index.x, hex.index.y)
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToPrepareCell() {
    if (isWaxSackEmpty()) return
    const preparedHex = filterHexagon(hexGrid, hex => hex.type === 'prepared' && hex.isUnclaimed(bee) && hex.completeness < 100)
    if (preparedHex.length === 0) return false
    preparedHex[0].claimSlot(bee)
    bee.flyTo(preparedHex[0])      
    return true
  }

  bee.setShadowPosition = () => {
    const xPos = 0 - bee.position.x + bee.idle.x + 2
    shadow.position.x = bee.scale.x === 1 ? xPos : -xPos - 6
    shadow.position.y = 0 - bee.position.y + bee.idle.y + 4
  }

  bee.removeUiTicker = () => bee.uiTicker.remove = true

  bee.uiTicker = addTicker('ui', time => {
    bee.setShadowPosition()
  })

  bee.removeTicker = () => bee.ticker.remove = true

  bee.ticker = addTicker('game-stuff', time => {
    bee.setShadowPosition()
    {
      animationSprite.delay++
      animationSprite.delay = animationSprite.delay < 12 ? animationSprite.delay : 0
      const isConverting = bee.isAtType('converter') && bee.type === 'worker'
      if (isConverting) {
        animationSprite.visible = true
        animationSprite.texture = animationSprite.delay > 6
          ? Texture.fromImage('images/hex/nectar/cell-conversion-animation-a.png')
          : Texture.fromImage('images/hex/nectar/cell-conversion-animation-b.png')
      } else {
        animationSprite.visible = false
      }
    }

    const deadPosition = 32
    if (bee.position.y === deadPosition) return

    if (bee.isDead()) {
      bee.texture = Texture.fromImage('images/bee/bee-drone-dead.png')
      honeyDrop.visible = false
      nectarDrop.visible = false
      waxDrop.visible = false
      beeAddon.visible = false
      beeExclamation.visible = false
      bee.disableParticle()
      if (bee.position.y !== deadPosition) {
        bee.position.x = 65 + (Math.random() * 100)
        bee.position.y = deadPosition
      }
      bee.destroy()
      return
    }

    beeExclamation.visible = bee.isHungry()
    
    bee.animationTicker += speeds[gameSpeed]

    honeyDrop.visible = isHoneySackFull()
    nectarDrop.visible = isNectarSackFull()
    waxDrop.visible = isWaxSackFull()

    if (bee.vx !== 0 || bee.vy !== 0) {
      (bee.vx >= -0.15 || bee.vx === 0) ? bee.scale.set(1, 1) : bee.scale.set(-1, 1) //
      if (Math.sin(bee.animationTicker) > 0) {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-wings.png')
      } else {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-wings-flapped.png')
      }
    } else {
      bee.scale.set(1, 1)
      if ((bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) || Math.sin(bee.animationTicker / 2) > 0) {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-legs.png')
      } else {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-legs-jerk.png')
      }
    }

    if (bee.type === 'unassigned') {
      const rand = Math.random()
      if (rand < 0.3) {
        bee.type = 'forager'
      } else if (rand < 0.6) {
        bee.type = 'nurser'
      } else {
        bee.type = 'worker'
      }      
    }

    if (bee.type === 'forager') forager()
    if (bee.type === 'nurser') nurser()
    if (bee.type === 'worker') worker()
    if (bee.type === 'idle') idle()
    
    bee.setShadowPosition()
  })

  bees.push(bee)
  parent.addChild(bee)
  return bee
}

function cellDisabled(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const disabledSprite = Sprite.fromImage('cell-disabled.png')
  disabledSprite.position.x = pixelCoordinate.x
  disabledSprite.position.y = pixelCoordinate.y
  disabledSprite.isDisabled = () => true
  disabledSprite.index = { x, y }

  parent.addChild(disabledSprite)
  return disabledSprite
}

function cellEmpty(x, y, parent, parent2) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const emptySprite = Sprite.fromImage('cell-empty.png')
  makeSelectable(emptySprite, 'cell')
  emptySprite.position.x = pixelCoordinate.x
  emptySprite.position.y = pixelCoordinate.y

  emptySprite.panelLabel = () => false
  emptySprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  emptySprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/prepare-cell.png')
    whiteLine.anchor.set(0, 0.65)
    container.addChild(whiteLine)

    const description = Sprite.fromImage('images/ui/prepare-cell-hover.png')
    description.visible = false
    description.position.x = 95
    description.position.y = -29
    container.addChild(description)

    const buttonText = Sprite.fromImage('images/text/prepare.png')
    buttonText.position.x = 24
    buttonText.position.y = 2
    buttonText.anchor.set(0.5, 0)
    
    const button = Button(44, -29, buttonText, () => replaceSelectedHex('prepared'), () => description.visible = true, () => description.visible = false)
    container.addChild(button)

    return container
  }
  
  parent.addChild(emptySprite)

  const backgroundSprite = Sprite.fromImage('cell-background.png')
  backgroundSprite.position.x = pixelCoordinate.x - 10
  backgroundSprite.position.y = pixelCoordinate.y - 10
  parent2.addChild(backgroundSprite)

  return emptySprite
}

function cellPrepared(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const preparedCellSprite = Sprite.fromImage('cell-prepared-partial1.png')

  const spriteExclamation = Sprite.fromImage('exclamation-warning-severe.png')
  spriteExclamation.position.x = 14
  spriteExclamation.position.y = -6
  spriteExclamation.visible = false
  preparedCellSprite.addChild(spriteExclamation)

  makeSelectable(preparedCellSprite, 'prepared')
  makeOccupiable(preparedCellSprite)
  preparedCellSprite.position.x = pixelCoordinate.x
  preparedCellSprite.position.y = pixelCoordinate.y
  preparedCellSprite.completeness = 0
  preparedCellSprite.done = false
  preparedCellSprite.type = 'prepared'
  preparedCellSprite.index = { x, y }

  preparedCellSprite.instantlyPrepare = () => {
    preparedCellSprite.completeness = 100
  }

  const needsHelp = () => preparedCellSprite.completeness <= 100 && bees.filter(({ type }) => type === 'worker').length === 0
  
  preparedCellSprite.panelLabel = () => false
  preparedCellSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  preparedCellSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const contentHoney = Sprite.fromImage('images/ui/button-large/button-large-content-honey.png')
    const contentBrood = Sprite.fromImage('images/ui/button-large/button-large-content-brood.png')
    const contentPollen = Sprite.fromImage('images/ui/button-large/button-large-content-pollen.png')
    const contentNectar = Sprite.fromImage('images/ui/button-large/button-large-content-nectar.png')
    
    if (preparedCellSprite.done) {
      container.addChild(Button(70, -34, contentHoney, () => replaceSelectedHex('honey'), null, null, 'large'))
      container.addChild(Button(100, -23, contentBrood, () => replaceSelectedHex('brood'), null, null, 'large'))
      container.addChild(Button(70, -12, contentPollen, () => replaceSelectedHex('pollen'), null, null, 'large'))
      container.addChild(Button(100, -1, contentNectar, () => replaceSelectedHex('converter'), null, null, 'large'))
    } else {
      const content = Sprite.fromImage('images/ui/content-prepared.png')
      content.position.x = 72
      content.position.y = -29
      container.addChild(content)

      const text = '  1.Have wax\n\n  2.Have\n  worker bees'
      const helperText = new PIXI.Text(text, { ...picoFontConfig, fill: '#96a5bc' })
      helperText.scale.set(0.15, 0.15)
      helperText.position.x = 80
      helperText.position.y = -6
      container.addChild(helperText)

      container.addChild(ProgressBar(113, -15, 'build', () => preparedCellSprite.completeness, 100))

      addTicker('ui', time => {
        if (needsHelp()) {
          helperText.visible = true
          content.texture = Texture.fromImage('images/ui/content-prepared-help.png')
        } else {
          helperText.visible = false
          content.texture = Texture.fromImage('images/ui/content-prepared.png')
        }
      })
    }
    return container
  }

  addTicker('ui', time => {
    if (preparedCellSprite.done) {
      spriteExclamation.visible = false
      return;
    }
    spriteExclamation.visible = needsHelp()
  })
  addTicker('game-stuff', time => {
    if (preparedCellSprite.completeness >= 100) {
      preparedCellSprite.texture = Texture.fromImage('cell-prepared-complete.png')
      if (selected === preparedCellSprite && !preparedCellSprite.done) setSelected(null)
      preparedCellSprite.done = true
      return
    }

    const partialNumber = Math.ceil(preparedCellSprite.completeness / 100 * 7) + 1
    preparedCellSprite.texture = Texture.fromImage(`cell-prepared-partial${partialNumber}.png`)       
  })
  
  parent.addChild(preparedCellSprite)
  return preparedCellSprite
}

function cellHoney(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const honeySprite = Sprite.fromImage('cell-honey-full.png')
  makeSelectable(honeySprite, 'honey')
  makeOccupiable(honeySprite)
  honeySprite.position.x = pixelCoordinate.x
  honeySprite.position.y = pixelCoordinate.y

  honeySprite.type = 'honey'
  honeySprite.HONEY_HEX_CAPACITY = 30
  honeySprite.honey = 0
  honeySprite.setHoney = amount => { honeySprite.honey = cap(0, honeySprite.HONEY_HEX_CAPACITY)(amount); return honeySprite }
  honeySprite.isHoneyFull = () => honeySprite.honey >= honeySprite.HONEY_HEX_CAPACITY
  honeySprite.isHoneyEmpty = () => honeySprite.honey <= 0
  
  addTicker('game-stuff', time => {
    if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.75) {
      honeySprite.texture = Texture.fromImage('cell-honey-full.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.50) {
      honeySprite.texture = Texture.fromImage('cell-honey-filling.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.25) {
      honeySprite.texture = Texture.fromImage('cell-honey-partial.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.05) {
      honeySprite.texture = Texture.fromImage('cell-honey-minimal.png')
    } else {
      honeySprite.texture = Texture.fromImage('cell-honey-empty.png')
    }
  })

  honeySprite.panelLabel = () => false
  honeySprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  honeySprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-honey-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'honey', () => honeySprite.honey, honeySprite.HONEY_HEX_CAPACITY))

    const textHeading = new PIXI.Text('HONEY HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('HONEY', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 90
    textDescription.position.y = -16
    container.addChild(textDescription)

    const notEnoughWarning = new PIXI.Text('NOT ENOUGH HONEY', { ...picoFontConfig, fill: 'white' })
    notEnoughWarning.scale.set(0.15, 0.15)
    notEnoughWarning.position.x = 76
    notEnoughWarning.position.y = 10
    notEnoughWarning.visible = false
    container.addChild(notEnoughWarning)

    const button = Button(84, -6, 'Make Wax', () => {
      if (honeySprite.honey >= (honeySprite.HONEY_HEX_CAPACITY * 0.9)) {
        replaceHex([x, y], 'wax')
        setSelected(null) 
      } else {
        notEnoughWarning.visible = true
      }
    })
    container.addChild(button)

    return container
  }

  parent.addChild(honeySprite)
  return honeySprite
}

function cellWax(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const waxSprite = Sprite.fromImage('images/hex/wax/cell-wax-full.png')
  makeSelectable(waxSprite, 'wax')
  makeOccupiable(waxSprite)
  waxSprite.position.x = pixelCoordinate.x
  waxSprite.position.y = pixelCoordinate.y

  waxSprite.type = 'wax'
  waxSprite.WAX_HEX_CAPACITY = 130
  waxSprite.wax = 130
  waxSprite.setWax = amount => { waxSprite.wax = cap(0, waxSprite.WAX_HEX_CAPACITY)(amount); return waxSprite }
  waxSprite.isWaxFull = () => waxSprite.wax >= waxSprite.WAX_HEX_CAPACITY
  waxSprite.isWaxEmpty = () => waxSprite.wax <= 0
  
  addTicker('game-stuff', time => {
    
    if (waxSprite.wax <= 0) {
      waxSprite.wax = 1 // this is dirty
      replaceHex([x, y], 'prepared').instantlyPrepare()
    }

    if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.96) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-full.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.72) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-a.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.66 ) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-b.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.5) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-c.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.25) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-d.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.12) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-e.png')
    } else {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-f.png')
    }
  })

  waxSprite.panelLabel = () => false
  waxSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  waxSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-honey-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'wax', () => waxSprite.wax, waxSprite.WAX_HEX_CAPACITY))

    const textHeading = new PIXI.Text('WAX HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('WAX', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 90
    textDescription.position.y = -16
    container.addChild(textDescription)

    return container
  }

  parent.addChild(waxSprite)
  return waxSprite
}


function cellConverter(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const converterSprite = Sprite.fromImage('images/hex/nectar/cell-nectar-empty.png')
  
  makeSelectable(converterSprite, 'converter')
  makeOccupiable(converterSprite)
  makeHexDetectable(converterSprite)
  converterSprite.position.x = pixelCoordinate.x
  converterSprite.position.y = pixelCoordinate.y
  converterSprite.NECTAR_CAPACITY = 15
  converterSprite.nectar = 0
  converterSprite.setNectar = amount => { converterSprite.nectar = cap(0, converterSprite.NECTAR_CAPACITY)(amount); return converterSprite }
  converterSprite.isNectarFull = () => converterSprite.nectar >= converterSprite.NECTAR_CAPACITY
  converterSprite.isNectarEmpty = () => converterSprite.nectar <= 0
 
  converterSprite.panelLabel = () => false
  converterSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  converterSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-nectar-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'nectar', () => converterSprite.nectar, converterSprite.NECTAR_CAPACITY))

    const textHeading = new PIXI.Text('NECTAR HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('NECTAR', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 86
    textDescription.position.y = -16
    container.addChild(textDescription)

    return container
  }

  addTicker('game-stuff', time => {
    if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.9) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-full.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.72) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-a.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.66 ) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-b.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.5) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-c.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.25) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-d.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.05) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-e.png')
    } else {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-empty.png')
    }
  })

  converterSprite.type = 'converter'
  
  parent.addChild(converterSprite)
  return converterSprite
}


function cellBrood(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const broodSprite = Sprite.fromImage('cell-brood-empty.png')

  const broodExclamation = Sprite.fromImage('exclamation-warning-severe.png')
  broodExclamation.position.x = 14
  broodExclamation.position.y = -6
  broodExclamation.visible = false
  broodSprite.addChild(broodExclamation)

  makeSelectable(broodSprite, 'brood')
  makeOccupiable(broodSprite)
  broodSprite.position.x = pixelCoordinate.x
  broodSprite.position.y = pixelCoordinate.y

  broodSprite.type = 'brood'
  broodSprite.paused = false
  
  // Stored in seconds for easy transitions
  broodSprite.lifecycle = 0
  const eggDuration = 30
  const larvaeDuration = 300
  const puppaDuration = 500    
  
  broodSprite.content = 'empty'
  broodSprite.NUTRITION_CAPACITY = 100
  broodSprite.nutrition = null
  broodSprite.CORPSE_DELAY = 60
  broodSprite.corpseCleaned = broodSprite.CORPSE_DELAY
  broodSprite.isOccupiedWithOffspring = () => broodSprite.content !== 'empty'
  broodSprite.setContents = item => {
    // empty -> egg -> (larvae -> puppa) || dead
    broodSprite.content = item
    if (item === 'egg') {
      broodSprite.lifecycle = 0
      broodSprite.nutrition = 50
    }
  }
  broodSprite.kill = () => {
    broodSprite.setContents('dead')
  }
  broodSprite.isWellFed = () => broodSprite.nutrition >= broodSprite.NUTRITION_CAPACITY - 10
  broodSprite.isDead = () => broodSprite.content === 'dead'
  broodSprite.togglePause = () => broodSprite.paused = !broodSprite.paused

  const setTexture = () => {
    const item = broodSprite.content
    if (item === 'empty') {
      broodSprite.texture = Texture.fromImage('cell-brood-empty.png')      
    } else if (item === 'egg') {
      broodSprite.texture = Texture.fromImage('cell-brood-egg.png')
    } else if (item === 'larvae') {      
      broodSprite.texture = Texture.fromImage('cell-brood-larvae.png')      
    } else if (item === 'puppa') {
      broodSprite.texture = Texture.fromImage('cell-brood-puppa.png')      
    } else if (item === 'dead') {
      broodSprite.texture = Texture.fromImage('cell-brood-dead.png')   
    }
  }

  addTicker('game-stuff', time => {
    setTexture()
    broodExclamation.visible = broodSprite.content === 'larvae' && broodSprite.nutrition < 20
    if (!broodSprite.content) return
    if (broodSprite.content === 'empty') return
    if (broodSprite.content === 'dead') {
      if (broodSprite.corpseCleaned <= 0) {
        broodSprite.corpseCleaned = broodSprite.CORPSE_DELAY
        broodSprite.setContents('empty')
      }
      return
    }
    
    broodSprite.lifecycle += transferTo(225).inSeconds(225)

    // Transitions
    if (broodSprite.lifecycle > eggDuration && broodSprite.content === 'egg') {
      broodSprite.setContents('larvae')      
    } else if (broodSprite.lifecycle > eggDuration + larvaeDuration && broodSprite.content === 'larvae') {
      broodSprite.setContents('puppa')
    } else if (broodSprite.lifecycle > eggDuration + larvaeDuration + puppaDuration && broodSprite.content === 'puppa' && season === 'summer') {
      broodSprite.setContents('empty')
      createBee(beeContainer, 'idle', { x: broodSprite.position.x, y: broodSprite.position.y - 5 })
    }

    // States
    if (broodSprite.content === 'larvae') {
      broodSprite.nutrition -= transferTo(broodSprite.NUTRITION_CAPACITY).inSeconds(90)
      if (broodSprite.nutrition <= 0) {
        broodSprite.setContents('dead')
      }
    }
  })

  broodSprite.panelLabel = () => false
  broodSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  broodSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-brood.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    const textHeading = new PIXI.Text('BROOD HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textState = new PIXI.Text('-', { ...picoFontConfig, fill: '#96a5bc' })
    textState.scale.set(0.15, 0.15)
    textState.position.x = 80
    textState.position.y = -16
    container.addChild(textState)

    const eggLifecycleBar = ProgressBar(113, -6, 'lifecycle', () => broodSprite.lifecycle, eggDuration)
    container.addChild(eggLifecycleBar)

    const larvaeLifecycleBar = ProgressBar(113, -6, 'lifecycle', () => broodSprite.lifecycle - eggDuration, larvaeDuration)
    container.addChild(larvaeLifecycleBar)

    const puppaLifecycleBar = ProgressBar(113, -6, 'lifecycle', () => broodSprite.lifecycle - eggDuration - larvaeDuration, puppaDuration)
    container.addChild(puppaLifecycleBar)

    const nutrientsBar = ProgressBar(113, 3, 'nutrition', () => broodSprite.nutrition, broodSprite.NUTRITION_CAPACITY)
    container.addChild(nutrientsBar)

    const textProgress = new PIXI.Text('Progress', { ...picoFontConfig, fill: '#96a5bc' })
    textProgress.scale.set(0.15, 0.15)
    textProgress.position.x = 80
    textProgress.position.y = -8
    container.addChild(textProgress)

    const textNutrients = new PIXI.Text('Nutrient', { ...picoFontConfig, fill: '#96a5bc' })
    textNutrients.scale.set(0.15, 0.15)
    textNutrients.position.x = 80
    textNutrients.position.y = 1
    textNutrients.visible = false
    container.addChild(textNutrients)

    const paused = new PIXI.Text('-', { ...picoFontConfig })
    paused.scale.set(0.15, 0.15)
    paused.position.x = 82
    paused.position.y = 15 
    container.addChild(paused)

    const helper = new PIXI.Text('Loading...', { ...picoFontConfig })
    helper.scale.set(0.15, 0.15)
    helper.position.x = 82
    helper.position.y = 35
    container.addChild(helper)

    const helperText = () => {
      if (broodSprite.content === 'dead') {
        return 'Larvae needs\npollen from\nnurser bees\nto survive'
      }
      if (broodSprite.content === 'puppa' && season === 'winter') {
        return 'Puppa will\nhatch first\nday of summer'
      }
      return ''
    }

    addTicker('ui', () => {
      textState.text = broodSprite.content
      const isDead = broodSprite.content === 'dead'
      const isEmpty = broodSprite.content === 'empty'
      const isEgg = broodSprite.content === 'egg'
      const isLarvae = broodSprite.content === 'larvae'
      const isPuppa = broodSprite.content === 'puppa'
      if (isEmpty || isDead) {
        content.texture = Texture.fromImage('images/ui/content-brood.png')
      } else if (isLarvae) {
        content.texture = Texture.fromImage('images/ui/content-larvae.png')
      } else if (isEgg || isPuppa) {
        content.texture = Texture.fromImage('images/ui/content-egg-puppa.png')
      }
      textProgress.visible = !isEmpty && !isDead
      
      eggLifecycleBar.visible = isEgg
      larvaeLifecycleBar.visible = isLarvae
      puppaLifecycleBar.visible = isPuppa
      
      textNutrients.visible = isLarvae
      nutrientsBar.visible = isLarvae

      paused.text = broodSprite.paused ? 'paused' : 'active'

      helper.text = helperText()
    })


    const button = Button(83, 60, 'Disable', () => broodSprite.togglePause())
    container.addChild(button)
    
    return container
  }

  parent.addChild(broodSprite)
  return broodSprite
}


function cellPollen(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const pollenSprite = Sprite.fromImage('cell-pollen-empty.png')
  makeSelectable(pollenSprite, 'pollen')
  makeOccupiable(pollenSprite)
  pollenSprite.position.x = pixelCoordinate.x
  pollenSprite.position.y = pixelCoordinate.y

  pollenSprite.type = 'pollen'
  pollenSprite.POLLEN_HEX_CAPACITY = 120
  pollenSprite.pollen = 0
  pollenSprite.setPollen = (pollen) => pollenSprite.pollen = pollen
  pollenSprite.isPollenFull = () => pollenSprite.pollen >= pollenSprite.POLLEN_HEX_CAPACITY
  pollenSprite.isPollenEmpty = () => pollenSprite.pollen <= 0
  
  addTicker('game-stuff', time => {
    if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.75) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-full.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.50) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-filling.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.25) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-partial.png')
    } else {
      pollenSprite.texture = Texture.fromImage('cell-pollen-empty.png')
    }
  })

  pollenSprite.panelLabel = () => false
  pollenSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  pollenSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-pollen-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'pollen', () => pollenSprite.pollen, pollenSprite.POLLEN_HEX_CAPACITY))

    const textHeading = new PIXI.Text('POLLEN HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('POLLEN', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 86
    textDescription.position.y = -16
    container.addChild(textDescription)

    return container
  }
  
  parent.addChild(pollenSprite)
  return pollenSprite
}

function ProgressBar(x, y, type, tickerData, max) {
  const progressSprite = Sprite.fromImage('images/ui/progress-bar/progress-' + type + '.png')
  progressSprite.position.x = x
  progressSprite.position.y = y
  addTicker('ui', time => {
    const _max = max === undefined ? 100 : max
    progressSprite.width = (tickerData() / max) * 21  
  })
  return progressSprite
}

function Button(x, y, content, callback, hoverover, hoverout, _size) {
  const size = _size === undefined ? 'standard' : _size
  const buttonSprite = Sprite.fromImage(`images/ui/button-${size}/button-${size}-standard.png`)
  let swallow = false
  buttonSprite.position.x = x
  buttonSprite.position.y = y
  buttonSprite.interactive = true
  buttonSprite.buttonMode = true
  buttonSprite.mouseover = () => {
    hoverover && hoverover()
    buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-hover.png`)
  }
  buttonSprite.mouseout = () => {
    hoverout && hoverout()
    buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-standard.png`)
  }
  buttonSprite.mouseup = () => {
    if (swallow) return
    swallow = true
    buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-click.png`)
    setTimeout(() => {
      callback()
      swallow = false
      buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-hover.png`)
    }, 50)
  }

  if (typeof content === 'string') {
    const buttonText = new PIXI.Text(content, { ...picoFontConfig, ...smallFont })
    buttonText.position.x = 7
    buttonText.position.y = 3
    buttonSprite.addChild(buttonText)    
  } else if (content !== undefined && content !== null) {
    buttonSprite.addChild(content)    
  }

  return buttonSprite
}

window.addEventListener('keydown', e => {
  if (scene !== 'game') return;

  //Space
  if (e.keyCode === 32) {
    paused = !paused
  }

  //T, for gameTick
  if (e.keyCode === 84) {
    gameloop(16.66, true)
  }

  // 1
  if (e.keyCode === 49) {
    gameSpeed = 1
    paused = false
  }

  // 2
  if (e.keyCode === 50) {
    gameSpeed = 4
    paused = false
  }

  // 2
  if (e.keyCode === 51) {
    gameSpeed = 8
    paused = false
  }

  // 3
  if (e.keyCode === 52) {
    gameSpeed = 64
    paused = false
  }

  /*
  // enter
  if (e.keyCode === 13) {
    for (let i = 0; i < 100; i++) {
      createBee(beeContainer, 'idle').setHunger(0.01).setPollen(60)
    }
  }

  // a
  if (e.keyCode === 65) {
    createBee(beeContainer, 'idle').setHunger(0.01).setPollen(60)
  }
  */
})

