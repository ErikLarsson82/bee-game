let MAP_SELECTION = 'default'
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

const colors = {
  yellow: '#fee761',
  orange: '#feae34',
  darkOrange: '#f77622',
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

const WIDTH = 400 * 2
const HEIGHT = 320 * 2
const app = new PIXI.Application(WIDTH, HEIGHT, { antialias: false })
document.getElementById('container').appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x000000
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

let cycles = null

let gameSpeed = 1
let paused = false
let hour = 0
let day = 1
let year = 1
let seeds = 1
let season = 'summer'
let winterHungerMultiplier = null

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

loader.add('pico8-mono.ttf')
loader.add('bee-working-animation-worker', 'images/animation-test/bee/animation-spritesheet-bee-worker.png')
loader.add('bee-unloading-animation-worker', 'images/animation-test/bee/animation-spritesheet-bee-unloading-worker.png')
loader.add('bee-working-animation-nurser', 'images/animation-test/bee/animation-spritesheet-bee-nurser.png')
loader.add('bee-unloading-animation-nurser', 'images/animation-test/bee/animation-spritesheet-bee-unloading-nurser.png')
loader.add('bee-working-animation-forager', 'images/animation-test/bee/animation-spritesheet-bee-forager.png')
loader.add('bee-unloading-animation-forager', 'images/animation-test/bee/animation-spritesheet-bee-unloading-forager.png')
loader.add('bee-working-animation-idle', 'images/animation-test/bee/animation-spritesheet-bee-idle.png')
loader.add('bee-unloading-animation-idle', 'images/animation-test/bee/animation-spritesheet-bee-unloading-idle.png')
loader.add('flower-is-pollinated', 'images/animation-test/flower-is-pollinated/animation-spritesheet-flower.png')
// loader.load(setupSplash)


map = MAP_CONFIGURATIONS[0]
cycles = map.cycles
MAP_SELECTION = map.id
seeds = map.seeds
winterHungerMultiplier = map.winterHungerMultiplier

loader.load(setupGame)
