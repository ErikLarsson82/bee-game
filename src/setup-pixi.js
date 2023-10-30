
const WIDTH = 400 * 2
const HEIGHT = 320 * 2
const app = new PIXI.Application(WIDTH, HEIGHT, { antialias: false })
document.getElementById('container').appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x000000
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

// Works on PC =  "PICO-8 mono Regular"'
// Works on MAC = 'beefont'
const fontConfig = {
    fontFamily: 'beefont',
    fill: 'white'
}

const smallFont = { fontSize: 4 }
const largeFont = { fontSize: 8 }
const massiveFont = { fontSize: 16 }
const hugeFont = { fontSize: 50 }

const loadingContainer = new Container()
loadingContainer.scale.x = 2
loadingContainer.scale.y = 2
app.stage.addChild(loadingContainer)

const loadingLabel = new PIXI.Text('Loading', { fontFamily: 'verdana', fill: 'white', fontSize: 10 })
loadingLabel.position.x = 170
loadingLabel.position.y = 140
loadingContainer.addChild(loadingLabel)