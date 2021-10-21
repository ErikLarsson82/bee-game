// Everything in one file starts to be difficult to find what im looking for

// Bees and hexes have state and different properties that does not scale well

// Mixing referencing sprites or data-model is confusing

// Everything should be clickable

// Sprites should have game-data on them

// Convert code to https://github.com/kittykatattack/learningPixi#gamestates

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

const app = new PIXI.Application(800, 400, { antialias: false, sharedTicker: true })
document.body.appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x755737
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Default pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

let paused = false
let selected = null
let queen = null
let panel = null
let hexGrid = []
const bees = []

function setup() {
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2

  app.stage.addChild(container)

  const background = new Container()
  container.addChild(background)

  const beeContainer = new Container()
  container.addChild(beeContainer)

  const ui = new Container()
  container.addChild(ui)

  const beehive = new Graphics()
  beehive.beginFill(0xffc83f)
  beehive.drawRect(120 / 2, 120 / 2, 120, 120)
  background.addChild(beehive)

  hexGrid = new Array(5).fill().map((_, x) => 
    new Array(5).fill().map((_, y) => cellCore(background, x, y))
  )
  
  const selected = Sprite.fromImage('cell-selected.png')
  selected.position.x = 100
  selected.position.y = 100
  selected.visible = false
  background.addChild(selected)

  const flower = Sprite.fromImage('flower.png')
  makeSelectable(flower, 'flower')
  flower.position.x = 30
  flower.position.y = 30
  background.addChild(flower)

  panel = Sprite.fromImage('ui-panel.png')
  panel.position.x = 200
  panel.position.y = 20  
  panel.visible = true

  const panelText = new PIXI.Text('-', { ...fontConfig })
  panelText.position.x = 6
  panelText.position.y = 2
  panel.addChild(panelText)

  panel.render = target => {
    panel.visible = !!target
    panelText.text = target && target.label
  }

  ui.addChild(panel)

  for (var i = 0; i < 2; i++) {
    createBee(beeContainer)
  }
  createQueen(beeContainer)
}

function gameLoop(delta) {
  if (paused) return

  //Runs the current game `state` in a loop and renders the sprites
}

function setSelected(item) {
  selected = item || null

  panel.render(selected)
}

function makeSelectable(sprite, label) {
  sprite.label = label || 'no name'
  sprite.interactive = true
  sprite.buttonMode = true
  sprite.alpha = 1
  sprite.mouseover = () => sprite.alpha = 0.7
  sprite.mouseout = () => sprite.alpha = 1
  sprite.mousedown = () => setSelected(sprite)
}

function createQueen(parent) {
  const queenSprite = PIXI.Sprite.fromImage('bee-queen.png')
  makeSelectable(queenSprite, 'queen')
  queenSprite.position.x = 100
  queenSprite.position.y = 45
  queenSprite.delay = 600

  app.ticker.add(time => {
    const emptyBroodCells = filterHexagon(hexGrid, hex => hex.type === 'brood' && !hex.isOccupied())
    if (emptyBroodCells.length > 0) {
      queenSprite.position.x = emptyBroodCells[0].sprite.position.x
      queenSprite.position.y = emptyBroodCells[0].sprite.position.y
      queenSprite.delay--

      if (queenSprite.delay <= 0) {
        emptyBroodCells[0].setContents('egg')
        queenSprite.delay = 600
        queenSprite.position.x = 100
        queenSprite.position.y = 45
      }
    } else {
      queenSprite.delay = 600 
    }
  })

  queen = queenSprite
  parent.addChild(queenSprite)
}

function createBee(parent) {
  const bee = PIXI.Sprite.fromImage('bee-drone.png')
  makeSelectable(bee, 'bee')
  bee.position.x = 50
  bee.position.y = 50
  bee.pollenSack = 0
  bee.state = 'idle'
  app.ticker.add(time => {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && !hex.isFull())
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

  bees.push(bee)
  parent.addChild(bee)
}

function cellCore(parent, x, y) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })

  return {
    x,
    y,
    pixelX: pixelCoordinate.x,
    pixelY: pixelCoordinate.y,
    content: emptyCell(parent, pixelCoordinate)
  }
}

function replaceSelectedHex(type) {

}
/*

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
      //selectedHexSprite().setType('pollen')
      replaceSelectedHex('pollen')
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
      //selectedHexSprite().setType('brood')
      replaceSelectedHex('brood')
      setSelected(null)
    }

    const buttonBroodText = new PIXI.Text('Brood', { ...fontConfig })
    buttonBroodText.position.x = 7
    buttonBroodText.position.y = 3
    buttonBrood.addChild(buttonBroodText)

    panel.addChild(buttonBrood)
  }



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

function emptyCell(parent, pixelCoordinate) {
  const hexSprite = Sprite.fromImage('cell-empty.png')
  makeSelectable(hexSprite, 'cell')
  hexSprite.position.x = pixelCoordinate.x
  hexSprite.position.y = pixelCoordinate.y
  
  parent.addChild(hexSprite)
  return hexSprite
}

window.addEventListener('keydown', e => {
  if (e.keyCode === 32) {
    gameState.paused = !gameState.paused
    gameState.paused ? app.ticker.stop() : app.ticker.start()
  }
})

setup()