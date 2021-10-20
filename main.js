// Everything in one file starts to be difficult to find what im looking for

// Bees and hexes have state and different properties that does not scale well

// Mixing referencing sprites or data-model is confusing

// Cannot create more bees

// Rename nectar to pollen, bees don't store nectar in hexagons (some do?)

// Hexagon model should be converted to flat top :/

const OFFSET = 70
const SIZE = 12

const WIDTH_FLAT = 2 * SIZE
const HEIGHT_FLAT = Math.sqrt(3) * SIZE

const WIDTH_POINTY = Math.sqrt(3) * SIZE
const HEIGHT_POINTY = 2 * SIZE

// “odd-q” vertical layout, shoves odd columns down
function toLocalCoordinateFlat(index) {
  const { x, y } = index
  const odd = x % 2

  return {
    x: (x * WIDTH_FLAT * (3/4)) + OFFSET,
    y: (y * HEIGHT_FLAT) + OFFSET + (odd ? HEIGHT_FLAT/2 : 0)
  } 
}

// “odd-r” horizontal layout, shoves odd rows right
function toLocalCoordinatePointy(index) {
  const { x, y } = index
  const odd = y % 2

  return {
    x: (x * WIDTH_POINTY) + OFFSET + (odd ? WIDTH_POINTY/2 : 0),
    y: (y * HEIGHT_POINTY * (3/4)) + OFFSET
  }
}

function hexCornerFlat(center, size, i) {
  const angle_deg = 60 * i
  const angle_rad = Math.PI / 180 * angle_deg
  
  return { 
    x: center.x + size * Math.cos(angle_rad),
    y: center.y + size * Math.sin(angle_rad)
  }
}

function hexCornerPointy(center, size, i) {
  var angle_deg = 60 * i - 30
  var angle_rad = Math.PI / 180 * angle_deg
  
  return {
    x: center.x + size * Math.cos(angle_rad),
    y: center.y + size * Math.sin(angle_rad)
  }
}
    

const DIRECTIONS_POINTY_ODD = {
  'NW': { x: 0, y: -1},
  'NE': { x: 1, y: -1},
  'W': { x: -1, y: 0},
  'E': { x: 1, y: 0},
  'SW': { x: 0, y: 1},
  'SE': { x: 1, y: 1},
}
const DIRECTIONS_POINTY_EVEN = {
  'NW': { x: -1, y: -1},
  'NE': { x: 0, y: -1},
  'W': { x: -1, y: 0},
  'E': { x: 1, y: 0},
  'SW': { x: -1, y: 1},
  'SE': { x: 0, y: 1},
}

const DIRECTIONS_FLAT_ODD = {
  'N': { x: 0, y: -1},
  'NE': { x: 1, y: 0 },
  'NW': { x: -1, y: 0 },
  'S': { x: 0, y: 1},
  'SE': { x: 1, y: 1},
  'SW': { x: -1, y: 1},
}
const DIRECTIONS_FLAT_EVEN = {
  'NW': { x: -1, y: -1},
  'NE': { x: 1, y: -1},
  'N': { x: 0, y: -1},
  'SW': { x: -1, y: 0},
  'SE': { x: 1, y: 0},
  'S': { x: 0, y: 1},
}

const l = console.log

const Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    Texture = PIXI.Texture,
    PictureSprite = PIXI.extras.PictureSprite
    settings = PIXI.settings

const app = new PIXI.Application(600, 300, { antialias: false, sharedTicker: true })
document.body.appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x755737
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Default pixel-scaling

const container = new Container()
container.scale.x = 2
container.scale.y = 2

app.stage.addChild(container)

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

const gameState = {
  selectedHex: null,
  paused: false,
}

const setSelected = (index, pixel) => {
  if (index === null) {
    gameState.selectedHex = null
    selected.visible = false
    panel.visible = false
  } else {
    gameState.selectedHex = index
    selected.position.x = pixel.x - 2
    selected.position.y = pixel.y - 2
    selected.visible = true
    panel.visible = true
  }
  app.render()
}

const hexGrid = new Array(5).fill().map((_, x) => 
  new Array(5).fill().map((_, y) => hexagon(x, y))
)
const forEachHexagon = f => hexGrid.forEach(row => row.forEach(hex => f(hex)))
const filterHexagon = f => {
  const result = []
  hexGrid.forEach(row => row.forEach(hex => f(hex) && result.push(hex)))
  return result
}
const selectedHexSprite = () => hexGrid[gameState.selectedHex.x][gameState.selectedHex.y]

const selected = Sprite.fromImage('cell-selected.png')
selected.position.x = 100
selected.position.y = 100
selected.visible = false
container.addChild(selected)

const flower = Sprite.fromImage('flower.png')
flower.position.x = 30
flower.position.y = 30
container.addChild(flower)

const bee = PIXI.Sprite.fromImage('bee.png')
bee.position.x = 50
bee.position.y = 50
bee.nectarSack = 0
bee.state = 'idle'
app.ticker.add(time => {
  const nectarHex = filterHexagon(hex => hex.getType() === 'nectar' && !hex.isFull())
  if (bee.state === 'idle') {
    bee.position.x = 50
    bee.position.y = 50
    if (nectarHex.length > 0) {
      bee.state = 'collecting'    
    }
  }
  if (bee.state === 'collecting') {
    bee.position.x = flower.position.x
    bee.position.y = flower.position.y      
    bee.nectarSack += 0.1
    if (bee.nectarSack >= 20) {
      bee.state = 'depositing'      
    }
  }
  if (bee.state === 'depositing') {
    if (nectarHex.length > 0) {
      bee.position.x = nectarHex[0].sprite.position.x
      bee.position.y = nectarHex[0].sprite.position.y
    } else {
      bee.state = 'idle'
      return
    }
    bee.nectarSack -= 0.1
    nectarHex[0].addNectar(0.1)
    if (nectarHex[0].isFull() || bee.nectarSack <= 0) {
      bee.state = 'idle'
    }
  }
})
container.addChild(bee)

