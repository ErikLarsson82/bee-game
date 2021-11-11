// Amelies kommentarer:
// - Kunna bestämma vilka bin som gör vad
// Jobb:
// --- nursers
// --- foragers
// --- architect (behöver vax?)
// --- honey maker (behöver byggnad?)
// --- undertaker (behöver byggnad?)

// - Hus till varje bi!
// - Workers (eller vilka som helst) måste bygga celler med vax
// - Skapa vax!
// - "Hej, jag har ingen bikupa får jag vara med er?" :)

// Speed affects "physics-engine"-buggen

// Speed 0, 1x, 2x and 4x

// Slider to determine the amount of pollenation and bringing resources back to base

// Too much focus on pollenation -> no resources (but many flowers)

// Focus on gathering resources -> no or reduced amount of flowers (but short term resource gains)

// Bees should harvest both nectar and pollen

// Progress bars

// Implement seasons

// Flower lifecycle

// Either use decimals or not, but dont mix

// Have worker bees convert hexes

// Things should be globally pauseable

// Anchor everything at 0.5 to fix placements 

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

const speeds = {
  1: 0.4,
  4: 0.6,
  8: 1,
  64: 2
}

const Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Graphics = PIXI.Graphics,
    Texture = PIXI.Texture,
    PictureSprite = PIXI.extras.PictureSprite
    settings = PIXI.settings

const WIDTH = 800
const HEIGHT = 400
const app = new PIXI.Application(WIDTH, HEIGHT, { antialias: false })
document.body.appendChild(app.view)

app.renderer.view.style.imageRendering = 'pixelated'
app.renderer.backgroundColor = 0x755737
settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST // Default pixel-scaling

app.renderer.view.style.position = 'absolute'
app.renderer.view.style.display = 'block'

let gameSpeed = 1
let paused = false
let day = 0
let hour = 0
let selected = null
let queen = null

let panel = null
let background = null
let selectedSprite = null
let beeContainer = null
let nightDimmer = null

let hexGrid = []
const bees = []
const flowers = []

function setup() {
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2

  app.stage.addChild(container)

  background = new Container()
  container.addChild(background)

  beeContainer = new Container()
  container.addChild(beeContainer)

  foreground = new Container()
  container.addChild(foreground)
  
  dimmer = new Container()
  container.addChild(dimmer)
  
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

    const pausedText = new PIXI.Text('Playing', { ...fontConfig, fill: 'white' })
    pausedText.position.x = 330
    pausedText.position.y = 2
    uiTopBar.addChild(pausedText)

    const pauseFrame = new Graphics()
    pauseFrame.lineStyle(10, 0x000000);
    pauseFrame.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
    ui.addChild(pauseFrame)

    window.setGameSpeedText = () => {
      if (paused) {
        pausedText.text = 'Paused'
      } else if (gameSpeed === 1) {
        pausedText.text = '>'
      } else if (gameSpeed === 4) {
        pausedText.text = '>>'
      } else if (gameSpeed === 8) {
        pausedText.text = '>>>'
      } else if (gameSpeed === 64) {
        pausedText.text = '>>>>>>>'
      }
      pauseFrame.visible = paused
    }
    window.setGameSpeedText()
    
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

  for (var f = 0; f < 3; f++) {
    const flower = Sprite.fromImage('flower.png')
    makeOccupiable(flower)
    makeSelectable(flower, 'flower')
    flower.position.x = 10 + (f * 10)
    flower.position.y = 30
    background.addChild(flower)
    flowers.push(flower)
  }

  panel = Sprite.fromImage('ui-panel.png')
  panel.position.x = 190
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

  nightDimmer = new Graphics()
  nightDimmer.beginFill(0x000000)
  nightDimmer.drawRect(0, 0, WIDTH / 2, HEIGHT / 2)
  nightDimmer.alpha = 0.4
  nightDimmer.visible = false
  app.ticker.add(time => {
    nightDimmer.visible = hour > 22
  })
  dimmer.addChild(nightDimmer)
  
  createMap('jobs')

  app.ticker.add((delta) => gameLoop(delta))
}

function gameLoop(delta) {
  if (paused) return

  hour += transferTo(24).inMinutes(5)

  if (hour > 24) {
    hour = 0
    day++
  }
}

