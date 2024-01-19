import SceneManager from './scenes/scene-manager'
import LoadingScene from './scenes/loading-scene'
import SplashScene from './scenes/splash-scene'
import LevelSelectScene from './scenes/level-select-scene'
import GameScene from './scenes/game-scene'
import DebugMenuScene from './scenes/debug-menu-scene'

/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */

export const l = console.log
export const pretty = number => Math.round(number / 1000)

let queen = null

let container = null
let uiTopBar = null
let seasonText = null
let selectedSprite = null
let hoverCellSprite = null
let hiveHole = null
let pausedText = null
let pauseFrame = null
let sun = null
let angelBubble = null
let angelBubbleText = null

let flowers = []
let angels = []

export const sceneManager = new SceneManager()

sceneManager.addScene('loading', new LoadingScene(sceneManager))
sceneManager.addScene('splash', new SplashScene(sceneManager))
sceneManager.addScene('level-select', new LevelSelectScene(sceneManager))
sceneManager.addScene('game', new GameScene(sceneManager))
sceneManager.addScene('debug-menu', new DebugMenuScene(sceneManager))

sceneManager.goToScene('loading')
