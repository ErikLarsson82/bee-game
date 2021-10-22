
// Anchor everything at 0.5 to fix placements 

// Things should be globally pauseable

// Bees should occupy flowers and cells

// Implement seasons

// Flower lifecycle

// Speed 0, 1x, 2x and 4x

// Either use decimals or not, but dont mix

// Have worker bees convert hexes

// Worker bees feed the larvae


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

const app = new PIXI.Application(800, 400, { antialias: false })
document.body.appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x755737
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Default pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

let paused = false
let day = 0
let hour = 0
let selected = null
let queen = null

let panel = null
let background = null
let flower = null
let pausedText = null
let selectedSprite = null

let hexGrid = []
const bees = []

function setup() {
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2

  app.stage.addChild(container)

  background = new Container()
  container.addChild(background)

  const beeContainer = new Container()
  container.addChild(beeContainer)

  const ui = new Container()
  container.addChild(ui)

  {
    const uiTopBar = new Graphics()
    uiTopBar.beginFill(0x000000)
    uiTopBar.drawRect(0, 0, 400, 20)
    
    const populationText = new PIXI.Text('Loading', { ...fontConfig, fill: 'white' })
    populationText.position.x = 5
    populationText.position.y = 2
    uiTopBar.addChild(populationText)
    app.ticker.add(time => {
      populationText.text = 'Colony population ' + (bees.length + 1)
    })
    
    const dayCycle = new PIXI.Text('Loading', { ...fontConfig, fill: 'white' })
    dayCycle.position.x = 200
    dayCycle.position.y = 2
    uiTopBar.addChild(dayCycle)
    app.ticker.add(time => {
      dayCycle.text = 'Day ' + day + ' Hour ' + Math.round(hour)
    })

    pausedText = new PIXI.Text('Playing', { ...fontConfig, fill: 'white' })
    pausedText.position.x = 300
    pausedText.position.y = 2
    uiTopBar.addChild(pausedText)
    
    ui.addChild(uiTopBar)
  }

  const grass = new Graphics()
  grass.beginFill(0x6abe30)
  grass.drawRect(0, 0, 60, 400)
  background.addChild(grass)

  const beehive = new Graphics()
  beehive.beginFill(0xffc83f)
  beehive.drawRect(120 / 2, 120 / 2, 120, 120)
  background.addChild(beehive)

  hexGrid = new Array(5).fill().map((_, x) => 
    new Array(5).fill().map((_, y) => cellEmpty(x, y, background))
  )
  
  selectedSprite = new Container()
  selectedSprite.visible = false
  const selectedSpriteSub = Sprite.fromImage('cell-selected.png')
  selectedSpriteSub.position.x = -2
  selectedSpriteSub.position.y = -2
  selectedSprite.addChild(selectedSpriteSub)  
  app.ticker.add(time => {
    if (selected) {
      selectedSprite.visible = true
      selectedSprite.position.x = selected.position.x
      selectedSprite.position.y = selected.position.y
    } else {
      selectedSprite.visible = false
    }
  })
  background.addChild(selectedSprite)

  flower = Sprite.fromImage('flower.png')
  makeSelectable(flower, 'flower')
  flower.position.x = 30
  flower.position.y = 30
  background.addChild(flower)

  panel = Sprite.fromImage('ui-panel.png')
  panel.position.x = 200
  panel.position.y = 30  
  panel.visible = true
  const panelContent = new Container()
  panel.content = panelContent
  panel.addChild(panelContent)

  const panelText = new PIXI.Text('-', { ...fontConfig })
  panelText.position.x = 6
  panelText.position.y = 2
  panel.addChild(panelText)

  panel.render = target => {
    panel.visible = !!target
    panelText.text = target && target.label
  }

  ui.addChild(panel)

  for (var i = 0; i < 1; i++) {
    createBee(beeContainer)
  }
  createQueen(beeContainer)

  app.ticker.add((delta) => gameLoop(delta))
}

function gameLoop(delta) {
  if (paused) return

  hour += 0.01

  if (hour > 24) {
    hour = 0
    day++
  }
}