function createMap(m) {
  createQueen(beeContainer)
  
  if (m === 'default') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager').setPollen(20)
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(15)
  }

  if (m === 'jobs') {
    createBee(beeContainer, 'idle')
    createBee(beeContainer, 'idle')
    createBee(beeContainer, 'idle')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(15)
  }


  if (m === 'deposit nectar sceanrio') {
    createBee(beeContainer, 'forager').setNectar(18)
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('converter')
  }

  if (m === 'deposit honey sceanrio') {
    createBee(beeContainer, 'worker').setHoney(20)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('honey')
  }


  if (m === 'converter sceanrio') {
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(0)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('converter').setNectar(15)
  }

  if (m === 'brooder scenario') {
    // Things are prepared with pollen so you can breed directly
    createBee(beeContainer, 'nurser').setPollen(20)
    createBee(beeContainer, 'forager').setPollen(20)
    createQueen(beeContainer)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey')

    setSelected(hexGrid[0][2])
    replaceSelectedHex('pollen')
    hexGrid[0][2].pollen = hexGrid[0][2].POLLEN_HEX_CAPACITY
    
    setSelected(hexGrid[0][3])
    replaceSelectedHex('pollen')
    hexGrid[0][3].pollen = hexGrid[0][3].POLLEN_HEX_CAPACITY   

    setSelected(hexGrid[2][1])
    replaceSelectedHex('brood')
    hexGrid[2][1].setContents('egg')
  }  

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
  sprite.vx = 0
  sprite.vy = 0
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
    const SPEED = 0.001 * gameSpeed
    sprite.timeOfFlight += 20

    if (sprite.vx === 0 && sprite.vy === 0) {
      sprite.timeOfFlight = 0
      // sprite.vx = (Math.random() - 0.5) * 3
      // sprite.vy = (Math.random() - 0.5) * 3
    }
    sprite.vx += targetSprite.position.x < sprite.position.x ? -SPEED : SPEED  
    sprite.vy += targetSprite.position.y < sprite.position.y ? -SPEED : SPEED
    
    if (sprite.timeOfFlight > FPS) {
      sprite.vx = sprite.vx * 0.97
      sprite.vy = sprite.vy * 0.97
    }    
    sprite.position.x += sprite.vx
    sprite.position.y += sprite.vy
    snapTo(sprite, targetSprite)
    if (sprite.type !== 'queen') console.log('flightlog stardate 1337', sprite, targetSprite)
  }  
  sprite.isMoving = () => {
    return sprite.vx !== 0 || sprite.vy !== 0
  }
}

function makeHexDetectable(bee) {
  bee.isAtType = type => {
    const hexesInGrid = filterHexagon(hexGrid, hex => hex.type === type && samePosition(bee, hex))
    if (hexesInGrid.length > 0) return hexesInGrid[0]

    const flowerResult = flowers.filter(flower => samePosition(bee, flower))
    console.log('flowerResult', flowerResult)
    if (flowerResult.length > 0) return flowerResult[0]
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
  let returnHex = null
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
      returnHex = newHex
      setSelected(newHex)
    }
  }))
  return returnHex;
}

function cap(min, max) {
  return value => Math.max(Math.min(max, value), min)
}

function toGameTick(seconds) {
  return seconds * FPS
}

function fromSeconds(gameTicks) {
  return gameTicks / 144
}

function rate(capacity, seconds) {
  return capacity / (seconds * FPS) * gameSpeed
}

function transferTo(capacity) {
  return {
    inSeconds: seconds => rate(capacity, seconds),
    inMinutes: minutes => {
      const seconds = minutes * 60
      return rate(capacity, seconds)
    }
  }
}

