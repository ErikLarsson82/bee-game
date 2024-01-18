import foo from './test-import'

console.log(foo + ' test again')

function setGameSpeedText() {
  if (paused) {
    gameSpeedIcon.texture = Texture.fromImage('images/ui/gamespeed0.png')
  } else {
    gameSpeedIcon.texture = Texture.fromImage('images/ui/gamespeed' + gameSpeed + '.png')
  }
  pauseFrame.visible = paused
}

function singularOrPluralDay(amount) {
  if (amount === 1) return `last day`
  return `${amount} days left`
} 

function isDayBeforeWinter() {
  return currentCycle === 1 && season === 'summer'
}

function generateRandomId() {
  const chars = 'abcdefghijklmnopqrstuvx'
  let str = ''
  for (let i = 0; i < 20; i++) {
    str += chars[Math.floor(Math.random()*(chars.length-1))]
  }
  return str + '_' + Math.random()
}

function addTicker(type, func) {
  const id = generateRandomId()
  const tickerObject = {
    id,
    type,
    func,
    remove: false
  }
  tickers.push(tickerObject)
  return tickerObject
}

function removeTicker(id) {
  tickers.forEach(ticker => {
    if (ticker.id === id) {
      ticker.remove = true
    }
  })
}

function updateTotals(valueLabel, capacityLabel, type, funcA, funcB) {
  return time => {
    let value = 0
    let capacity = 0
    forEachHexagon(hexGrid, hex => {
      if (hex.type === type) {
        value += funcA(hex)
        capacity += funcB(hex)
      }
    })
    valueLabel.text = value.toFixed(0)
    capacityLabel.text = capacity.toFixed(0)
  }  
}



function isUI(ticker) {
  return ticker.type === 'ui'
}

function isGameStuff(ticker) {
  return ticker.type === 'game-stuff'
}

function killBroodlings() {
  forEachHexagon(hexGrid, hex => {
    if (hex.type === 'brood' && ['egg', 'larvae'].includes(hex.content)) {
      hex.kill()
    }
  })
}

function freezeNectar() {
  bees.forEach(b => b.nectarSack = 0)
  forEachHexagon(hexGrid, hex => {
    if (hex.type === 'nectar') {
      hex.setNectar(0)
    }
  })
}

function something(x) {
  return x !== undefined
}

function notMe(_x, _y) {
  return hex => {
    const { x, y } = hex.index
    return !(_x === x && _y === y)
  }
}


function adjacent(_x, _y) {
  const ad = []
  const instructions = _x % 2 === 0 ? DIRECTIONS_FLAT_EVEN : DIRECTIONS_FLAT_ODD
  for (direction in instructions) {
    const modifier = instructions[direction]
    const target = hexGrid[_y + modifier.y] && hexGrid[_y + modifier.y][_x + modifier.x]
    ad.push(target)
  }
  return ad.filter(something)
    .filter(notMe(_x, _y))
}

function isHoney(hex) {
  return hex.type === 'honey'
}

function isNectar(hex) {
  return hex.type === 'nectar'
}

function isHoneyBuff(hex) {
  return hex.bonusType === 'honey-buff'
}

function isNectarBuff(hex) {
  return hex.bonusType === 'nectar-buff'
}

function isPollenFeederBuff(hex) {
  return hex.bonusType === 'pollen-feeder'
}

