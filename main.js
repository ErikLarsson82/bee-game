// Everything in one file starts to be difficult to find what im looking for

// Bees and hexes have state and different properties that does not scale well

// Mixing referencing sprites or data-model is confusing

const fontConfig = {
    fontFamily: '"Lucida Console", Monaco, monospace',
    fontSize: 8,
    fontWeight: 'bolder',
    fill: 'black'
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

const background = new Container()
container.addChild(background)

const bees = new Container()
container.addChild(bees)

const ui = new Container()
container.addChild(ui)


app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

const gameState = {
  selectedHex: null,
  paused: false,
}

const setSelected = cell => {
  if (cell === null) {
    gameState.selectedHex = null
    selected.visible = false
    panel.visible = false
  } else {
    gameState.selectedHex = cell
    selected.position.x = cell.content.sprite.position.x - 2
    selected.position.y = cell.content.sprite.position.y - 2
    selected.visible = true
    panel.visible = true
  }
  app.render()
}

const beehive = new Graphics()
beehive.beginFill(0xffc83f)
beehive.drawRect(120 / 2, 120 / 2, 120, 120)
background.addChild(beehive)

const hexGrid = new Array(5).fill().map((_, x) => 
  new Array(5).fill().map((_, y) => cellCore(x, y))
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
background.addChild(selected)

const flower = Sprite.fromImage('flower.png')
flower.position.x = 30
flower.position.y = 30
background.addChild(flower)

function createQueen() {
  const queen = PIXI.Sprite.fromImage('bee-queen.png')
  queen.position.x = 100
  queen.position.y = 45
  queen.delay = 600
  bees.addChild(queen)

  app.ticker.add(time => {
    const emptyBroodCells = filterHexagon(hex => hex.type === 'brood' && !hex.isOccupied())
    if (emptyBroodCells.length > 0) {
      queen.position.x = emptyBroodCells[0].sprite.position.x
      queen.position.y = emptyBroodCells[0].sprite.position.y
      queen.delay--

      if (queen.delay <= 0) {
        emptyBroodCells[0].setContents('egg')
        queen.delay = 600
        queen.position.x = 100
        queen.position.y = 45
      }
    } else {
      queen.delay = 600 
    }
  })
}

function createBee() {
  const bee = PIXI.Sprite.fromImage('bee-drone.png')
  bee.position.x = 50
  bee.position.y = 50
  bee.pollenSack = 0
  bee.state = 'idle'
  app.ticker.add(time => {
    const pollenHex = filterHexagon(hex => hex.type === 'pollen' && !hex.isFull())
    if (bee.state === 'idle') {
      bee.position.x = 50
      bee.position.y = 50
      if (pollenHex.length > 0) {
        bee.state = 'collecting'    
      }
    }
    if (bee.state === 'collecting') {
      bee.position.x = flower.position.x
      bee.position.y = flower.position.y      
      bee.pollenSack += 0.1
      if (bee.pollenSack >= 20) {
        bee.state = 'depositing'      
      }
    }
    if (bee.state === 'depositing') {
      if (pollenHex.length > 0) {
        bee.position.x = pollenHex[0].sprite.position.x
        bee.position.y = pollenHex[0].sprite.position.y
      } else {
        bee.state = 'idle'
        return
      }
      bee.pollenSack -= 0.1
      pollenHex[0].addPollen(0.1)
      if (pollenHex[0].isFull() || bee.pollenSack <= 0) {
        bee.state = 'idle'
      } 
    }
  })
  bees.addChild(bee)
}

const panel = Sprite.fromImage('ui-panel.png')
{
  panel.position.x = 200
  panel.position.y = 20
  panel.visible = false

  const panelText = new PIXI.Text('Empty cell', { ...fontConfig })
  panelText.position.x = 6
  panelText.position.y = 2
  panel.addChild(panelText)

  {
    const buttonPollen = Sprite.fromImage('button.png')
    buttonPollen.position.x = 5
    buttonPollen.position.y = 50
    buttonPollen.interactive = true
    buttonPollen.buttonMode = true
    buttonPollen.alpha = 0.5
    buttonPollen.mouseover = () => buttonPollen.alpha = 1
    buttonPollen.mouseout = () => buttonPollen.alpha = 0.5
    buttonPollen.mousedown = () => {
      selectedHexSprite().setType('pollen')
      setSelected(null)
    }

    const buttonPollenText = new PIXI.Text('Pollen', { ...fontConfig })
    buttonPollenText.position.x = 7
    buttonPollenText.position.y = 3
    buttonPollen.addChild(buttonPollenText)

    panel.addChild(buttonPollen)

    const buttonBrood = Sprite.fromImage('button.png')
    buttonBrood.position.x = 5
    buttonBrood.position.y = 80
    buttonBrood.interactive = true
    buttonBrood.buttonMode = true
    buttonBrood.alpha = 0.5
    buttonBrood.mouseover = () => buttonBrood.alpha = 1
    buttonBrood.mouseout = () => buttonBrood.alpha = 0.5
    buttonBrood.mousedown = () => {
      selectedHexSprite().setType('brood')
      setSelected(null)
    }

    const buttonBroodText = new PIXI.Text('Brood', { ...fontConfig })
    buttonBroodText.position.x = 7
    buttonBroodText.position.y = 3
    buttonBrood.addChild(buttonBroodText)

    panel.addChild(buttonBrood)
  }

  ui.addChild(panel)
}

function cellCore(x, y) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })

  return {
    x,
    y,
    pixelX: pixelCoordinate.x,
    pixelY: pixelCoordinate.y,
    content: emptyCell(pixelCoordinate)
  }
}

/*

  const setType = (_type) => {
    type = _type
    hex.texture = Texture.fromImage(`cell-${_type}-empty.png`)
  }

  const isFull = () => pollen >= 50

  const isOccupied = () => contents !== null

  const setContents = (what) => {
    contents = what
    if (what === 'egg') {
      hex.texture = Texture.fromImage('cell-brood-egg.png')
    }
  }

  const addPollen = (amount) => {
    pollen += amount
    if (isFull()) {
      hex.texture = Texture.fromImage('cell-pollen-full.png')
    }
  }

  const getType = () => type
*/

function emptyCell(pixelCoordinate) {
  const hexSprite = Sprite.fromImage('cell-empty.png')
  hexSprite.position.x = pixelCoordinate.x
  hexSprite.position.y = pixelCoordinate.y
  hexSprite.interactive = true
  hexSprite.buttonMode = true
  hexSprite.alpha = 1
  hexSprite.mouseover = () => hexSprite.alpha = 0.2
  hexSprite.mouseout = () => hexSprite.alpha = 1

  const cell = {
    type: 'empty',
    sprite: hexSprite,
    destroy: () => background.removeChild(hexSprite)
  }
  hexSprite.mousedown = () => setSelected(cell)
  background.addChild(hexSprite)
  return cell
}

window.addEventListener('keydown', e => {
  if (e.keyCode === 32) {
    gameState.paused = !gameState.paused
    gameState.paused ? app.ticker.stop() : app.ticker.start()
  }
})

for (var i = 0; i < 2; i++) {
  createBee()
}
createQueen()
