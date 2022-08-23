
function makeSelectable(sprite, label) {
  sprite.label = label || 'no name'
  sprite.interactive = true
  sprite.buttonMode = true
  sprite.alpha = 1
  sprite.mouseover = () => sprite.alpha = 0.7
  sprite.mouseout = () => sprite.alpha = 1
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
    const x = targetSprite.position.x - sprite.position.x
    const y = targetSprite.position.y - sprite.position.y

    sprite.setShadowPosition()
    if (x === 0 && y === 0) return
    const direction = new PIXI.Point(x, y).normalize()

    sprite.vx += direction.x * 0.030 * (gameSpeed * 5)
    sprite.vy += direction.y * 0.030 * (gameSpeed * 5)

    const distanceToTarget = distance(sprite, targetSprite)

    let maxSpeed = 0.28

    if (distanceToTarget < 12) maxSpeed = 0.17
    if (distanceToTarget < 9) maxSpeed = 0.12
    if (distanceToTarget < 6) maxSpeed = 0.07
    if (distanceToTarget < 3) maxSpeed = 0.05

    let velocity = new PIXI.Point(sprite.vx, sprite.vy)

    if (velocity.magnitude() > velocity.normalize().magnitude() * maxSpeed * gameSpeed) {
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
  bee.setHunger = amount => { bee.hunger = cap(0, bee.HUNGER_CAPACITY)(amount); return bee }

  bee.consumeEnergy = () => {
    // A bee will survive approx 15 minutes at speed 1 with a full belly, which is 15 min * 60 sec = 900 sec
    // 900 sec * 144 FPS = 129600 game ticks
    // 100 hunger value points / 129600 gameticks = 0.00077160 reduction in hunger each tick
    // Above is calculated during summer

    if (season === 'summer') {
      bee.hunger -= transferTo(bee.HUNGER_CAPACITY).inSeconds(900)
    } else {
      bee.hunger -= transferTo(bee.HUNGER_CAPACITY).inSeconds(900 / winterHungerMultiplier)
    }
    
    bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)

    if (bee.hunger <= 0) {
      bee.setType('dead')
    }
  }

  bee.eat = () => {
    bee.hunger += transferTo(bee.HUNGER_CAPACITY).inSeconds(20)
    bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)
  }

  bee.feedBee = () => {
    const honeyTarget = bee.isAtType('honey')
    if (honeyTarget && !bee.isWellFed() && honeyTarget.honey > 0) {
      honeyTarget.claimSlot(bee)
      bee.eat()
      honeyTarget.honey -= transferTo(honeyTarget.HONEY_HEX_CAPACITY).inSeconds(40)
      return true
    } else {
      bee.consumeEnergy()
    }

    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.honey > 0 && hex.isUnclaimed(bee))
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
          delete pollenPixel
          return
        }
        pollenPixel.position.y += 0.0003 * FPS * gameSpeed
        lifetime += transferTo(1).inSeconds(1)
        if (lifetime > 1) {
          removeParticle()
          foreground.removeChild(pollenPixel)
          delete pollenPixel
        }
      })
      foreground.addChild(pollenPixel)
      return
    }
    bee.particleDelay -= transferTo(1).inSeconds(transferRate)
  })
}
