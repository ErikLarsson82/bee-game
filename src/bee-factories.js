import { distance } from './exported-help-functions'

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

    const overburdenedFactor = sprite.isOverburdened() && !sprite.isBoosted() ? 0.3 : 1
    const boostFactor = sprite.isBoosted() ? 1.5 : 1

    if (distFactor < 12) maxSpeed = 0.17
    if (distFactor < 9) maxSpeed = 0.12
    if (distFactor < 6) maxSpeed = 0.07
    if (distFactor < 3) maxSpeed = 0.05

    let velocity = new PIXI.Point(sprite.vx, sprite.vy)

    const sum = maxSpeed * gameSpeed * overburdenedFactor * boostFactor
    
    if (velocity.magnitude() > sum) {
      velocity = new PIXI.Point(velocity.normalize().x * sum, velocity.normalize().y * sum)
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


function makeHungry(bee) {
  bee.HUNGER_CAPACITY = 100
  bee.hunger = bee.HUNGER_CAPACITY
  bee._dead = false
  bee._dying = false
  bee.isDead = () => bee._dead
  bee.isDying = () => bee._dying
  bee.setDead = input => bee._dead = input
  bee.setDying = input => bee._dying = input
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
      const closest = getClosestHex(honeyHex, bee, distance)
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
    let availableTypes = []

    if (bee.isPollenSackFull()) availableTypes.push('pollen')
    if (bee.isHoneySackFull()) availableTypes.push('honey')
    if (bee.isWaxSackFull()) availableTypes.push('wax')
    if (bee.isNectarSackFull()) availableTypes.push('nectar')

    if (bee.particleDelay <= 0 && bee.isMoving() && availableTypes.length > 0) {
      transferRate = (Math.random() * 1) + 0.8
      bee.particleDelay = 1

      const randomType = availableTypes[Math.floor(availableTypes.length * Math.random())];
      const pixel = Sprite.fromImage(`images/drops/pixel-${randomType}.png`)
      pixel.position.x = bee.position.x + 2 + (Math.random() * 4)
      pixel.position.y = bee.position.y + 4 + (Math.random() * 3) - 1.5
      let lifetime = 0
      const removeParticle = () => pixel.particle.remove = true 
      pixel.particle = addTicker('game-stuff', time => {
        if (!bee.particleActive) {
          removeParticle()
          foreground.removeChild(pixel)
          return
        }
        pixel.position.y += 0.0003 * FPS * gameSpeed
        lifetime += transferTo(1).inSeconds(1)
        if (lifetime > 1) {
          removeParticle()
          foreground.removeChild(pixel)
        }
      })
      foreground.addChild(pixel)
      return
    }
    bee.particleDelay -= transferTo(1).inSeconds(transferRate)
  })
}