const bee2 = PIXI.Sprite.fromImage('bee.png')
bee2.position.x = 54
bee2.position.y = 50
bee2.nectarSack = 0
bee2.state = 'idle'
app.ticker.add(time => {
  const nectarHex = filterHexagon(hex => hex.getType() === 'nectar' && !hex.isFull())
  if (bee2.state === 'idle') {
    bee2.position.x = 54
    bee2.position.y = 50
    if (nectarHex.length > 0) {
      bee2.state = 'collecting'    
    }
  }
  if (bee2.state === 'collecting') {
    bee2.position.x = flower.position.x + 4
    bee2.position.y = flower.position.y      
    bee2.nectarSack += 0.1
    if (bee2.nectarSack >= 20) {
      bee2.state = 'depositing'      
    }
  }
  if (bee2.state === 'depositing') {
    if (nectarHex.length > 0) {
      bee2.position.x = nectarHex[0].sprite.position.x + 4 
      bee2.position.y = nectarHex[0].sprite.position.y
    } else {
      bee2.state = 'idle'
      return
    }
    bee2.nectarSack -= 0.1
    nectarHex[0].addNectar(0.1)
    if (nectarHex[0].isFull() || bee2.nectarSack <= 0) {
      bee2.state = 'idle'
    }
  }
})
container.addChild(bee2)

const panel = Sprite.fromImage('ui-panel-selected.png')
panel.position.x = 200
panel.position.y = 20
panel.visible = false
container.addChild(panel)

const button = Sprite.fromImage('button-nectar.png')
button.position.x = 5
button.position.y = 50
button.interactive = true
button.buttonMode = true
button.alpha = 0.5
button.mouseover = () => button.alpha = 1
button.mouseout = () => button.alpha = 0.5
button.mousedown = () => {
  selectedHexSprite().setNectarType()
  setSelected(null)
}
panel.addChild(button)

function hexagon(x, y) {
  
  let type = null
  let nectar = 0

  let fillColor = '#0f0';
  let strokeColor = '#00f';

  const setColor = color => {
    if (color === 'red') {
      fillColor = '#f00';
      strokeColor = '#ff0';
    } else if (color === 'blue') {
      fillColor = '#00f';
      strokeColor = '#0ff';
    } else {
      fillColor = '#0f0';
      strokeColor = '#00f';
    }
  }

  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  
  const hex = Sprite.fromImage('cell-empty.png')
  hex.position.x = pixelCoordinate.x
  hex.position.y = pixelCoordinate.y
  hex.interactive = true
  hex.buttonMode = true
  hex.alpha = 1
  hex.mouseover = () => hex.alpha = 0.2
  hex.mouseout = () => hex.alpha = 1
  hex.mousedown = () => setSelected({ x, y }, pixelCoordinate)

  container.addChild(hex)

  const odd = x % 2 // flat
  const lookup = odd ? DIRECTIONS_FLAT_ODD : DIRECTIONS_FLAT_EVEN
  
  const getNeighbour = direction => {
    const xD = lookup[direction].x
    const yD = lookup[direction].y
    const result = hexGrid[x + xD] && hexGrid[x + xD][y + yD]
    return result || null
  }

  const getNeighbours = () => Object.keys(lookup).map(getNeighbour).filter(x => x !== null)

  const setNectarType = () => {
    type = 'nectar'
    hex.texture = Texture.fromImage('cell-nectar-empty.png')
  }

  const isFull = () => nectar >= 50

  const addNectar = (amount) => {
    nectar += amount
    if (isFull()) {
      hex.texture = Texture.fromImage('cell-nectar-full.png')
    }
  }

  const getType = () => type

  const render = () => {
    context.beginPath();
    const pixelCoordinate = toLocalCoordinateFlat({ x, y })
    {
      const { x, y } = hexCornerFlat(pixelCoordinate, SIZE, 0);
      context.moveTo(x, y);

      for (var i = 1; i <= 5; i++) {
        const { x, y } = hexCornerFlat(pixelCoordinate, SIZE, i);
        context.lineTo(x, y);
      }
    }

    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor;

    context.closePath();
    context.fill();
    context.stroke();  
  }

  return {
    x,
    y,
    pixelX: pixelCoordinate.x,
    pixelY: pixelCoordinate.y,
    sprite: hex,
    getNeighbour,
    getNeighbours,
    setNectarType,
    addNectar,
    getType,
    isFull,
    render,
    setColor,
  }
}

window.addEventListener('pointermove', evt => {
  const { x, y } = evt

  let lowest = Infinity
  let closest = null

  forEachHexagon(hex => hex.setColor(null));

  hexGrid.forEach(row => {
    row.forEach(v => {
      const xP = Math.abs(x - v.pixelX)
      const yP = Math.abs(y - v.pixelY)
      const dist = Math.sqrt((xP * 2) + (yP * 2))
      if (dist < lowest && dist < (SIZE / 2.5)) {
        lowest = dist
        closest = v
      }
    })
  })

  if (closest === null) return;
  closest.setColor('red');

  closest.getNeighbours().forEach(neighbor => neighbor.setColor('blue'));

  drawGrid();
})

window.addEventListener('keydown', e => {
  if (e.keyCode === 32) {
    gameState.paused = !gameState.paused
    gameState.paused ? app.ticker.stop() : app.ticker.start()
  }
})


// Debug hex
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 300;


function drawGrid() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  forEachHexagon(hex => hex.render())
}

drawGrid()