function calculateAdjacencyBonuses() {
  forEachHexagon(hexGrid, hex => {

    const previousBonuses = [...hex.bonuses]
    // Recaulculate all from scratch
    hex.bonuses = []

    const { x, y } = hex.index
    const adjacentHexagons = adjacent(x, y)

    const honeyTargets = adjacentHexagons.filter(isHoney)
    const nectarTargets = adjacentHexagons.filter(isNectar)
    
    // Honey bonus
    if (isHoney(hex)) {
      if (honeyTargets.length > 0) {
        const modifier = 1 + (honeyTargets.length * 0.1)
        hex.bonuses.push({
          bonusType: 'honey-buff',
          modifier
        })
        hex.HONEY_HEX_CAPACITY = hex.HONEY_HEX_CAPACITY_BASELINE * modifier
      } else {
        hex.HONEY_HEX_CAPACITY = hex.HONEY_HEX_CAPACITY_BASELINE
      }
      
      const previousHoneyBonus = previousBonuses.find(isHoneyBuff)
      const currentHoneyBonus = hex.bonuses.find(isHoneyBuff)

      const modifierFrom = previousHoneyBonus && previousHoneyBonus.modifier || 1
      const modifierTo = currentHoneyBonus && currentHoneyBonus.modifier || 1
      
      if (modifierFrom > modifierTo) {
        spawnBonusMinus(hex.position.x, hex.position.y)
      } else if (modifierFrom < modifierTo) {
        spawnBonusPlus(hex.position.x, hex.position.y)
      }      
    }

    // Nectar bonus
    if (isNectar(hex)) {
      if (nectarTargets.length > 0) {
        const modifier = 1 + (nectarTargets.length * 0.1)
        hex.bonuses.push({
          bonusType: 'nectar-buff',
          modifier
        })
        hex.NECTAR_CAPACITY = hex.NECTAR_CAPACITY_BASELINE * modifier
      } else {
        hex.NECTAR_CAPACITY = hex.NECTAR_CAPACITY_BASELINE
      }

      const previousNectarBonus = previousBonuses.find(isNectarBuff)
      const currentNectarBonus = hex.bonuses.find(isNectarBuff)

      const modifierFrom = previousNectarBonus && previousNectarBonus.modifier || 1
      const modifierTo = currentNectarBonus && currentNectarBonus.modifier || 1
      
      if (modifierFrom > modifierTo) {
        spawnBonusMinus(hex.position.x, hex.position.y)
      } else if (modifierFrom < modifierTo) {
        spawnBonusPlus(hex.position.x, hex.position.y)
      }
    }
  })

}

function activateAdjacent(_x, _y) {
  const adjacentHexagons = adjacent(_x, _y)

  adjacentHexagons.filter(hex => hex.isDisabled && hex.isDisabled())
    .forEach(hex => {
      const { x, y } = hex.index
      hexGrid[y][x] = cellEmpty(x, y, hexForeground, hexBackground)
    })
}

function setSelected(item) {

  // start with cleanup of panel
  panel.removeChildren()

  angelBubbleTimer = 0
  selected = item || null

  if (!item) {
    return;  
  }

  panel.addChild(item.panelContent())

  if (item.label && !(item.panelLabel && item.panelLabel() !== true)) {
    const panelText = new PIXI.Text(item.label, { ...fontConfig })
    panelText.position.x = 6
    panelText.position.y = 2
    panel.addChild(panelText)
  }
}


function addJobsButtons(jobsPanel) {
  for (var i = 0; i < 3; i++) {
    for (var j = 0; j < 2; j++) {
      {
        const button = new Sprite()
        const textureA = Texture.fromImage(j === 0 ? 'images/ui/button-jobs/button-plus.png' : 'images/ui/button-jobs/button-minus.png')
        const textureB = Texture.fromImage(j === 0 ? 'images/ui/button-jobs/button-active-plus.png' : 'images/ui/button-jobs/button-active-minus.png')
        const textureC = Texture.fromImage(j === 0 ? 'images/ui/button-jobs/button-hover-plus.png' : 'images/ui/button-jobs/button-hover-minus.png')
        button.texture = textureA

        button.position.x = 76
        button.position.y = 36 + (i * 38) + (j * 10)
        button.interactive = true
        button.buttonMode = true
        const idx = ['forager', 'nurser', 'worker']
        const type = idx[i]
        const action = j === 0 ? 'add' : 'remove'
        button.mouseover = () => {
          button.texture = textureC
        }
        button.mouseout = () => {
          button.texture = textureA
        }
        button.mouseup = () => {
          jobs(action, type)
          button.texture = textureA
        }
        button.mousedown = () => {
          button.texture = textureB
        }
        jobsPanel.addChild(button)
      }
    }
  }
}

function spawnBonusIcon(x, y, img) {
  if (day === 1 && hour === 0) return
  const sprite = Sprite.fromImage(img)
  sprite.position.x = x + 6
  sprite.position.y = y + 2
  foreground.addChild(sprite)

  let counter = 0
  addTicker('ui', () => {
    if (counter > 201) return
    counter++
    sprite.position.y -= 0.1

    if (counter > 100) sprite.alpha -= 0.01

    if (counter > 200) {
      foreground.removeChild(sprite)
    }
  })
}

