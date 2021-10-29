
// Slider to determine the amount of pollenation and bringing resources back to base

// Too much focus on pollenation -> no resources (but many flowers)

// Focus on gathering resources -> no or reduced amount of flowers (but short term resource gains)

// Bees should harvest both nectar and pollen

// Progress bars

// Implement seasons

// Flower lifecycle

// Speed 0, 1x, 2x and 4x

// Either use decimals or not, but dont mix

// Have worker bees convert hexes

// Things should be globally pauseable

// Anchor everything at 0.5 to fix placements 

// Dont flap wings when dead

// Dont occupy the pollen hexes when they are empty

// Eventlog

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
      const aliveBees = bees.filter(b => !b.isDead())
      const foragers = aliveBees.filter(b => b.type === 'forager').length
      const nurses = aliveBees.filter(b => b.type === 'nurser').length
      const workers = aliveBees.filter(b => b.type === 'worker').length
      populationText.text = `Colony population ${ aliveBees.length + 1 }    ${ foragers } / ${ nurses } / ${ workers }` 
    })
    
    const dayCycle = new PIXI.Text('Loading', { ...fontConfig, fill: 'white' })
    dayCycle.position.x = 230
    dayCycle.position.y = 2
    uiTopBar.addChild(dayCycle)
    app.ticker.add(time => {
      dayCycle.text = 'Day ' + day + ' Hour ' + Math.round(hour)
    })

    pausedText = new PIXI.Text('Playing', { ...fontConfig, fill: 'white' })
    pausedText.position.x = 330
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

  createBee(beeContainer, 'nurser')
  createBee(beeContainer, 'forager')
  createBee(beeContainer, 'worker')
  createBee(beeContainer, 'worker')
  createQueen(beeContainer)

  createMap()

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

function createMap() {
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
  sprite.timeOfFlight = 0
  sprite.flyTo = (targetSprite) => {
    if (!targetSprite) {
      targetSprite = {
        position: {
          x: sprite.idle.x,
          y: sprite.idle.y
        }
      }
    }
    const SPEED = 0.01
    sprite.timeOfFlight += 20

    if (sprite.vx === 0 && sprite.vy === 0) {
      sprite.timeOfFlight = 0
      // sprite.vx = (Math.random() - 0.5) * 3
      // sprite.vy = (Math.random() - 0.5) * 3
    }
    sprite.vx += targetSprite.position.x < sprite.position.x ? -SPEED : SPEED  
    sprite.vy += targetSprite.position.y < sprite.position.y ? -SPEED : SPEED
    
    if (sprite.timeOfFlight > 144) {
      sprite.vx = sprite.vx * 0.97
      sprite.vy = sprite.vy * 0.97
    }    
    sprite.position.x += sprite.vx
    sprite.position.y += sprite.vy
    snapTo(sprite, targetSprite)
  }  
}

function makeHexDetectable(bee) {
  bee.isAt = type => {
    const result = filterHexagon(hexGrid, hex => hex.type === type && samePosition(bee, hex))
    if (result.length > 0) return result[0]
    return null
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
    a.vx = 0
    a.vy = 0
  }
}