function setSelected(item) {
  // start with cleanup of panel
  panel.content.children.forEach(child => panel.content.removeChild(child))
    
  selected = item || null

  panel.render(selected)

  if (item && item.panelContent) {
    panel.content.addChild(item.panelContent())
  }
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
    if (paused) return
    const emptyBroodCells = filterHexagon(hexGrid, hex => hex.type === 'brood' && !hex.isOccupied())
    if (emptyBroodCells.length > 0) {
      queenSprite.position.x = emptyBroodCells[0].position.x
      queenSprite.position.y = emptyBroodCells[0].position.y
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

  bee.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => {
      text.text = 'Pollen sack' + Math.round(bee.pollenSack)
    })
    return text
  }

  app.ticker.add(time => {
    if (paused) return
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
        bee.position.x = pollenHex[0].position.x
        bee.position.y = pollenHex[0].position.y
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

function replaceSelectedHex(type) {
  hexGrid.forEach((row, xIdx) => row.forEach((hex, yIdx) => {
    if (hex === selected) {
      background.removeChild(hex)
      const f = {
        brood: cellBrood,
        pollen: cellPollen
      }
      if (!f[type]) {
        console.error('No type!')
      }
      const newHex = f[type](xIdx, yIdx, background)
      hexGrid[xIdx][yIdx] = newHex
      setSelected(newHex)
    }
  }))
}

function cellEmpty(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const emptySprite = Sprite.fromImage('cell-empty.png')
  makeSelectable(emptySprite, 'cell')
  emptySprite.position.x = pixelCoordinate.x
  emptySprite.position.y = pixelCoordinate.y

  emptySprite.panelContent = () => {
    const c = new Container()
    c.addChild(Button(5, 80, 'brood', () => replaceSelectedHex('brood')))
    c.addChild(Button(5, 100, 'pollen', () => replaceSelectedHex('pollen')))
    return c
  }
  
  parent.addChild(emptySprite)
  return emptySprite
}


function cellBrood(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const broodSprite = Sprite.fromImage('cell-brood-empty.png')
  makeSelectable(broodSprite, 'brood')
  broodSprite.type = 'brood'
  broodSprite.position.x = pixelCoordinate.x
  broodSprite.position.y = pixelCoordinate.y

  broodSprite.lifecycle = 0
  broodSprite.content = null
  broodSprite.nutrition = null
  broodSprite.isOccupied = () => !!broodSprite.content
  broodSprite.setContents = item => {
    broodSprite.content = item
    if (item === 'egg') {
      broodSprite.texture = Texture.fromImage('cell-brood-egg.png')
    } else if (item === 'larvae') {
      broodSprite.nutrition = 5
      broodSprite.texture = Texture.fromImage('cell-brood-larvae.png')      
    } else if (item === 'dead') {
      broodSprite.texture = Texture.fromImage('cell-brood-dead.png')   
    }
  }

  app.ticker.add(time => {
    if (paused) return
    if (broodSprite.content === 'egg') {
      broodSprite.lifecycle += 1
      if (broodSprite.lifecycle > 1000) {
        broodSprite.setContents('larvae')
      }
    }
    if (broodSprite.content === 'larvae') {
      broodSprite.nutrition -= 0.01
      if (broodSprite.nutrition <= 0) {
        broodSprite.setContents('dead')
      }
    }
  })

  broodSprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => text.text = 'Occupied ' + (broodSprite.content || 'empty'))
    return text
  }
  
  parent.addChild(broodSprite)
  return broodSprite
}


function cellPollen(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const pollenSprite = Sprite.fromImage('cell-pollen-empty.png')
  makeSelectable(pollenSprite, 'pollen')
  pollenSprite.type = 'pollen'
  pollenSprite.position.x = pixelCoordinate.x
  pollenSprite.position.y = pixelCoordinate.y

  pollenSprite.pollen = 0
  pollenSprite.isFull = () => pollenSprite.pollen >= 120
  pollenSprite.addPollen = (amount) => {
    pollenSprite.pollen += amount
    if (pollenSprite.isFull()) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-full.png')
    } else {
      pollenSprite.texture = Texture.fromImage('cell-pollen-empty.png')
    }
  }

  pollenSprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => text.text = 'Pollen' + Math.round(pollenSprite.pollen))
    return text
  }
  
  parent.addChild(pollenSprite)
  return pollenSprite
}


function Button(x, y, text, callback) {
  const buttonSprite = Sprite.fromImage('button.png')
  buttonSprite.position.x = x
  buttonSprite.position.y = y
  buttonSprite.interactive = true
  buttonSprite.buttonMode = true
  buttonSprite.alpha = 1
  buttonSprite.mouseover = () => buttonSprite.alpha = 0.5
  buttonSprite.mouseout = () => buttonSprite.alpha = 1
  buttonSprite.mousedown = () => {
    buttonSprite.alpha = 0.8
    callback()    
  }

  const buttonText = new PIXI.Text(text, { ...fontConfig })
  buttonText.position.x = 7
  buttonText.position.y = 3
  buttonSprite.addChild(buttonText)

  return buttonSprite
}

window.addEventListener('keydown', e => {
  if (e.keyCode === 32) {
    paused = !paused

    if (paused) {
      pausedText.text = 'Paused'
    } else {
      pausedText.text = 'Playing'   
    }
  }
})

setup()