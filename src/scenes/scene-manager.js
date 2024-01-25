import app from '../setup-pixi'

class SceneManager {
  constructor () {
    this.scenes = {}
    this.currentScene = null
  }

  addScene (name, scene) {
    this.scenes[name] = scene
  }

  goToScene (name) {
    if (this.scenes[name]) {
      if (this.currentScene) {
        app.stage.removeChild(this.currentScene)
        this.currentScene.destroy()
      }

      this.currentScene = this.scenes[name]
      this.currentScene.init()
      app.stage.addChild(this.currentScene)
    } else {
      console.error(`Scene '${name}' not found.`)
    }
  }
}

export default SceneManager
