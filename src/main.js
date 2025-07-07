import 'pixi.js'

import SceneManager from './scenes/scene-manager'
import LoadingScene from './scenes/loading-scene'
import SplashScene from './scenes/splash-scene'
import SplashDeuxScene from './scenes/splash-scene-deux'
import LevelSelectScene from './scenes/level-select-scene'
import GameScene from './scenes/game-scene'
import DebugMenuScene from './scenes/debug-menu-scene'

import {} from './key-binds'

export const l = console.log
export const pretty = number => Math.round(number / 1000)

export const sceneManager = new SceneManager()

sceneManager.addScene('loading', new LoadingScene(sceneManager))
sceneManager.addScene('splash', new SplashScene(sceneManager))
sceneManager.addScene('splash-deux', new SplashDeuxScene(sceneManager))
sceneManager.addScene('level-select', new LevelSelectScene(sceneManager))
sceneManager.addScene('game', new GameScene(sceneManager))
sceneManager.addScene('debug-menu', new DebugMenuScene(sceneManager))

sceneManager.goToScene('loading')
