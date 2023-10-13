
function makeSelectable(sprite, label, shape) {
  const hoverCellSprite = Sprite.fromImage('images/ui/hover-cell.png')
  hoverCellSprite.visible = false

  sprite.addChild(hoverCellSprite)

  sprite.label = label || 'no name'
  sprite.interactive = true
  sprite.buttonMode = true
  sprite.alpha = 1
  sprite.mouseover = () => {
    if (shape === 'round') {
      sprite.alpha = 0.7
    } else if (shape === 'hex') {
      hoveredCells.push(sprite)
    }
  }
  sprite.mouseout = () => {
    if (shape === 'round') {
      sprite.alpha = 1
    } else if (shape === 'hex') {
      hoveredCells = hoveredCells.filter((cell) => cell !== sprite)
    }
  }
  sprite.mousedown = () => setSelected(sprite)
}

function makeHexagon(sprite, x, y, type) {
  sprite.type = type
  sprite.index = { x, y }
  sprite.bonuses = []
}

function makeUpgradeable(sprite) {
  sprite.upgrades = []
  sprite.hasUpgrade = type => sprite.upgrades.includes(type)
  sprite.addUpgrade = type => sprite.upgrades.push(type)
}

function makeOccupiable(parent) {
  const spotClaimed = PIXI.Sprite.fromImage('images/ui/spot-claimed.png')
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

  addTicker('game-stuff', time => {
    if (parent.slot) {
      parent.slotCounter = parent.slotCounter - gameSpeed
      if (parent.slotCounter <= 0) {
        parent.slot = null
      }
    }
    // spotClaimed.visible = !!parent.slot // enable for debug
  })
}

 

function makeHexDetectable(bee) {
  bee.isAtType = type => {
    const hexesInGrid = filterHexagon(hexGrid, hex => hex.type === type && samePosition(bee, hex))
    if (hexesInGrid.length > 0) return hexesInGrid[0]

    const flowerResult = flowers.filter(flower => samePosition(bee, flower))
    if (flowerResult.length > 0 && type === 'flower') return flowerResult[0]
    return null
  }
}

