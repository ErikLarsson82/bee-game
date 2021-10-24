
// Bees should occupy flowers and cells

// Bees should harvest both nectar and pollen

// Progress bars

// Implement seasons

// Flower lifecycle

// Speed 0, 1x, 2x and 4x

// Either use decimals or not, but dont mix

// Have worker bees convert hexes

// Things should be globally pauseable

// Anchor everything at 0.5 to fix placements 

const fontConfig = {
    fontFamily: '"Lucida Console", Monaco, monospace',
    fontSize: 8,
    fontWeight: 'bolder',
    fill: 'black'
}

const l = console.log
const pretty = number => Math.round(number/1000)

const FPS = 144
const ticksToSeconds = number => Math.round(number/FPS)
const secondsToTicks = number => number * FPS

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
let beeContainer = null

let hexGrid = []
const bees = []

function setup() {
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2

  app.stage.addChild(container)

  background = new Container()
  container.addChild(background)

  beeContainer = new Container()
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
      populationText.text = 'Colony population ' + (bees.filter(b => !b.isDead()).length + 1)
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
  makeOccupiable(flower)
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

  createBee(beeContainer, 'forager')
  // createBee(beeContainer, 'forager')
  createBee(beeContainer, 'nurser')
  createQueen(beeContainer)

  // select first (for debugging)
  setSelected(hexGrid[0][0])
  // create it as honey
  replaceSelectedHex('honey')
  // setSelected(hexGrid[0][1])
  // replaceSelectedHex('pollen')
  // setSelected(hexGrid[0][2])
  // replaceSelectedHex('pollen')
  // hexGrid[0][2].pollen = 20
  // deselect
  setSelected(null)

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

function makeOccupiable(parent) {
  const spotClaimed = PIXI.Sprite.fromImage('spot-claimed.png')
  spotClaimed.visible = false
  parent.addChild(spotClaimed)

  parent.slot = null
  parent.slotCounter = 0
  parent.isUnclaimed = attemptee => {
    if (!attemptee) {
      console.error('Needs input')
      return
    }
    return parent.slot === null || parent.slot === attemptee
  }
  parent.claimSlot = item => {
    parent.slot = item
    parent.slotCounter = secondsToTicks(1)
  }
  app.ticker.add(time => {
    if (parent.slot) {
      parent.slotCounter--
      if (parent.slotCounter <= 0) {
        parent.slot = null
      }
    }
    spotClaimed.visible = !!parent.slot // enable for debug
  })
}

function makeFlyable(sprite) {
  sprite.flyTo = (targetSprite) => {
    if (!targetSprite) {
      targetSprite = {
        position: {
          x: sprite.idle.x,
          y: sprite.idle.y
        }
      }
    }
    const SPEED = 0.1
    sprite.vx = targetSprite.position.x < sprite.position.x ? -SPEED : SPEED
    sprite.vy = targetSprite.position.y < sprite.position.y ? -SPEED : SPEED
    sprite.position.x += sprite.vx
    sprite.position.y += sprite.vy
    snapTo(sprite, targetSprite)
  }  
}

function goIdle(bee) {
  bee.position.x = bee.idle.x
  bee.position.y = bee.idle.y
}

function samePosition(a, b) {
  if (b) {
    return a.position.x === b.position.x && a.position.y === b.position.y
  } else {
    return function prepared(c) {
      return a.position.x === c.position.x && a.position.y === c.position.y
    }
  } 
}

function snapTo(a, b) {
  const x2 = Math.abs(a.position.x - b.position.x) * 2
  const y2 = Math.abs(a.position.y - b.position.y) * 2
  const distance = Math.sqrt(x2 + y2)
  if (distance < 2) {
    a.position.x = b.position.x
    a.position.y = b.position.y
  }
}

function replaceSelectedHex(type) {
  hexGrid.forEach((row, xIdx) => row.forEach((hex, yIdx) => {
    if (hex === selected) {
      background.removeChild(hex)
      const f = {
        brood: cellBrood,
        pollen: cellPollen,
        honey: cellHoney
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

function createBee(parent, type) {
  const bee = PIXI.Sprite.fromImage('bee-drone.png')
  makeSelectable(bee, 'bee')
  const isAt = samePosition(bee)
  bee.idle = {
    x: 35,
    y: 60 + (bees.length * 15)
  }
  goIdle(bee)
  makeFlyable(bee)
  bee.vx = 0
  bee.vy = 0
  bee.NECTAR_SACK_CAPACITY = 20
  bee.POLLEN_SACK_CAPACITY = 20
  bee.HUNGER_CAPACITY = secondsToTicks(120)
  bee.pollenSack = 0
  bee.waxSack = 0
  bee.nectarSack = 0
  bee.honeySack = 0
  bee.hunger = Math.min(secondsToTicks(120 + (bees.length * 20)), bee.HUNGER_CAPACITY)
  bee.type = type || 'unassigned'
  bee.isDead = () => bee.hunger <= 0

  const isPollenSackFull = () => bee.pollenSack >= bee.POLLEN_SACK_CAPACITY
  const isPollenSackEmpty = () => !(bee.pollenSack > 0)

  bee.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => {
      let str = ''
      str += bee.isDead() ? 'Dead ;_;\n\n' : ''
      str += 'Pollen  ' + Math.round(bee.pollenSack) + '\n'
      str += 'Nectar  ' + Math.round(bee.nectarSack) + '\n'
      str += 'Wax     ' + Math.round(bee.waxSack) + '\n'
      str += 'Honey   ' + Math.round(bee.honeySack) + '\n\n'
      str += 'Hunger  ' + ticksToSeconds(bee.hunger)
      text.text = str
    })
    return text
  }

  function forager() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && !hex.isFull())
    const unClaimedPollenHex = pollenHex.filter(hex => hex.isUnclaimed(bee))
    
    if (pollenHex.length === 0) {
      bee.flyTo(null)
      return 
    }
 
    if (isAt(flower) && !isPollenSackFull()) {
      flower.claimSlot(bee)
      bee.pollenSack += 0.1
      if (isPollenSackFull()) {
        bee.position.x = flower.position.x + 5
      }
      return
    }

    if (isAt(pollenHex[0]) && !isPollenSackEmpty() && !pollenHex[0].isFull()) {
      pollenHex[0].claimSlot(bee)
      bee.pollenSack -= 0.1
      pollenHex[0].pollen += 0.1
      return
    }
 
    if (isPollenSackFull() && unClaimedPollenHex.length > 0 && unClaimedPollenHex[0].isUnclaimed(bee)) {
      unClaimedPollenHex[0].claimSlot(bee)
      bee.flyTo(unClaimedPollenHex[0])
      return
    }
    if (!isPollenSackFull() && flower.isUnclaimed(bee)) {
      flower.claimSlot(bee)
      bee.flyTo(flower)
      return
    }
    bee.flyTo(null)
  }

  function nurser() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.pollen > 0 && hex.isUnclaimed(bee))
    const isAtAnyLarvae = filterHexagon(hexGrid, hex => hex.type === 'brood' && hex.content === 'larvae' && hex.isUnclaimed(bee) && isAt(hex))
    const larvaeHex = filterHexagon(hexGrid, hex => 
      hex.type === 'brood' &&
      hex.content === 'larvae' &&
      hex.isUnclaimed(bee) && 
      !hex.isWellFed()
    ).sort((a, b) => a.nutrition > b.nutrition ? 1 : -1)

    if (pollenHex.length > 0 && isAt(pollenHex[0])) {
      pollenHex[0].claimSlot(bee)
      bee.pollenSack += 0.1
      pollenHex[0].pollen -= 0.1
      if (isPollenSackFull()) {
        bee.position.x = pollenHex[0].position.x + 5
      }
      return
    }

    if (larvaeHex.length > 0 && isAtAnyLarvae.length > 0 && !isPollenSackEmpty()) {
      isAtAnyLarvae[0].claimSlot(bee)
      bee.pollenSack -= 0.1
      isAtAnyLarvae[0].nutrition += 1
      return
    }

    if (!isPollenSackFull() && pollenHex.length > 0) {
      pollenHex[0].claimSlot(bee)
      bee.flyTo(pollenHex[0])
      return
    }
      
    if (larvaeHex.length > 0 && !isPollenSackEmpty()) {
      larvaeHex[0].claimSlot(bee)
      bee.flyTo(larvaeHex[0])
      return
    }

    bee.flyTo(null)
  }

  app.ticker.add(time => {
    if (paused) return

    if (bee.isDead()) {
      bee.texture = Texture.fromImage('bee-drone-dead.png')
      if (bee.position.y !== 25) {
        bee.position.x = 65 + (Math.random() * 100)
        bee.position.y = 25
      }
      return
    }

    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.honey > 0 && hex.isUnclaimed(bee))
    const beeIsWellFed = () => bee.hunger >= bee.HUNGER_CAPACITY

    if (honeyHex.length > 0 && isAt(honeyHex[0]) && !beeIsWellFed()) {
      honeyHex[0].claimSlot(bee)
      bee.hunger += 30
      bee.hunger = Math.min(bee.hunger, bee.HUNGER_CAPACITY)
      honeyHex[0].honey -= 0.01
      if (beeIsWellFed()) {
        bee.position.x = honeyHex[0].position.x + 5
      }
      return
    } else {
      bee.hunger -= 1
    }

    if (honeyHex.length > 0 && bee.hunger < secondsToTicks(30)) {
      honeyHex[0].claimSlot(bee)
      bee.flyTo(honeyHex[0])
      return
    }

    if (bee.type === 'unassigned') {
      bee.type = Math.random() < 0.5 ? 'forager' : 'nurser'
    }

    if (bee.type === 'forager') forager()
    if (bee.type === 'nurser') nurser()
  })

  bees.push(bee)
  parent.addChild(bee)
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

function cellHoney(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const honeySprite = Sprite.fromImage('cell-honey-full.png')
  makeSelectable(honeySprite, 'honey')
  makeOccupiable(honeySprite)
  honeySprite.position.x = pixelCoordinate.x
  honeySprite.position.y = pixelCoordinate.y

  honeySprite.type = 'honey'
  honeySprite.honey = 30
  honeySprite.isFull = () => honeySprite.honey >= 30
  
  app.ticker.add(time => {
    if (honeySprite.isFull()) {
      honeySprite.texture = Texture.fromImage('cell-honey-full.png')
    } else {
      honeySprite.texture = Texture.fromImage('cell-honey-empty.png')
    }
  })

  /*
  app.ticker.add(time => {
    // always replenish honey store
    honeySprite.honey = 30
  })
  */

  honeySprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => text.text = 'Honey stored  ' + Math.round(honeySprite.honey))
    return text
  }

  parent.addChild(honeySprite)
  return honeySprite
}