function makeHungry(bee) {
  const HUNGER_CAPACITY = 100
  bee.hunger = HUNGER_CAPACITY
  bee.isDead = () => bee.hunger <= 0
  bee.isWellFed = () => bee.hunger >= HUNGER_CAPACITY
  bee.isHungry = () => bee.hunger < 30
  bee.setHunger = amount => { bee.hunger = cap(0, HUNGER_CAPACITY)(amount); return bee }

  bee.eat = () => {
    bee.hunger += transferTo(HUNGER_CAPACITY).inSeconds(20)      
    bee.hunger = cap(0, HUNGER_CAPACITY)(bee.hunger)
  }

  bee.feedBee = () => {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.honey > 0 && hex.isUnclaimed(bee))
    
    const honeyTarget = bee.isAtType('honey')
    if (honeyTarget && !bee.isWellFed() && honeyTarget.honey > 0) {
      honeyTarget.claimSlot(bee)
      bee.eat()
      honeyTarget.honey -= transferTo(honeyTarget.HONEY_HEX_CAPACITY).inSeconds(40)
      if (bee.isWellFed()) {
        bee.position.y = honeyTarget.position.y - 5
      }
      return true
    } else {
      // A bee will survive approx 15 minuter at speed 1 with a full belly, which is 15 min * 60 sec = 900 sec
      // 900 sec * 144 FPS = 129600 game ticks
      // 100 hunger value points / 129600 gameticks = 0.00077160 reduction in hunger each tick
      bee.hunger -= transferTo(HUNGER_CAPACITY).inSeconds(900)
    }

    if (honeyHex.length > 0 && bee.isHungry()) {
      honeyHex[0].claimSlot(bee)
      bee.flyTo(honeyHex[0])
      return true
    }
    return false
  }
}

function makeParticleCreator(bee) {
  bee.particleDelay = 0
  let transferRate = 0

  app.ticker.add(time => {
    if (paused) return

    if (bee.pollenSack < bee.POLLEN_SACK_CAPACITY) return

    if (bee.particleDelay <= 0) {
      transferRate = Math.random() * 1
      bee.particleDelay = 1

      const pollenPixel = Sprite.fromImage('pollen-pixel.png')
      pollenPixel.position.x = bee.position.x + 2 + (Math.random() * 4)
      pollenPixel.position.y = bee.position.y + 4 + (Math.random() * 3) - 1.5
      let lifetime = 0
      app.ticker.add(time => {
        if (paused) return
        pollenPixel.position.y += 0.0003 * FPS * gameSpeed
        lifetime += transferTo(1).inSeconds(1)
        if (lifetime > 1) {
          foreground.removeChild(pollenPixel)
        }
      })
      foreground.addChild(pollenPixel)
      return
    }
    bee.particleDelay -= transferTo(1).inSeconds(transferRate)
  })
}

const isForager = b => b.type === 'forager'
const isIdle = b => b.type === 'idle'

function increaseForagers() {
  const idleBees = bees.filter(isIdle)

  if (idleBees.length > 0) {
    idleBees[0].type = 'forager'
  }
}

function decreaseForagers() {
  const foragerBees = bees.filter(isForager)

  if (foragerBees.length > 0) {
    foragerBees[0].type = 'idle'
  }
}

function createQueen(parent) {
  const queenSprite = PIXI.Sprite.fromImage('bee-queen.png')
  makeSelectable(queenSprite, 'queen')
  queenSprite.type = 'queen'
  
  const queenWingAddon = Sprite.fromImage('bee-queen-wings-flapped.png')
  queenWingAddon.visible = false
  queenSprite.addChild(queenWingAddon)
  
  const queenLegAddon = Sprite.fromImage('bee-queen-legs-jerk.png')
  queenLegAddon.visible = false
  queenSprite.addChild(queenLegAddon)
  
  queenSprite.idle = {
    x: 100,
    y: 45
  }
  goIdle(queenSprite)
  queenSprite.animationTicker = Math.random() * 100
  queenSprite.delay = 0

  makeFlyable(queenSprite)
  makeHexDetectable(queenSprite)

  queenSprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => {
      let str = ''
      if (queenSprite.isAtType('brood')) {
        str = 'Laying egg'
      } else if (!queenSprite.isMoving()) {
        str = 'Cannot find empty brood\nhexagon to lay eggs in'
      }      
      text.text = str
    })
    return text
  }

  app.ticker.add(time => {
    if (paused) return
    
    queenSprite.animationTicker += speeds[gameSpeed]
    
    const targetBrood = queenSprite.isAtType('brood')
    
    queenWingAddon.visible = (queenSprite.vx !== 0 || queenSprite.vy !== 0) && Math.sin(queenSprite.animationTicker) > 0
    queenLegAddon.visible = (queenSprite.vx === 0 && queenSprite.vy === 0 && targetBrood) && Math.sin(queenSprite.animationTicker) > 0

    if (targetBrood) {
      queenSprite.delay += transferTo(1).inSeconds(10)
      if (queenSprite.delay < 1) return true
      queenSprite.delay = 0
      targetBrood.setContents('egg')
      queenSprite.position.y = queenSprite.position.y - 5
      return true
    }

    const emptyBroodCells = filterHexagon(hexGrid, hex => hex.type === 'brood' && !hex.isOccupiedWithOffspring())
    if (emptyBroodCells.length > 0) {
      queenSprite.flyTo(emptyBroodCells[0])
      return true
    }
    queenSprite.flyTo(null)
    return false
  })

  queen = queenSprite
  parent.addChild(queenSprite)
}