function spawnBonusPlus(x, y) {
  spawnBonusIcon(x, y, 'images/ui/bonus-plus.png')
}

function spawnBonusMinus(x, y) {
  spawnBonusIcon(x, y, 'images/ui/bonus-minus.png')
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

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

function distanceFactor(a, b) {
  const x2 = Math.abs(a.position.x - b.position.x) * 2
  const y2 = Math.abs(a.position.y - b.position.y) * 2
  return Math.sqrt(x2 + y2)
}

function snapTo(a, b) {
  const threshold = gameSpeed > 4 ? 4 : 2.5 
  if (distance(a.position.x, a.position.y, b.position.x, b.position.y) < threshold) {
    a.position.x = b.position.x
    a.position.y = b.position.y
    a.vx = 0
    a.vy = 0
  }
}

const nameToFunction = (input) => {
	return {
	  nectar: cellNectar,
	  brood: cellBrood,
	  pollen: cellPollen,
	  honey: cellHoney,
	  wax: cellWax,
	  prepared: cellPrepared,
    empty: cellEmpty,
    blocked: cellBlocked,
    ['experiment-1']: cellExperiment1,
    ['forager-resting-place']: cellForagerRestingPlace,
	}[input] 
}

function sortHexForeground() {
  hexForeground.children.sort((a, b) => b.index.x - a.index.x)
  hexForeground.children.sort((a, b) => (a.index.y * 2 + a.index.y % 2) - (b.index.y * 2 + b.index.y % 2))
}

function replaceHex(coordinate, type, activate) {
  if (!nameToFunction(type)) {
    throw 'No type!'
  }

  const [x, y] = coordinate

  if (activate === 'activate') activateAdjacent(x, y)

  hexForeground.removeChild(hexGrid[y][x])
  
  const newHex = nameToFunction(type)(x, y, hexForeground)
  hexGrid[y][x] = newHex
  sortHexForeground()

  calculateAdjacencyBonuses()

  return newHex
}

function replaceSelectedHex(type) {
  let returnHex = null
  hexGrid.forEach((row, yIdx) => row.forEach((hex, xIdx) => {
    if (hex === selected) {
      hexForeground.removeChild(hex)
      
      if (!nameToFunction(type)) {
        console.error('No type!')
      }
      const newHex = nameToFunction(type)(xIdx, yIdx, hexForeground)
      hexGrid[yIdx][xIdx] = newHex
      sortHexForeground()

      returnHex = newHex
      setSelected(newHex)
    }
  }))

  calculateAdjacencyBonuses()

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

function typeIdlePos(type, pos) {
  const rowHeight = 38
  const beesPerRow = 8
  const baseline = 38
  if (type === 'unassigned') {
    debugger;
  }
  const y = {
    idle: baseline,
    forager: baseline + (1 * rowHeight),
    nurser: baseline + (2 * rowHeight),
    worker: baseline + (3 * rowHeight),
    bookie: baseline + (4 * rowHeight),
  }[type]

  return {
    x: 80 - (pos % beesPerRow) * 11,
    y: y + (Math.floor(pos / beesPerRow) * 10)
  }
}

function getIdlePosition(type) {
  const filteredBees = bees.filter(x => x.type === type && !x.isDead() && !x.isDying())
  let found = false
  let idx = 0
  let comparee = null
  do {
    comparee = typeIdlePos(type, idx)
    const occupied = filteredBees.find(({ idle }) => {
      const { x, y } = idle
      return comparee.x === x && comparee.y === y
    })
    if (occupied) {
      idx++
    } else {
      found = true
    }
    
  } while(!found)

  return comparee
}


const isForager = b => b.type === 'forager'
const isIdle = b => b.type === 'idle'

function jobs(addOrRemove, type) {
  const aliveBees = bees.filter(bee => !bee.isDead() && !bee.isDying())
  const availableBees = aliveBees.filter(addOrRemove === 'add' ? isIdle : x=>x.type===type)

  if (availableBees.length > 0) {
    availableBees[0].setType(addOrRemove === 'add' ? type : 'idle')
  }
}

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

function isGameOver(currentCycleIndex, aliveBees) {
  if (aliveBees.length === 0) return true
  if (levelCompleteCriteria(currentCycleIndex)) return true

  return false
}

function levelCompleteCriteria(currentCycleIndex) {
  return currentCycleIndex === 6 && keepPlaying === false
}