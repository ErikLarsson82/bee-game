import { Application, settings, SCALE_MODES } from 'pixi.js'
import { WIDTH, HEIGHT } from './config'

const app = new Application(WIDTH, HEIGHT, { antialias: false })
document.getElementById('container').appendChild(app.view)

// Don't know if this has any effect
// document.getElementsByTagName('canvas')[0].getContext('2d', { willReadFrequently: true })

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x000000

settings.SCALE_MODE = SCALE_MODES.NEAREST // Pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

export default app
