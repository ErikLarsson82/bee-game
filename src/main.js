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

loader.add('pico8-mono.ttf')
loader.add('bee-working-animation', 'images/animation-test/bee/animation-spritesheet-bee.png')
loader.add('bee-unloading-animation', 'images/animation-test/bee/animation-spritesheet-bee-unloading.png')
loader.add('flower-is-pollinated', 'images/animation-test/flower-is-pollinated/animation-spritesheet-flower.png')
loader.load(setupSplash)

// loader.load(setupGame)
