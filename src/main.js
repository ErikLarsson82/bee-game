import SceneManager from './scenes/scene-manager'
import LoadingScene from './scenes/loading-scene'
import SplashScene from './scenes/splash-scene'
import LevelSelectScene from './scenes/level-select-scene'
import GameScene from './scenes/game-scene'
import DebugMenuScene from './scenes/debug-menu-scene'

/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */

export const colors = {
  yellow: '#fee761',
  orange: '#feae34',
  darkOrange: '#f77622',
  darkGray: '#3a4466',
  darkPink: '#b55088'
}

export const colorToHex = (color) => parseInt(color.substring(1), 16)

export const l = console.log
export const pretty = number => Math.round(number / 1000)

let cycles = null

let gameover = null
let keepPlaying = null
let gameSpeed = null
let paused = null
let hour = null
let day = null
let year = null
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
let killNonPollinatedFlowers = null

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

export const sceneManager = new SceneManager()

sceneManager.addScene('loading', new LoadingScene(sceneManager))
sceneManager.addScene('splash', new SplashScene(sceneManager))
sceneManager.addScene('level-select', new LevelSelectScene(sceneManager))
sceneManager.addScene('game', new GameScene(sceneManager))
sceneManager.addScene('debug-menu', new DebugMenuScene(sceneManager))

sceneManager.goToScene('loading')
