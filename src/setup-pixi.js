import { Application, settings, SCALE_MODES } from 'pixi.js'
import { WIDTH, HEIGHT } from './config'

const app = new Application(WIDTH, HEIGHT, { antialias: false })
document.getElementById('container').appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x000000

settings.SCALE_MODE = SCALE_MODES.NEAREST // Pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

export default app
