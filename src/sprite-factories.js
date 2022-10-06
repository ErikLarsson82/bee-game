
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

function makeFlyable(sprite) {
  sprite.vx = 0
  sprite.vy = 0
  sprite.flyTo = targetSprite => {
    if (!targetSprite) {
      targetSprite = {
        position: {
          x: sprite.idle.x,
          y: sprite.idle.y
        }
      }
    }

    if ((sprite.position.y < hiveHole.position.y && targetSprite.position.y > hiveHole.position.y) ||
        (sprite.position.y > hiveHole.position.y && targetSprite.position.y < hiveHole.position.y)) {
      targetSprite = hiveHole
    }

    const x = targetSprite.position.x - sprite.position.x
    const y = targetSprite.position.y - sprite.position.y

    sprite.setShadowPosition()
    if (x === 0 && y === 0) return
    const direction = new PIXI.Point(x, y).normalize()

    sprite.vx += direction.x * 0.030 * (gameSpeed * 5)
    sprite.vy += direction.y * 0.030 * (gameSpeed * 5)

    const distFactor = distanceFactor(sprite, targetSprite)

    let maxSpeed = 0.28

    if (distFactor < 12) maxSpeed = 0.17
    if (distFactor < 9) maxSpeed = 0.12
    if (distFactor < 6) maxSpeed = 0.07
    if (distFactor < 3) maxSpeed = 0.05

    let velocity = new PIXI.Point(sprite.vx, sprite.vy)

    if (velocity.magnitude() > maxSpeed * gameSpeed) {
      velocity = new PIXI.Point(velocity.normalize().x * maxSpeed * gameSpeed, velocity.normalize().y * maxSpeed * gameSpeed)
    }
    sprite.vx = velocity.x
    sprite.vy = velocity.y

    sprite.position.x += sprite.vx
    sprite.position.y += sprite.vy
    snapTo(sprite, targetSprite)

    sprite.setShadowPosition()
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
    if (flowerResult.length > 0 && type === 'flower') return flowerResult[0]
    return null
  }
}


function makeHungry(bee) {
  bee.HUNGER_CAPACITY = 100
  bee.hunger = bee.HUNGER_CAPACITY
  bee.isDead = () => bee.hunger <= 0 || bee.age >= 100
  bee.isWellFed = () => bee.hunger >= bee.HUNGER_CAPACITY
  bee.isHungry = () => bee.hunger < 30
  bee.isWinterHungry = () => bee.hunger < 80
  bee.setHunger = amount => { bee.hunger = cap(0, bee.HUNGER_CAPACITY)(amount); return bee }

  bee.consumeEnergy = () => {
    if (season === 'summer') {
      const seconds = blizzardWinter ? 1300 : 900
      bee.hunger -= transferTo(bee.HUNGER_CAPACITY).inSeconds(seconds)
    } else {
      bee.hunger -= transferTo(bee.HUNGER_CAPACITY).inSeconds(900 / winterHungerMultiplier)
    }
    
    bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)

    if (bee.hunger <= 0) {
      bee.setType('dead')
      return true
    }
  }

  bee.eat = () => {
    if (season === 'winter' && blizzardWinter) {
      if (bee.isHungry()) {
        bee.hunger += transferTo(bee.HUNGER_CAPACITY).inSeconds(20)
      }
      return
    }
    bee.hunger += transferTo(bee.HUNGER_CAPACITY).inSeconds(20)
    bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)
  }

  bee.feedBee = () => {
    const honeyTarget = bee.isAtType('honey')
    if (honeyTarget && !bee.isWellFed() && honeyTarget.honey > 0) {
      honeyTarget.claimSlot(bee)
      bee.eat()
      const honeyRate = season === 'winter' && blizzardWinter ? 330 : 40
      honeyTarget.honey -= transferTo(honeyTarget.HONEY_HEX_CAPACITY).inSeconds(honeyRate)
      honeyTarget.honey = cap(0, honeyTarget.HONEY_HEX_CAPACITY)(honeyTarget.honey)
      return true
    } else {
      bee.consumeEnergy()
    }

    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.honey > 0 && hex.isUnclaimed(bee))
    const wantsFood = (season === 'summer' && bee.isHungry()) || (season === 'winter' && bee.isWinterHungry())
    if (honeyHex.length > 0 && wantsFood) {
      honeyHex[0].claimSlot(bee)
      const closest = getClosestHex(honeyHex, bee)
      bee.flyTo(closest)
      return true
    }
    return false
  }
}

function makeParticleCreator(bee) {
  bee.particleDelay = 0
  bee.particleActive = true
  let transferRate = 0

  bee.disableParticle = () => bee.particleActive = false

  bee.removeParticleTicker = () => {
    bee.disableParticle()
    bee.particleTicker.remove = true
  }

  bee.particleTicker = addTicker('game-stuff', time => {
    if (!bee.particleActive) return bee.removeParticleTicker()
    if (bee.pollenSack < bee.POLLEN_SACK_CAPACITY) return

    if (bee.particleDelay <= 0) {
      transferRate = (Math.random() * 1) + 0.8
      bee.particleDelay = 1

      const pollenPixel = Sprite.fromImage('images/drops/pollen-pixel.png')
      pollenPixel.position.x = bee.position.x + 2 + (Math.random() * 4)
      pollenPixel.position.y = bee.position.y + 4 + (Math.random() * 3) - 1.5
      let lifetime = 0
      const removeParticle = () => pollenPixel.particle.remove = true 
      pollenPixel.particle = addTicker('game-stuff', time => {
        if (!bee.particleActive) {
          removeParticle()
          foreground.removeChild(pollenPixel)
          return
        }
        pollenPixel.position.y += 0.0003 * FPS * gameSpeed
        lifetime += transferTo(1).inSeconds(1)
        if (lifetime > 1) {
          removeParticle()
          foreground.removeChild(pollenPixel)
        }
      })
      foreground.addChild(pollenPixel)
      return
    }
    bee.particleDelay -= transferTo(1).inSeconds(transferRate)
  })
}
