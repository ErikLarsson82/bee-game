
const version = '0.6.1'

let DEBUG = false

const colors = {
  yellow: '#fee761',
  orange: '#feae34',
  darkOrange: '#f77622',
  darkGray: '#3a4466',
  darkPink: '#b55088',
}

const colorToHex = (color) => parseInt(color.substring(1), 16)

const l = console.log
const pretty = number => Math.round(number/1000)

let FPS = 144
const ticksToSeconds = number => Math.round(number/FPS)
const secondsToTicks = number => number * FPS

const speeds = {
  1: 0.4,
  4: 0.6,
  8: 1,
  64: 2
}

let cycles = null

let gameover = null
let keepPlaying = null
let gameSpeed = null
let paused = null
let hour = null
let day = null
let year = null
let seeds = null
let season = null 
let winterHungerMultiplier = null
let currentSeasonLength = 0
let previousSeasonLength = null
let currentCycle = 0
let currentCycleIndex = 0
let currentMapInit = null
let angelBubbleTimer = 0
let backgroundImage = null
let backgroundColor = null
let levelIndex = null
let blizzardWinter = null

let scene = null
let selected = null
let queen = null

let container = null
let panel = null
let background = null
let ui = null
let uiTopBar = null
let populationText = null
let seasonText = null
let selectedSprite = null
let hoverCellSprite = null
let hiveHole = null
let beeContainer = null
let backgroundScene = null
let hexBackground = null
let uiHangarComponents = null
let hatchContainer = null
let hexForeground = null
let dimmer = null
let flowerBed = null
let pausedText = null
let pauseFrame = null
let sun = null
let angelBubble = null
let angelBubbleText = null

let tickers = null
let hexGrid = []
let flowers = []
let bees = null
let angels = []
let hoveredCells = []

loader.add('ironchest-bee.ttf')
loader.load(step2)

function step2() {
  loader.on('progress', function(e) {
    loadingLabel.text = `Loading ${e.progress.toFixed(0)} %`
  })
  
  // shorthands
  loader.add('bee-working-animation-worker', 'images/sprite-sheets/bee/worker/working.png')
  loader.add('bee-eating-animation-worker', 'images/sprite-sheets/bee/worker/eating.png')
  loader.add('bee-unloading-animation-worker', 'images/sprite-sheets/bee/worker/unloading.png')
  loader.add('bee-dying-age-animation-worker', 'images/sprite-sheets/bee/worker/dying-age.png')
  loader.add('bee-dying-hunger-animation-worker', 'images/sprite-sheets/bee/worker/dying-hunger.png')

  loader.add('bee-working-animation-nurser', 'images/sprite-sheets/bee/nurser/working.png')
  loader.add('bee-eating-animation-nurser', 'images/sprite-sheets/bee/nurser/eating.png')
  loader.add('bee-unloading-animation-nurser', 'images/sprite-sheets/bee/nurser/unloading.png')
  loader.add('bee-dying-age-animation-nurser', 'images/sprite-sheets/bee/nurser/dying-age.png')
  loader.add('bee-dying-hunger-animation-nurser', 'images/sprite-sheets/bee/nurser/dying-hunger.png')

  loader.add('bee-working-animation-forager', 'images/sprite-sheets/bee/forager/working.png')
  loader.add('bee-eating-animation-forager', 'images/sprite-sheets/bee/forager/eating.png')
  loader.add('bee-unloading-animation-forager', 'images/sprite-sheets/bee/forager/unloading.png')
  loader.add('bee-dying-age-animation-forager', 'images/sprite-sheets/bee/forager/dying-age.png')
  loader.add('bee-dying-hunger-animation-forager', 'images/sprite-sheets/bee/forager/dying-hunger.png')

  loader.add('bee-working-animation-idle', 'images/sprite-sheets/bee/idle/working.png')
  loader.add('bee-eating-animation-idle', 'images/sprite-sheets/bee/idle/eating.png')
  loader.add('bee-unloading-animation-idle', 'images/sprite-sheets/bee/idle/unloading.png')
  loader.add('bee-dying-age-animation-idle', 'images/sprite-sheets/bee/idle/dying-age.png')
  loader.add('bee-dying-hunger-animation-idle', 'images/sprite-sheets/bee/idle/dying-hunger.png')

  loader.add('bee-converting-nectar-animation-worker', 'images/sprite-sheets/bee/worker/converting-nectar.png')

  loader.add('hex-hatching', 'images/sprite-sheets/hex/hatching.png')

  loader.add('flower-is-pollinated', 'images/sprite-sheets/flower-is-pollinated/animation-spritesheet-flower.png')
  
  // preload menu only
  loader.add('images/ui/button-huge/button-huge-standard.png')
  loader.add('images/ui/button-huge/button-huge-hover.png')
  loader.add('images/ui/button-huge/button-huge-click.png')

  loader.load(() => {
    app.stage.removeChild(loadingContainer)
    setupDebugMenu()
    // loader.load(setupSplash)
  })
}