function createBee(parent, type, startPosition) {
  const bee = Sprite.fromImage('bee-drone-body.png')
  const beeAddon = Sprite.fromImage('bee-drone-legs.png')
  bee.addChild(beeAddon)
  const beeExclamation = Sprite.fromImage('exclamation.png')
  beeExclamation.position.x = 12
  beeExclamation.position.y = -2
  beeExclamation.visible = false
  bee.addChild(beeExclamation)
  makeSelectable(bee, 'bee')
  makeHungry(bee)
  makeParticleCreator(bee)
  const isAt = samePosition(bee)
  bee.idle = {
    x: 35,
    y: 60 + (bees.length * 15)
  }
  goIdle(bee)
  if (startPosition) {
    bee.position.x = startPosition.x
    bee.position.y = startPosition.y
  }
  makeFlyable(bee)
  makeHexDetectable(bee)
  bee.animationTicker = Math.random() * 100
  bee.NECTAR_SACK_CAPACITY = 20
  bee.POLLEN_SACK_CAPACITY = 20
  bee.HONEY_SACK_CAPACITY = 10
  
  bee.pollenSack = 0
  bee.setPollen = amount => { bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(amount); return bee }
  bee.waxSack = 0
  bee.nectarSack = 0
  bee.setNectar = amount => { bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(amount); return bee }
  bee.honeySack = 0
  bee.setHoney = amount => { bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(amount); return bee }
  bee.type = type || 'unassigned'
  
  const isPollenSackFull = () => bee.pollenSack >= bee.POLLEN_SACK_CAPACITY
  const isPollenSackEmpty = () => !(bee.pollenSack > 0)

  const isNectarSackFull = () => bee.nectarSack >= bee.NECTAR_SACK_CAPACITY
  const isNectarSackEmpty = () => !(bee.nectarSack > 0)

  const isHoneySackFull = () => bee.honeySack >= bee.HONEY_SACK_CAPACITY
  const isHoneySackEmpty = () => !(bee.honeySack > 0)

  const helperText = () => {
    if (bee.type === 'forager' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y && isPollenSackFull()) {
      return 'Cannot find pollen hexagon'
    }
    if (bee.type === 'nurser' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      if (isPollenSackFull()) {
        return 'Cannot find larvae'
      } else {
        return 'Cannot find pollen hexagon'
      }
    }
    if (bee.type === 'worker' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Cannot find converter hex'
    }
    if (bee.type === 'idle') {
      return 'Bee is idle'
    }
    return ''
  }

  bee.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => {
      let str = ''
      str += bee.isDead() ? 'Dead ;_;   ' : ''
      str += bee.type
      str += '\n\n'
      str += helperText()
      str += '\n\n'
      str += 'Pollen  ' + Math.round(bee.pollenSack) + '\n'
      str += 'Nectar  ' + Math.round(bee.nectarSack) + '\n'
      str += 'Wax     ' + Math.round(bee.waxSack) + '\n'
      str += 'Honey   ' + Math.round(bee.honeySack) + '\n\n'
      str += 'Hunger  ' + Math.round(bee.hunger)
      text.text = str
    })
    return text
  }

  function flyToAndDepositNectar() {
    
    const targetHex = bee.isAtType('converter')
    if (targetHex && !isNectarSackEmpty()) {
      targetHex.claimSlot(bee)
      bee.nectarSack -= transferTo(bee.NECTAR_SACK_CAPACITY).inSeconds(5)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)
      targetHex.nectar += transferTo(targetHex.NECTAR_CAPACITY).inSeconds(5)
      targetHex.nectar = cap(0, targetHex.NECTAR_CAPACITY)(targetHex.nectar)
      return true
    }

    if (!isNectarSackFull()) return false

    const converterNeedsNectar = filterHexagon(hexGrid, hex => hex.type === 'converter' && !hex.isNectarFull() && hex.isUnclaimed(bee))
    
    if (converterNeedsNectar.length === 0) return false

    converterNeedsNectar[0].claimSlot(bee)
    bee.flyTo(converterNeedsNectar[0])
    
    return true
  }

  function flyToAndPollinateFlower() {
    const flower = bee.isAtType('flower')
    console.log('flower', flower);
    if (flower && !isPollenSackFull()) {
      flower.claimSlot(bee)
      bee.pollenSack += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(300)
      bee.nectarSack += transferTo(bee.NECTAR_SACK_CAPACITY).inSeconds(300)
      bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)
      if (isPollenSackFull() && isNectarSackFull()) {
        bee.position.y = flower.position.y - 5
      }
      return true
    }
    const unclaimedFlowers = flowers.filter(flower => flower.isUnclaimed(bee))

    if (!isPollenSackFull() && unclaimedFlowers[0]) {
      unclaimedFlowers[0].claimSlot(bee)
      bee.flyTo(unclaimedFlowers[0])
      return true
    }
    return false
  }

  function depositPollen() {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)  
    bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    hex.pollen += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)
    if (isPollenSackEmpty() || hex.isPollenFull()) {
      bee.position.y = hex.position.y - 5
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

  function forager() {
    if (bee.feedBee()) return
    if (flyToAndDepositNectar()) return
    if (depositPollen()) return    
    if (flyToAndPollinateFlower()) return
    if (flyToPollen()) return    
    bee.flyTo(null)
  }

  function nurser() {
    if (bee.feedBee()) return
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
      bee.pollenSack += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
      pollenHex[0].pollen -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
      if (isPollenSackFull()) {
        bee.position.y = pollenHex[0].position.y - 5
      }
      return
    }

    if (larvaeHex.length > 0 && isAtAnyLarvae.length > 0 && !isPollenSackEmpty()) {
      isAtAnyLarvae[0].claimSlot(bee)
      bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(20)
      isAtAnyLarvae[0].nutrition += transferTo(isAtAnyLarvae[0].NUTRITION_CAPACITY).inSeconds(10)
      isAtAnyLarvae[0].nutrition = cap(0, isAtAnyLarvae[0].NUTRITION_CAPACITY)(isAtAnyLarvae[0].nutrition)
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
    const hex = bee.isAtType('converter')
    if (!hex || isHoneySackFull()) return false
    hex.claimSlot(bee)
    hex.nectar -= transferTo(hex.NECTAR_CAPACITY).inSeconds(30)
    hex.nectar = cap(0, hex.NECTAR_CAPACITY)(hex.nectar)
    bee.honeySack += transferTo(bee.HONEY_SACK_CAPACITY).inSeconds(30)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)
    bee.eat()
    if (isHoneySackFull() || hex.isNectarEmpty()) {
      bee.position.y = hex.position.y - 5
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
    const hex = bee.isAtType('honey')
    if (!hex) return false
    hex.claimSlot(bee)

    hex.honey += transferTo(hex.HONEY_HEX_CAPACITY / 3).inSeconds(10)
    hex.honey = cap(0, hex.HONEY_HEX_CAPACITY)(hex.honey)

    bee.honeySack -= transferTo(bee.HONEY_SACK_CAPACITY).inSeconds(10)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)

    if (isHoneySackEmpty() || hex.isHoneyFull()) {
      bee.position.y = hex.position.y - 5
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

    beeExclamation.visible = bee.isHungry()
    
    bee.animationTicker += speeds[gameSpeed]

    if (bee.vx !== 0 || bee.vy !== 0) {
      (bee.vx >= -0.15 || bee.vx === 0) ? bee.scale.set(1, 1) : bee.scale.set(-1, 1) //
      if (Math.sin(bee.animationTicker) > 0) {
        beeAddon.texture = Texture.fromImage('bee-drone-wings.png')
      } else {
        beeAddon.texture = Texture.fromImage('bee-drone-wings-flapped.png')
      }
    } else {
      bee.scale.set(1, 1)
      if (bee.position.x === 35 || Math.sin(bee.animationTicker / 2) > 0) {
        beeAddon.texture = Texture.fromImage('bee-drone-legs.png')
      } else {
        beeAddon.texture = Texture.fromImage('bee-drone-legs-jerk.png')
      }
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
  return bee
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
  honeySprite.honey = 0
  honeySprite.setHoney = amount => { honeySprite.honey = cap(0, honeySprite.HONEY_HEX_CAPACITY)(amount); return honeySprite }
  honeySprite.isHoneyFull = () => honeySprite.honey >= honeySprite.HONEY_HEX_CAPACITY
  honeySprite.isHoneyEmpty = () => honeySprite.honey <= 0
  
  app.ticker.add(time => {
    if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.75) {
      honeySprite.texture = Texture.fromImage('cell-honey-full.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.50) {
      honeySprite.texture = Texture.fromImage('cell-honey-filling.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.25) {
      honeySprite.texture = Texture.fromImage('cell-honey-partial.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.05) {
      honeySprite.texture = Texture.fromImage('cell-honey-minimal.png')
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
  makeHexDetectable(converterSprite)
  converterSprite.position.x = pixelCoordinate.x
  converterSprite.position.y = pixelCoordinate.y
  converterSprite.NECTAR_CAPACITY = 15
  converterSprite.nectar = 0
  converterSprite.setNectar = amount => { converterSprite.nectar = cap(0, converterSprite.NECTAR_CAPACITY)(amount); return converterSprite }
  converterSprite.isNectarFull = () => converterSprite.nectar >= converterSprite.NECTAR_CAPACITY
  converterSprite.isNectarEmpty = () => converterSprite.nectar <= 0
 
  converterSprite.panelContent = () => {
    const text = new PIXI.Text('Loading', { ...fontConfig })
    text.position.x = 7
    text.position.y = 50
    app.ticker.add(time => {
      text.text = `Nectar   ${ Math.round(converterSprite.nectar) }`
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
  
  // Stored in seconds for easy transitions
  broodSprite.lifecycle = 0
  
  broodSprite.content = 'empty'
  broodSprite.NUTRITION_CAPACITY = 100
  broodSprite.nutrition = null
  broodSprite.isOccupiedWithOffspring = () => broodSprite.content !== 'empty'
  broodSprite.setContents = item => {
    // empty -> egg -> (larvae -> puppa) || dead
    broodSprite.content = item
    if (item === 'egg') {
      broodSprite.lifecycle = 0
      broodSprite.nutrition = 50
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
    
    broodSprite.lifecycle += transferTo(225).inSeconds(225)

    // Transitions
    if (broodSprite.lifecycle > 20 && broodSprite.content === 'egg') {
      broodSprite.setContents('larvae')      
    } else if (broodSprite.lifecycle > 20 + 105 && broodSprite.content === 'larvae') {
      broodSprite.setContents('puppa')
    } else if (broodSprite.lifecycle > 20 + 105 + 50 && broodSprite.content === 'puppa') {
      broodSprite.setContents('empty')
      createBee(beeContainer, null, { x: broodSprite.position.x, y: broodSprite.position.y - 5 })
    }

    // States
    if (broodSprite.content === 'larvae') {
      broodSprite.nutrition -= transferTo(broodSprite.NUTRITION_CAPACITY).inSeconds(60)
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
      const line2 = broodSprite.content === 'larvae' ? '\nNutrients: ' + Math.round(broodSprite.nutrition) : ''
      const line3 = ['egg', 'larvae', 'puppa'].includes(broodSprite.content) ? '\nLifecycle: ' + Math.round(broodSprite.lifecycle) : ''
      const line4 = '\n\n' + (broodSprite.content === 'dead' ? 'Larvae needs pollen to survive' : '')
      text.text = broodSprite.content + line2 + line3 + line4
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
  //Space
  if (e.keyCode === 32) {
    paused = !paused
  }

  // 1
  if (e.keyCode === 49) {
    gameSpeed = 1
    paused = false
  }

  // 2
  if (e.keyCode === 50) {
    gameSpeed = 4
    paused = false
  }

  // 2
  if (e.keyCode === 51) {
    gameSpeed = 8
    paused = false
  }

  // 3
  if (e.keyCode === 52) {
    gameSpeed = 64
    paused = false
  }
    
  setGameSpeedText()
})


setup()