function cellBrood(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const broodSprite = Sprite.fromImage('cell-brood-empty.png')
  makeSelectable(broodSprite, 'brood')
  makeOccupiable(broodSprite)
  broodSprite.position.x = pixelCoordinate.x
  broodSprite.position.y = pixelCoordinate.y

  broodSprite.type = 'brood'
  broodSprite.lifecycle = 0
  broodSprite.content = 'empty'
  broodSprite.NUTRITION_CAPACITY = secondsToTicks(60)
  broodSprite.nutrition = null
  broodSprite.isOccupied = () => broodSprite.content !== 'empty'
  broodSprite.setContents = item => {
    // empty -> egg -> (larvae -> puppa) || dead
    broodSprite.content = item
    if (item === 'egg') {
      broodSprite.lifecycle = 0
      broodSprite.nutrition = 100
    }
  }
  broodSprite.isWellFed = () => broodSprite.nutrition >= broodSprite.NUTRITION_CAPACITY

  const setTexture = () => {
    const item = broodSprite.content
    if (item === 'empty') {
      broodSprite.texture = Texture.fromImage('cell-brood-empty.png')      
    } else if (item === 'egg') {
      broodSprite.texture = Texture.fromImage('cell-brood-egg.png')
    } else if (item === 'larvae') {      
      broodSprite.texture = Texture.fromImage('cell-brood-larvae.png')      
    } else if (item === 'puppa') {
      broodSprite.texture = Texture.fromImage('cell-brood-puppa.png')      
    } else if (item === 'dead') {
      broodSprite.texture = Texture.fromImage('cell-brood-dead.png')   
    }
  }

  app.ticker.add(time => {
    if (paused) return
    setTexture()
    if (!broodSprite.content) return
    if (['dead', 'empty'].includes(broodSprite.content)) return
    
    broodSprite.lifecycle += 1

    // Transitions
    if (broodSprite.lifecycle > secondsToTicks(1 /* 5 */) && broodSprite.content === 'egg') {
      broodSprite.setContents('larvae')      
    } else if (broodSprite.lifecycle > secondsToTicks(1000) && broodSprite.content === 'larvae') {
      broodSprite.setContents('puppa')
    } else if (broodSprite.lifecycle > secondsToTicks(2000) && broodSprite.content === 'puppa') {
      broodSprite.setContents('empty')
      createBee(beeContainer)
    }

    // States
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
    app.ticker.add(time => {
      const line2 = broodSprite.content === 'larvae' ? '\nNutrients: ' + Math.ceil(broodSprite.nutrition) : ''
      const line3 = ['egg', 'larvae', 'puppa'].includes(broodSprite.content) ? '\nLifecycle: ' + ticksToSeconds(broodSprite.lifecycle) : ''
      text.text = broodSprite.content + line2 + line3
    })
    return text
  }
  
  parent.addChild(broodSprite)
  return broodSprite
}


function cellPollen(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const pollenSprite = Sprite.fromImage('cell-pollen-empty.png')
  makeSelectable(pollenSprite, 'pollen')
  makeOccupiable(pollenSprite)
  pollenSprite.position.x = pixelCoordinate.x
  pollenSprite.position.y = pixelCoordinate.y

  pollenSprite.type = 'pollen'
  pollenSprite.pollen = 0
  pollenSprite.isFull = () => pollenSprite.pollen >= 120
  pollenSprite.isEmpty = () => pollenSprite.pollen <= 0
  app.ticker.add(time => {
    if (pollenSprite.isFull()) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-full.png')
    } else {
      pollenSprite.texture = Texture.fromImage('cell-pollen-empty.png')
    }
  })

  pollenSprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => text.text = 'Pollen   ' + Math.round(pollenSprite.pollen))
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