function singularOrPluralDay (amount) {
  if (amount === 1) return 'last day'
  return `${amount} days left`
}

function removeTicker (id) {
  tickers.forEach((ticker) => {
    if (ticker.id === id) {
      ticker.remove = true
    }
  })
}

function killBroodlings () {
  forEachHexagon(hexGrid, (hex) => {
    if (hex.type === 'brood' && ['egg', 'larvae'].includes(hex.content)) {
      hex.kill()
    }
  })
}

function freezeNectar () {
  bees.forEach((b) => (b.nectarSack = 0))
  forEachHexagon(hexGrid, (hex) => {
    if (hex.type === 'nectar') {
      hex.setNectar(0)
    }
  })
}

function something (x) {
  return x !== undefined
}

function notMe (_x, _y) {
  return (hex) => {
    const { x, y } = hex.index
    return !(_x === x && _y === y)
  }
}

function adjacent (_x, _y) {
  const ad = []
  const instructions =
    _x % 2 === 0 ? DIRECTIONS_FLAT_EVEN : DIRECTIONS_FLAT_ODD
  for (const direction in instructions) {
    const modifier = instructions[direction]
    const target =
      hexGrid[_y + modifier.y] && hexGrid[_y + modifier.y][_x + modifier.x]
    ad.push(target)
  }
  return ad.filter(something).filter(notMe(_x, _y))
}

function isHoney (hex) {
  return hex.type === 'honey'
}

function isNectar (hex) {
  return hex.type === 'nectar'
}

function isHoneyBuff (hex) {
  return hex.bonusType === 'honey-buff'
}

function isNectarBuff (hex) {
  return hex.bonusType === 'nectar-buff'
}

function isPollenFeederBuff (hex) {
  return hex.bonusType === 'pollen-feeder'
}

function calculateAdjacencyBonuses () {
  forEachHexagon(hexGrid, (hex) => {
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
        const modifier = 1 + honeyTargets.length * 0.1
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

      const modifierFrom =
        (previousHoneyBonus && previousHoneyBonus.modifier) || 1
      const modifierTo = (currentHoneyBonus && currentHoneyBonus.modifier) || 1

      if (modifierFrom > modifierTo) {
        spawnBonusMinus(hex.position.x, hex.position.y)
      } else if (modifierFrom < modifierTo) {
        spawnBonusPlus(hex.position.x, hex.position.y)
      }
    }

    // Nectar bonus
    if (isNectar(hex)) {
      if (nectarTargets.length > 0) {
        const modifier = 1 + nectarTargets.length * 0.1
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

      const modifierFrom =
        (previousNectarBonus && previousNectarBonus.modifier) || 1
      const modifierTo =
        (currentNectarBonus && currentNectarBonus.modifier) || 1

      if (modifierFrom > modifierTo) {
        spawnBonusMinus(hex.position.x, hex.position.y)
      } else if (modifierFrom < modifierTo) {
        spawnBonusPlus(hex.position.x, hex.position.y)
      }
    }
  })
}

function activateAdjacent (_x, _y) {
  const adjacentHexagons = adjacent(_x, _y)

  adjacentHexagons
    .filter((hex) => hex.isDisabled && hex.isDisabled())
    .forEach((hex) => {
      const { x, y } = hex.index
      hexGrid[y][x] = cellEmpty(x, y, hexForeground, hexBackground)
    })
}

function spawnBonusIcon (x, y, img) {
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

function spawnBonusPlus (x, y) {
  spawnBonusIcon(x, y, 'images/ui/bonus-plus.png')
}

function spawnBonusMinus (x, y) {
  spawnBonusIcon(x, y, 'images/ui/bonus-minus.png')
}

function goIdle (bee) {
  bee.position.x = bee.idle.x
  bee.position.y = bee.idle.y
}

function snapTo (a, b) {
  const threshold = gameSpeed > 4 ? 4 : 2.5
  if (
    distance(a.position.x, a.position.y, b.position.x, b.position.y) < threshold
  ) {
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
    'experiment-1': cellExperiment1,
    'forager-resting-place': cellForagerRestingPlace
  }[input]
}

function sortHexForeground () {
  hexForeground.children.sort((a, b) => b.index.x - a.index.x)
  hexForeground.children.sort(
    (a, b) =>
      a.index.y * 2 + (a.index.y % 2) - (b.index.y * 2 + (b.index.y % 2))
  )
}

function replaceHex (coordinate, type, activate) {
  if (!nameToFunction(type)) {
    throw new Error('Missing type!')
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

function replaceSelectedHex (type) {
  let returnHex = null
  hexGrid.forEach((row, yIdx) =>
    row.forEach((hex, xIdx) => {
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
    })
  )

  calculateAdjacencyBonuses()

  return returnHex
}

function typeIdlePos (type, pos) {
  const rowHeight = 38
  const beesPerRow = 8
  const baseline = 38
  if (type === 'unassigned') {
    throw new Error('Not allowed to be unassigned')
  }
  const y = {
    idle: baseline,
    forager: baseline + 1 * rowHeight,
    nurser: baseline + 2 * rowHeight,
    worker: baseline + 3 * rowHeight,
    bookie: baseline + 4 * rowHeight
  }[type]

  return {
    x: 80 - (pos % beesPerRow) * 11,
    y: y + Math.floor(pos / beesPerRow) * 10
  }
}

function getIdlePosition (type) {
  const filteredBees = bees.filter(
    (x) => x.type === type && !x.isDead() && !x.isDying()
  )
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
  } while (!found)

  return comparee
}

function increaseForagers () {
  const idleBees = bees.filter(isIdle)

  if (idleBees.length > 0) {
    idleBees[0].type = 'forager'
  }
}
const isForager = (b) => b.type === 'forager'

function decreaseForagers () {
  const foragerBees = bees.filter(isForager)

  if (foragerBees.length > 0) {
    foragerBees[0].type = 'idle'
  }
}
