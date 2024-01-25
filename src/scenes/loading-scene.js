import { loader, Container, Text } from 'pixi.js'

class LoadingScene extends Container {
  constructor (sceneManager) {
    super()

    this.sceneManager = sceneManager

    const text = new Text('Loading...', { fill: 0xffffff })
    text.position.set(50, 50)
    this.addChild(text)
  }

  init () {
    const sceneManager = this.sceneManager
    loader.add('ironchest-bee.ttf')
    loader.add('sheet', 'spritesheet.json')
    loader.load(() => sceneManager.goToScene('splash'))
    // loader.load(step2)

    // function step2 () {
    //   loader.on('progress', function (e) {
    //     // console.log(`Loading ${e.progress.toFixed(0)} %`)
    //   })

      // shorthands
      // loader.add('bee-working-animation-worker', 'images/sprite-sheets/bee/worker/working.png')
      // loader.add('bee-eating-animation-worker', 'images/sprite-sheets/bee/worker/eating.png')
      // loader.add('bee-unloading-animation-worker', 'images/sprite-sheets/bee/worker/unloading.png')
      // loader.add('bee-dying-age-animation-worker', 'images/sprite-sheets/bee/worker/dying-age.png')
      // loader.add('bee-dying-hunger-animation-worker', 'images/sprite-sheets/bee/worker/dying-hunger.png')

      // loader.add('bee-working-animation-nurser', 'images/sprite-sheets/bee/nurser/working.png')
      // loader.add('bee-eating-animation-nurser', 'images/sprite-sheets/bee/nurser/eating.png')
      // loader.add('bee-unloading-animation-nurser', 'images/sprite-sheets/bee/nurser/unloading.png')
      // loader.add('bee-dying-age-animation-nurser', 'images/sprite-sheets/bee/nurser/dying-age.png')
      // loader.add('bee-dying-hunger-animation-nurser', 'images/sprite-sheets/bee/nurser/dying-hunger.png')

      // loader.add('bee-working-animation-forager', 'images/sprite-sheets/bee/forager/working.png')
      // loader.add('bee-eating-animation-forager', 'images/sprite-sheets/bee/forager/eating.png')
      // loader.add('bee-unloading-animation-forager', 'images/sprite-sheets/bee/forager/unloading.png')
      // loader.add('bee-dying-age-animation-forager', 'images/sprite-sheets/bee/forager/dying-age.png')
      // loader.add('bee-dying-hunger-animation-forager', 'images/sprite-sheets/bee/forager/dying-hunger.png')

      // loader.add('bee-working-animation-idle', 'images/sprite-sheets/bee/idle/working.png')
      // loader.add('bee-eating-animation-idle', 'images/sprite-sheets/bee/idle/eating.png')
      // loader.add('bee-unloading-animation-idle', 'images/sprite-sheets/bee/idle/unloading.png')
      // loader.add('bee-dying-age-animation-idle', 'images/sprite-sheets/bee/idle/dying-age.png')
      // loader.add('bee-dying-hunger-animation-idle', 'images/sprite-sheets/bee/idle/dying-hunger.png')

      // loader.add('bee-converting-nectar-animation-worker', 'images/sprite-sheets/bee/worker/converting-nectar.png')

      // loader.add('hex-hatching', 'images/sprite-sheets/hex/hatching.png')

      // loader.add('flower-is-pollinated', 'images/sprite-sheets/flower-is-pollinated/animation-spritesheet-flower.png')

      // // preload menu only
      // loader.add('images/ui/button-huge/button-huge-standard.png')
      // loader.add('images/ui/button-huge/button-huge-hover.png')
      // loader.add('images/ui/button-huge/button-huge-click.png')
      // loader.add('images/splash/logo.png')

      // loader.load(() => sceneManager.goToScene('splash'))
    // }
  }
}

export default LoadingScene
