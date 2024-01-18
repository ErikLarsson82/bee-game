import { Container, Text } from 'pixi.js'

class LevelSelectScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager

    const text = new Text('LevelSelectScene', { fill: 0xffffff })
    text.position.set(50, 50)
    this.addChild(text)
  }
}

export default LevelSelectScene