function replaceSelectedHex(type) {
  hexGrid.forEach((row, xIdx) => row.forEach((hex, yIdx) => {
    if (hex === selected) {
      background.removeChild(hex)
      const f = {
        converter: cellConverter,
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
  const bee = Sprite.fromImage('bee-drone-body.png')
  const beeAddon = Sprite.fromImage('bee-drone-legs.png')
  bee.addChild(beeAddon)
  makeSelectable(bee, 'bee')
  const isAt = samePosition(bee)
  bee.idle = {
    x: 35,
    y: 60 + (bees.length * 15)
  }
  goIdle(bee)
  makeFlyable(bee)
  makeHexDetectable(bee)
  bee.vx = 0
  bee.vy = 0
  bee.wingAnimationTicker = Math.random() * 100
  bee.NECTAR_SACK_CAPACITY = 20
  bee.POLLEN_SACK_CAPACITY = 20
  bee.HONEY_SACK_CAPACITY = 10
  bee.HUNGER_CAPACITY = secondsToTicks(120)
  bee.pollenSack = 0
  bee.waxSack = 0
  bee.nectarSack = type === 'forager' ? 20 : 0
  bee.honeySack = 0
  bee.hunger = Math.min(secondsToTicks(60 + (bees.length * 5)), bee.HUNGER_CAPACITY)
  bee.type = type || 'unassigned'
  bee.isDead = () => bee.hunger <= 0

  const isPollenSackFull = () => bee.pollenSack >= bee.POLLEN_SACK_CAPACITY
  const isPollenSackEmpty = () => !(bee.pollenSack > 0)

  const isNectarSackFull = () => bee.nectarSack >= bee.NECTAR_SACK_CAPACITY
  const isNectarSackEmpty = () => !(bee.nectarSack > 0)

  const isHoneySackFull = () => bee.honeySack >= bee.HONEY_SACK_CAPACITY
  const isHoneySackEmpty = () => !(bee.honeySack > 0)

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

  function depositNectar() {
    if (isNectarSackEmpty()) return false

    const converterNeedsNectar = filterHexagon(hexGrid, hex => hex.type === 'converter' && !hex.isNectarFull() && hex.isUnclaimed(bee))
    
    if (converterNeedsNectar.length === 0) return false

    converterNeedsNectar[0].claimSlot(bee)
    
    if (isAt(converterNeedsNectar[0])) {

      bee.nectarSack -= 0.1
      converterNeedsNectar[0].nectar += 0.1
      return true
    }

    bee.flyTo(converterNeedsNectar[0])

    return true
  }

  function pollinateFlower() {
    if (isAt(flower) && !isPollenSackFull()) {
      flower.claimSlot(bee)
      bee.pollenSack += 0.1
      bee.nectarSack += 0.1
      if (isPollenSackFull() && isNectarSackFull()) {
        bee.position.x = flower.position.x + 5
      }
      return true
    }
    if (!isPollenSackFull() && flower.isUnclaimed(bee)) {
      flower.claimSlot(bee)
      bee.flyTo(flower)
      return true
    }
    return false
  }

  function depositPollen() {
    const hex = bee.isAt('pollen')
    if (!hex) return false
    hex.claimSlot(bee)
    bee.pollenSack -= 0.1
    hex.pollen += 0.1
    if (isPollenSackEmpty() || hex.isPollenFull()) {
      bee.position.x = hex.position.x + 5
    }
    return true
  }


  function flyToPollen() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenFull())
    if (pollenHex.length === 0 || !isPollenSackFull()) return false
    pollenHex[0].claimSlot(bee)
    bee.flyTo(pollenHex[0])      
    return true
  }

  function feedBee() {    
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
      return true
    } else {
      bee.hunger -= 1
    }

    if (honeyHex.length > 0 && bee.hunger < secondsToTicks(30)) {
      honeyHex[0].claimSlot(bee)
      bee.flyTo(honeyHex[0])
      return true
    }
    return false
  }

  function forager() {
    if (feedBee()) return
    if (depositNectar()) return
    if (depositPollen()) return    
    if (pollinateFlower()) return
    if (flyToPollen()) return    
    bee.flyTo(null)
  }

  function nurser() {
    if (feedBee()) return
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
      isAtAnyLarvae[0].nutrition += 10
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

  function convertNectar() {
    const hex = bee.isAt('converter')
    if (!hex || isHoneySackFull()) return false
    hex.claimSlot(bee)
    hex.nectar -= 0.1
    bee.honeySack += 0.1
    if (isHoneySackFull() || hex.isNectarEmpty()) {
      bee.position.x = hex.position.x + 5
    }
    return true
  }

  function flyToConverter() {
    const converterHex = filterHexagon(hexGrid, hex => hex.type === 'converter' && hex.isUnclaimed(bee) && !hex.isNectarEmpty())
    if (converterHex.length === 0 || isHoneySackFull()) return false
    converterHex[0].claimSlot(bee)
    bee.flyTo(converterHex[0])      
    return true
  }

  function depositHoney() {
    const hex = bee.isAt('honey')
    if (!hex) return false
    hex.claimSlot(bee)
    hex.honey += 0.1
    bee.honeySack -= 0.1
    if (isHoneySackEmpty() || hex.isHoneyFull()) {
      bee.position.x = hex.position.x + 5
    }
    return true
  }

  function flyToHoney() {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.isUnclaimed(bee) && !hex.isHoneyFull())
    if (honeyHex.length === 0 || !isHoneySackFull()) return false
    honeyHex[0].claimSlot(bee)
    bee.flyTo(honeyHex[0])      
    return true
  }

  function worker() {
    if (depositHoney()) return
    if (flyToHoney()) return
    if (convertNectar()) return
    if (flyToConverter()) return
    bee.flyTo(null)
  }

  app.ticker.add(time => {
    if (paused) return

    bee.visible = true

    if (bee.isDead()) {
      bee.texture = Texture.fromImage('bee-drone-dead.png')
      beeAddon.visible = false
      if (bee.position.y !== 25) {
        bee.position.x = 65 + (Math.random() * 100)
        bee.position.y = 25
      }
      return
    }

    if (bee.vx !== 0 || bee.vy !== 0) {
      (bee.vx >= -0.15 || bee.vx === 0) ? bee.scale.set(1, 1) : bee.scale.set(-1, 1) //
      bee.wingAnimationTicker += 0.4
      if (Math.sin(bee.wingAnimationTicker) > 0) {
        beeAddon.texture = Texture.fromImage('bee-drone-wings.png')
      } else {
        beeAddon.texture = Texture.fromImage('bee-drone-wings-flapped.png')
      }
    } else {
      bee.scale.set(1, 1)
      beeAddon.texture = Texture.fromImage('bee-drone-legs.png')
    }

    if (bee.type === 'unassigned') {
      const rand = Math.random()
      if (rand < 0.3) {
        bee.type = 'forager'
      } else if (rand < 0.6) {
        bee.type = 'nurser'
      } else {
        bee.type = 'worker'
      }      
    }

    if (bee.type === 'forager') forager()
    if (bee.type === 'nurser') nurser()
    if (bee.type === 'worker') worker()
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
    c.addChild(Button(5, 40, 'honey', () => replaceSelectedHex('honey')))
    c.addChild(Button(5, 60, 'brood', () => replaceSelectedHex('brood')))
    c.addChild(Button(5, 80, 'pollen', () => replaceSelectedHex('pollen')))
    c.addChild(Button(5, 100, 'converter', () => replaceSelectedHex('converter')))
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
  honeySprite.HONEY_HEX_CAPACITY = 30
  honeySprite.honey = 15
  honeySprite.isHoneyFull = () => honeySprite.honey >= honeySprite.HONEY_HEX_CAPACITY
  honeySprite.isHoneyEmpty = () => honeySprite.honey <= 0
  
  app.ticker.add(time => {
    if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.75) {
      honeySprite.texture = Texture.fromImage('cell-honey-full.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.50) {
      honeySprite.texture = Texture.fromImage('cell-honey-filling.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.25) {
      honeySprite.texture = Texture.fromImage('cell-honey-partial.png')
    } else {
      honeySprite.texture = Texture.fromImage('cell-honey-empty.png')
    }
  })

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


function cellConverter(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const converterSprite = Sprite.fromImage('cell-converter.png')
  makeSelectable(converterSprite, 'converter')
  makeOccupiable(converterSprite)
  converterSprite.position.x = pixelCoordinate.x
  converterSprite.position.y = pixelCoordinate.y
  converterSprite.NECTAR_CAPACITY = 15
  converterSprite.nectar = 0
  converterSprite.isNectarFull = () => converterSprite.nectar >= converterSprite.NECTAR_CAPACITY
  converterSprite.isNectarEmpty = () => converterSprite.nectar <= 0
 
  converterSprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => {
      text.text = `Nectar   ${ Math.round(converterSprite.nectar) }\nHoney   ${ Math.round(converterSprite.honey) }`
    })
    return text
  }

  app.ticker.add(time => {
    if (bees.filter(samePosition(converterSprite)).length > 0) {
      converterSprite.texture = Texture.fromImage('cell-converter-occupied.png')   
    } else {
      converterSprite.texture = Texture.fromImage('cell-converter.png')   
    }
  })

  converterSprite.type = 'converter'
  
  parent.addChild(converterSprite)
  return converterSprite
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
      broodSprite.nutrition = secondsToTicks(10)
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
    if (broodSprite.lifecycle > secondsToTicks(5) && broodSprite.content === 'egg') {
      broodSprite.setContents('larvae')      
    } else if (broodSprite.lifecycle > secondsToTicks(30) && broodSprite.content === 'larvae') {
      broodSprite.setContents('puppa')
    } else if (broodSprite.lifecycle > secondsToTicks(60) && broodSprite.content === 'puppa') {
      broodSprite.setContents('empty')
      createBee(beeContainer)
    }

    // States
    if (broodSprite.content === 'larvae') {
      broodSprite.nutrition -= 1
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
      const line2 = broodSprite.content === 'larvae' ? '\nNutrients: ' + ticksToSeconds(broodSprite.nutrition) : ''
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
  pollenSprite.POLLEN_HEX_CAPACITY = 120
  pollenSprite.pollen = 0
  pollenSprite.isPollenFull = () => pollenSprite.pollen >= pollenSprite.POLLEN_HEX_CAPACITY
  pollenSprite.isPollenEmpty = () => pollenSprite.pollen <= 0
  app.ticker.add(time => {
    if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.75) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-full.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.50) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-filling.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.25) {
      pollenSprite.texture = Texture.fromImage('cell-pollen-partial.png')
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