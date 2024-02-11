import { Container, Sprite, Texture, Text } from 'pixi.js'
import {
  getIdlePosition,
  goIdle,
  addTicker,
  transferTo,
  adjacent,
  activateAdjacent,
  setPixelPerfect
} from './exported-help-functions'
import { animateSprite } from './animate-sprite'
import { makeSelectable, makeHexDetectable } from './sprite-factories'
import { makeFlyable, makeHungry, makeParticleCreator } from './bee-factories'
import { samePosition, cap, distance } from './pure-help-functions'
import { fps } from './framerate'
import {
  bees,
  setBees,
  angels,
  setAngels,
  gameSpeed,
  season,
  flowers,
  hexGrid,
  gameover,
  setAngelBubbleTimer
} from './game/game-state'
import { ProgressBar } from './ui'
import { fontConfig, speeds } from './config'
import { filterHexagon, getClosestHex } from './hex'
import { queen, angelBubble, angelBubbleText } from './game/pixi-elements'

export function createBee (parent, type, startPosition) {
  if (!type) {
    throw new Error('Error: createBee called without type')
  }

  const bee = new Container()

  const workingAnimations = {
    idle: animateSprite(bee, 'bee/idle/working.png', 43, 13, 8),
    worker: animateSprite(bee, 'bee/worker/working.png', 43, 13, 8),
    nurser: animateSprite(bee, 'bee/nurser/working.png', 43, 13, 8),
    forager: animateSprite(bee, 'bee/forager/working.png', 43, 13, 8),
    bookie: animateSprite(bee, 'bee/forager/working.png', 43, 13, 8)
  }

  const unloadingAnimations = {
    idle: animateSprite(bee, 'bee/idle/unloading.png', 31, 13, 8),
    worker: animateSprite(bee, 'bee/worker/unloading.png', 31, 13, 8),
    nurser: animateSprite(bee, 'bee/nurser/unloading.png', 31, 13, 8),
    forager: animateSprite(bee, 'bee/forager/unloading.png', 31, 13, 8)
  }

  const eatingAnimations = {
    idle: animateSprite(bee, 'bee/idle/eating.png', 36, 13, 13),
    worker: animateSprite(bee, 'bee/worker/eating.png', 36, 13, 13),
    nurser: animateSprite(bee, 'bee/nurser/eating.png', 36, 13, 13),
    forager: animateSprite(bee, 'bee/forager/eating.png', 36, 13, 13)
  }

  const dyingAgeAnimationCallback = () => {
    bee.setType('dead')
    bee.setDead(true)
    bee.setDying(false)
  }

  const dyingAgeAnimations = {
    idle: animateSprite(bee, 'bee/idle/dying-age.png', 44, 13, 9, false, dyingAgeAnimationCallback, true),
    worker: animateSprite(bee, 'bee/worker/dying-age.png', 44, 13, 9, false, dyingAgeAnimationCallback, true),
    nurser: animateSprite(bee, 'bee/nurser/dying-age.png', 44, 13, 9, false, dyingAgeAnimationCallback, true),
    forager: animateSprite(bee, 'bee/forager/dying-age.png', 44, 13, 9, false, dyingAgeAnimationCallback, true)
  }
  Object.values(dyingAgeAnimations).forEach((animation) => animation.pause())

  const dyingHungerAnimationCallback = () => {
    bee.setType('dead')
    bee.setDead(true)
    bee.setDying(false)
  }

  const dyingHungerAnimations = {
    idle: animateSprite(bee, 'bee/idle/dying-hunger.png', 45, 13, 11, false, dyingHungerAnimationCallback, true),
    worker: animateSprite(bee, 'bee/worker/dying-hunger.png', 45, 13, 11, false, dyingHungerAnimationCallback, true),
    nurser: animateSprite(bee, 'bee/nurser/dying-hunger.png', 45, 13, 11, false, dyingHungerAnimationCallback, true),
    forager: animateSprite(bee, 'bee/forager/dying-hunger.png', 45, 13, 11, false, dyingHungerAnimationCallback, true)
  }
  Object.values(dyingHungerAnimations).forEach((animation) => animation.pause())

  const convertingNectarAnimation = animateSprite(bee, 'bee/worker/converting-nectar.png', 32, 19, 13)
  convertingNectarAnimation.sprite.position.y = -2

  const shadow = Sprite.fromImage('shadow.png')
  bee.addChild(shadow)

  const honeyBucket = Sprite.fromImage('honey.png')
  bee.addChild(honeyBucket)
  const nectarBucket = Sprite.fromImage('nectar.png')
  bee.addChild(nectarBucket)
  const waxBucket = Sprite.fromImage('wax.png')
  bee.addChild(waxBucket)
  const pollenBucket = Sprite.fromImage('pollen.png')
  bee.addChild(pollenBucket)

  const droneBody = Sprite.fromImage('bee-drone-body-idle.png')
  bee.addChild(droneBody)

  const droneHand = Sprite.fromImage('bee-drone-hand.png')
  droneHand.position.x = 10
  droneHand.position.y = 5
  droneHand.visible = false
  bee.addChild(droneHand)

  const beeAddon = Sprite.fromImage('bee-drone-legs.png')
  beeAddon.position.x = -1
  beeAddon.position.y = -1
  bee.addChild(beeAddon)

  const beeExclamation = Sprite.fromImage('exclamation-warning-severe.png')
  beeExclamation.position.x = 12
  beeExclamation.position.y = -2
  beeExclamation.visible = false
  bee.addChild(beeExclamation)
  makeSelectable(bee, 'bee', 'round')
  makeHungry(bee)
  makeParticleCreator(bee)
  const isAt = samePosition(bee)
  bee.idle = getIdlePosition(type)
  goIdle(bee)
  if (startPosition) {
    bee.position.x = startPosition.x
    bee.position.y = startPosition.y
  }
  makeFlyable(bee)
  makeHexDetectable(bee)
  bee.animationTicker = Math.random() * 100
  bee.NECTAR_SACK_CAPACITY = 15
  bee.POLLEN_SACK_CAPACITY = 20
  bee.HONEY_SACK_CAPACITY = 10
  bee.WAX_SACK_CAPACITY = 10
  bee.DEAD_AT_AGE = Math.round(80 + (Math.random() * 40))

  bee.dying = {
    direction: {
      x: (Math.random() * 2) - 1,
      y: (Math.random() * 2) - 1
    },
    magnitude: 0.1
  }

  bee.roundedPos = { x: 0, y: 0 }

  bee.age = 0
  bee.setAge = amount => {
    bee.age = amount
    return bee
  }

  bee.boosted = false
  bee.setBoosted = input => {
    bee.boosted = input
    return bee
  }
  bee.isBoosted = () => bee.boosted

  bee.pollenSack = 0
  bee.setPollen = amount => {
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(amount)
    return bee
  }

  bee.nectarSack = 0
  bee.setNectar = amount => {
    bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(amount)
    return bee
  }

  bee.honeySack = 0
  bee.setHoney = amount => {
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(amount)
    return bee
  }

  bee.waxSack = 0
  bee.setWax = amount => {
    bee.waxSack = cap(0, bee.WAX_SACK_CAPACITY)(amount)
    return bee
  }

  bee.tallyIndex = 0

  bee.type = type
  bee.setType = type => {
    if (type === 'dead') {
      setBees(bees.filter((b) => b !== bee))
      setAngels(angels.concat(createAngel(bee)))
      bee.destroy()
    } else {
      bee.type = type
      droneBody.texture = Texture.fromImage('bee-drone-body-' + type + '.png')
    }
    bee.idle = getIdlePosition(type)
  }

  bee.showBee = () => {
    droneBody.visible = true
    beeAddon.visible = true
  }

  bee.hideBee = () => {
    droneBody.visible = false
    beeAddon.visible = false
  }

  bee.destroy = () => {
    honeyBucket.visible = false
    nectarBucket.visible = false
    waxBucket.visible = false
    pollenBucket.visible = false
    beeAddon.visible = false
    beeExclamation.visible = false
    bee.hideAllAnimations()
    bee.disableParticle()
    bee.removeUiTicker()
    bee.removeTicker()
    bee.removeParticleTicker()
    bee.removeChild(beeExclamation)
    parent.removeChild(bee)
  }

  const isPollenSackFull = () => bee.pollenSack >= bee.POLLEN_SACK_CAPACITY
  const isPollenSackEmpty = () => !(bee.pollenSack > 0)

  const isNectarSackFull = () => bee.nectarSack >= bee.NECTAR_SACK_CAPACITY
  const isNectarSackEmpty = () => !(bee.nectarSack > 0)

  const isHoneySackFull = () => bee.honeySack >= bee.HONEY_SACK_CAPACITY
  const isHoneySackEmpty = () => !(bee.honeySack > 0)

  const isWaxSackFull = () => bee.waxSack >= bee.WAX_SACK_CAPACITY
  const isWaxSackEmpty = () => !(bee.waxSack > 0)

  bee.isOverburdened = () => bee.type === 'forager' && (isNectarSackFull() || isPollenSackFull())

  bee.isPollenSackFull = isPollenSackFull
  bee.isNectarSackFull = isNectarSackFull
  bee.isHoneySackFull = isHoneySackFull
  bee.isWaxSackFull = isWaxSackFull
  bee.isPollenSackEmpty = isPollenSackEmpty
  bee.isNectarSackEmpty = isNectarSackEmpty
  bee.isHoneySackEmpty = isHoneySackEmpty
  bee.isWaxSackEmpty = isWaxSackEmpty

  const helperText = () => {
    if (bee.type === 'worker' && bee.isHungry()) {
      return '  Bee is\nhungry\n\nWorkers\neat when\nmaking honey'
    }
    if (bee.type !== 'worker' && bee.isHungry()) {
      return '  Bee is\nhungry\n\nNeeds access\nto honey\nhexagon'
    }
    if (bee.type === 'forager' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y && isPollenSackFull()) {
      return 'Cannot find\nunoccupied\npollen hexagon'
    }
    if (bee.type === 'forager' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Cannot find\nunoccupied\nflower'
    }
    if (bee.type === 'nurser' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      if (isPollenSackFull()) {
        return 'Cannot find\nlarvae'
      } else {
        return 'Cannot find\npollen hexagon'
      }
    }
    if (bee.type === 'worker' && !bee.isMoving() && isHoneySackFull() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Honey sack\nfull. Cannot\nfind honey\nhexagon to\ndeposit honey\ntoo'
    }
    if (bee.type === 'worker' && !bee.isMoving() && bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) {
      return 'Cannot find a\nnectar hex\nfilled with\nnectar'
    }
    if (bee.type === 'idle') {
      return 'Bee needs\na job'
    }
    return ''
  }

  bee.panelLabel = () => false
  bee.panelPosition = () => ({ x: bee.roundedPos.x + 8, y: bee.roundedPos.y + 5 })

  bee.panelContent = () => {
    const container = new Container()

    const whiteLine = Sprite.fromImage('white-description-line.png')
    whiteLine.position.x = -3
    whiteLine.position.y = -38
    container.addChild(whiteLine)

    const contentOffsetX = 66
    const contentOffsetY = -37

    const content = Sprite.fromImage('content-boilerplate.png')
    content.position.x = contentOffsetX
    content.position.y = contentOffsetY
    container.addChild(content)

    const beeExclamationLabel = Sprite.fromImage('exclamation-warning-severe.png')
    beeExclamationLabel.position.x = contentOffsetX + 10
    beeExclamationLabel.position.y = contentOffsetY + 58
    beeExclamationLabel.visible = false
    container.addChild(beeExclamationLabel)

    const boostedPlusIcon = Sprite.fromImage('bonus-plus.png')
    boostedPlusIcon.position.x = contentOffsetX + 20
    boostedPlusIcon.position.y = contentOffsetY + 2
    boostedPlusIcon.visible = false
    container.addChild(boostedPlusIcon)

    const bs = -22
    const p = [bs, bs + (1 * 7), bs + (2 * 7), bs + (3 * 7), bs + (4 * 7), bs + (5 * 7)]
    container.addChild(ProgressBar(106, p[0], 'hunger', () => bee.hunger, bee.HUNGER_CAPACITY))
    container.addChild(ProgressBar(106, p[1], 'honey', () => bee.honeySack, bee.HONEY_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[2], 'nectar', () => bee.nectarSack, bee.NECTAR_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[3], 'wax', () => bee.waxSack, bee.WAX_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[4], 'pollen', () => bee.pollenSack, bee.POLLEN_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[5], 'age', () => bee.age, bee.DEAD_AT_AGE))

    const textHeading = new Text('BEE', { ...fontConfig })
    setPixelPerfect(textHeading)
    textHeading.position.x = contentOffsetX + 30
    textHeading.position.y = contentOffsetY + 3
    container.addChild(textHeading)

    const texts = ['HUNGER', 'HONEY', 'NECTAR', 'WAX', 'POLLEN', 'AGE']

    texts.forEach((text, idx) => {
      const textDescription = new Text(text, { ...fontConfig, fill: '#8b9bb4' })
      setPixelPerfect(textDescription)
      textDescription.position.x = contentOffsetX + 10
      textDescription.position.y = contentOffsetY + 13 + (idx * 7)
      container.addChild(textDescription)
    })

    const helper = new Text('Loading...', { ...fontConfig, lineHeight: 44 })
    setPixelPerfect(helper)
    helper.position.x = contentOffsetX + 10
    helper.position.y = contentOffsetY + 58
    container.addChild(helper)

    addTicker('ui', () => {
      boostedPlusIcon.visible = bee.isBoosted()
      beeExclamationLabel.visible = bee.isHungry() && !bee.isDead()
      helper.text = helperText().toUpperCase()
    })

    return container
  }

  function collectFlowerResources () {
    const flower = bee.isAtType('flower')
    const needsResource = !(isPollenSackFull() && isNectarSackFull())
    if (flower && needsResource && season === 'summer') {
      flower.claimSlot(bee)

      if (!isPollenSackFull()) {
        flower.pollinationLevel += transferTo(flower.POLLINATION_REQUIREMENT).inSeconds(200)
        flower.pollinationLevel = cap(0, flower.POLLINATION_REQUIREMENT)(flower.pollinationLevel)
      }

      bee.pollenSack += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(40)
      bee.nectarSack += transferTo(bee.NECTAR_SACK_CAPACITY).inSeconds(40)
      bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)

      if (isPollenSackFull() && isNectarSackFull()) {
        bee.position.y = flower.position.y - 5
      }
      return true
    }
    return false
  }

  function flyToFlowerToCollect () {
    const flower = flowers.find(flower => flower.isUnclaimed(bee))
    const needsResource = !(isPollenSackFull() && isNectarSackFull())

    if (needsResource && flower && season === 'summer') {
      flower.claimSlot(bee)
      bee.flyTo(flower)
      return true
    }
    return false
  }

  // function flyToFlowerToPollinate () {
  //   if (isPollenSackEmpty() || season === 'winter') return false
  //   const needsPollination = flower => flower.pollinationLevel < flower.POLLINATION_REQUIREMENT
  //   const flower = flowers.filter(needsPollination)[0]

  //   if (!flower) return false

  //   bee.flyTo(flower)
  //   return true
  // }

  // function pollinateFlower () {
  //   const flower = bee.isAtType('flower')
  //   if (!flower || season === 'winter') return false
  //   if (isPollenSackEmpty() || flower.isPollinated()) {
  //     bee.position.y = flower.position.y - 5
  //     return true
  //   }
  //   flower.claimSlot(bee)
  //   flower.pollinationLevel += transferTo(flower.POLLINATION_REQUIREMENT).inSeconds(200)
  //   flower.pollinationLevel = cap(0, flower.POLLINATION_REQUIREMENT)(flower.pollinationLevel)

  //   bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(40)
  //   bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
  //   return true
  // }

  function depositPollen () {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)

    const duration = bee.isBoosted() ? 15 : 30

    const rate = bee.POLLEN_SACK_CAPACITY
    bee.pollenSack -= transferTo(rate).inSeconds(duration)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen += transferTo(rate).inSeconds(duration)
    hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)

    if (isPollenSackEmpty() || hex.isPollenFull()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function refillPollen () {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)

    const rate = bee.POLLEN_SACK_CAPACITY
    bee.pollenSack += transferTo(rate).inSeconds(30)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen -= transferTo(rate).inSeconds(30)
    hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)

    if (isPollenSackFull() || hex.isPollenEmpty()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function refillWax () {
    const hex = bee.isAtType('wax')
    if (!hex) return false
    hex.claimSlot(bee)

    const rate = bee.WAX_SACK_CAPACITY
    bee.waxSack += transferTo(rate).inSeconds(30)
    bee.waxSack = cap(0, bee.WAX_SACK_CAPACITY)(bee.waxSack)
    hex.wax -= transferTo(rate).inSeconds(30)
    hex.wax = cap(0, hex.WAX_HEX_CAPACITY)(hex.wax)

    if (isWaxSackFull() || hex.isWaxEmpty()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function depositHoney () {
    const targetHex = bee.isAtType('honey')
    if (!targetHex) return false
    const valid = !isHoneySackEmpty() && !targetHex.isHoneyFull()
    if (!valid) return false

    targetHex.claimSlot(bee)

    const rate = bee.HONEY_SACK_CAPACITY / 3
    bee.honeySack -= transferTo(rate).inSeconds(5)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)

    targetHex.honey += transferTo(rate).inSeconds(5)
    targetHex.honey = cap(0, targetHex.HONEY_HEX_CAPACITY)(targetHex.honey)

    return true
  }

  function depositNectar () {
    const targetHex = bee.isAtType('nectar')
    if (!targetHex) return false
    const valid = !isNectarSackEmpty() && !targetHex.isNectarFull()
    if (!valid) return false
    targetHex.claimSlot(bee)

    const rate = bee.NECTAR_SACK_CAPACITY
    bee.nectarSack -= transferTo(rate).inSeconds(5)
    bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)
    targetHex.nectar += transferTo(rate).inSeconds(5)
    targetHex.nectar = cap(0, targetHex.NECTAR_CAPACITY)(targetHex.nectar)

    return true
  }

  function flyToHoneyToDeposit () {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.isUnclaimed(bee) && !hex.isHoneyFull())
    if (honeyHex.length === 0 || isHoneySackEmpty()) return false
    const closest = getClosestHex(honeyHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToConstruct () {
    const constructHex = filterHexagon(hexGrid, hex => hex.type === 'construction' && hex.isUnclaimed(bee))
    if (constructHex.length === 0 || isPollenSackEmpty()) return false
    const closest = getClosestHex(constructHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToNectarToDeposit () {
    const nectarHex = filterHexagon(hexGrid, hex => hex.type === 'nectar' && hex.isUnclaimed(bee) && !hex.isNectarFull())
    if (nectarHex.length === 0 || isNectarSackEmpty()) return false
    const closest = getClosestHex(nectarHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToPollenToDeposit () {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenFull())
    if (pollenHex.length === 0 || isPollenSackEmpty()) return false
    const closest = getClosestHex(pollenHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToPollenToRefill () {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenEmpty())
    if (pollenHex.length === 0 || isPollenSackFull()) return false
    const closest = getClosestHex(pollenHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToBroodling () {
    const larvaeHex = filterHexagon(hexGrid, hex =>
      hex.type === 'brood' &&
      hex.content === 'larvae' &&
      hex.isUnclaimed(bee) &&
      !hex.isWellFed()
    ).sort((a, b) => a.nutrition > b.nutrition ? 1 : -1)

    if (larvaeHex.length === 0 || isPollenSackEmpty()) return false
    larvaeHex[0].claimSlot(bee)
    bee.flyTo(larvaeHex[0])
    return true
  }

  function flyToCleanBrood () {
    const deadLarvaeHex = filterHexagon(hexGrid, hex =>
      hex.type === 'brood' &&
      hex.isUnclaimed(bee) &&
      hex.isDead()
    )

    if (deadLarvaeHex.length === 0) return false
    const closest = getClosestHex(deadLarvaeHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function nurseBroodling () {
    const isAnyLarvaeStarving = filterHexagon(hexGrid, hex => hex.type === 'brood' && hex.isStarving() && hex.isUnclaimed(bee))
    const isAtWellFedLarvae = filterHexagon(hexGrid, hex => hex.type === 'brood' && hex.isWellFed() && isAt(hex))
    const isAtAnyLarvae = filterHexagon(hexGrid, hex => hex.type === 'brood' && hex.content === 'larvae' && hex.isUnclaimed(bee) && isAt(hex))

    if (isAnyLarvaeStarving.length > 0 && isAtWellFedLarvae.length > 0) {
      // Take off, another larvae needs me
      bee.position.y = isAtWellFedLarvae[0].position.y - 5
    }

    if (isAtAnyLarvae.length === 0 || isPollenSackEmpty()) return false

    isAtAnyLarvae[0].claimSlot(bee)
    bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(40)
    isAtAnyLarvae[0].nutrition += transferTo(isAtAnyLarvae[0].NUTRITION_CAPACITY).inSeconds(10)
    isAtAnyLarvae[0].nutrition = cap(0, isAtAnyLarvae[0].NUTRITION_CAPACITY)(isAtAnyLarvae[0].nutrition)
    return true
  }

  function cleanBrood () {
    const hex = bee.isAtType('brood')
    if (!hex) return false
    hex.claimSlot(bee)
    hex.corpseCleaned -= transferTo(hex.CORPSE_DELAY).inSeconds(10)
    if (hex.corpseCleaned <= 0) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function ageBee () {
    bee.age += transferTo(200).inMinutes(200)
  }

  function dying () {
    if (bee.isDead()) return
    if (dyingHungerAnimations[bee.type].isRunning() || dyingAgeAnimations[bee.type].isRunning()) {
      bee.hideBee()
      shadow.visible = false
      bee.position.x += bee.dying.direction.x * bee.dying.magnitude
      bee.position.y += bee.dying.direction.y * bee.dying.magnitude
      bee.dying.magnitude -= 0.0003
      bee.dying.magnitude = Math.max(0, bee.dying.magnitude)

      if (bee.hunger <= 0) {
        dyingHungerAnimations[bee.type].sprite.visible = true
        beeExclamation.visible = true
      } else if (bee.age > bee.DEAD_AT_AGE) {
        dyingAgeAnimations[bee.type].sprite.visible = true
        beeExclamation.visible = false
      }

      return true
    }

    if (bee.hunger <= 0) {
      dyingHungerAnimations[bee.type].start()
      bee.setDying(true)
      return true
    } else if (bee.age > bee.DEAD_AT_AGE) {
      dyingAgeAnimations[bee.type].start()
      bee.setDying(true)
      return true
    }

    return false
  }

  function boost () {
    if (bee.isBoosted()) return false

    const boostHex = filterHexagon(hexGrid, hex => hex.type === 'experiment-1' && hex.hasBoostLeft())

    if (boostHex.length < 1) return false

    const hex = bee.isAtType('experiment-1')
    if (hex && hex.hasBoostLeft()) {
      hex.consumeOneBoost()
      bee.setBoosted(true)
      bee.position.y = hex.position.y - 5
      return true
    } else {
      bee.flyTo(boostHex[0])
      return true
    }
  }

  // function broodsAreDoneForTheSeason () {
  //   const isDone = hex => ['dead', 'puppa'].includes(hex.content)
  //   const unfinishedHexes = filterHexagon(hexGrid, hex => hex.type === 'brood' && !isDone(hex) && hex.paused === false)

  //   return unfinishedHexes.length === 0
  // }

  function idle () {
    if (dying()) return
    if (ageBee()) return
    if (bee.feedBee()) return
    if (boost()) return
    if (depositPollen()) return
    if (depositNectar()) return
    if (depositHoney()) return
    if (flyToHoneyToDeposit()) return
    if (flyToNectarToDeposit()) return
    if (flyToPollenToDeposit()) return
    bee.flyTo(null)
  }

  function forager () {
    if (dying()) return
    if (ageBee()) return
    if (bee.feedBee()) return
    if (boost()) return
    if (collectFlowerResources()) return
    if (depositPollen()) return
    if (depositNectar()) return
    if (flyToNectarToDeposit()) return
    if (flyToPollenToDeposit()) return
    if (flyToFlowerToCollect()) return
    if (flyToRestingPlace()) return
    bee.flyTo(null)
  }

  function nurser () {
    if (dying()) return
    if (ageBee()) return
    if (bee.feedBee()) return
    if (boost()) return
    if (refillPollen()) return
    // if (broodsAreDoneForTheSeason()) {
    //   if (pollinateFlower()) return
    //   if (flyToFlowerToPollinate()) return
    // }
    if (nurseBroodling()) return
    if (construct()) return
    if (season !== 'summer') {
      if (cleanBrood()) return
      if (flyToCleanBrood()) return
    }
    if (flyToPollenToRefill()) return
    if (flyToBroodling()) return
    if (flyToConstruct()) return
    bee.flyTo(null)
  }

  function worker () {
    if (dying()) return
    if (ageBee()) return
    if (depositHoney()) return
    if (bee.feedBee()) return
    if (boost()) return
    if (convertNectar()) return
    if (flyToHoneyToDeposit()) return
    // if (season === 'summer') {
    //  bee.consumeEnergy()
    // } else {
    //   if (bee.feedBee()) return
    // }
    if (refillWax()) return
    if (prepareCell()) return
    if (flyToPrepareCell()) return
    if (flyToWax()) return
    if (flyToNectarToConvert()) return
    bee.flyTo(null)
  }

  function bookie () {
    if (gameover) {
      bee.destroy()
    }
    if (tallyFlower()) return
    if (flyToFlowerToTally()) return
    if (flyToQueenToReport()) return
    bee.flyTo(null)
  }

  function tallyFlower () {
    const flower = bee.isAtType('flower')

    if (flower) {
      bee.tallyIndex++
    }
    return false
  }

  function flyToFlowerToTally () {
    const flower = flowers[bee.tallyIndex]

    if (flower) {
      bee.flyTo(flower)
      return true
    }
    return false
  }

  function flyToQueenToReport () {
    if (samePosition(bee, queen)) {
      bee.tallyIndex = 0
      return false
    } else {
      bee.flyTo(queen)
      return true
    }
  }

  const flyToRestingPlace = () => {
    const restingPlaces = filterHexagon(hexGrid, (hex) => hex.type === 'forager-resting-place' && hex.isUnclaimed(bee))
    const myRestingPlace = bee.isAtType('forager-resting-place')
    if (restingPlaces.length === 0 && !myRestingPlace) {
      return false
    }

    if (myRestingPlace) {
      myRestingPlace.claimSlot(bee)
      return true
    }

    const closest = getClosestHex(restingPlaces, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)

    return true
  }

  function convertNectar () {
    const hex = bee.isAtType('nectar')
    if (!hex || isHoneySackFull()) return false
    hex.claimSlot(bee)

    const duration = bee.isBoosted() ? 15 : 30

    if (!isNectarSackEmpty()) {
      const rateA = bee.NECTAR_SACK_CAPACITY
      bee.nectarSack -= transferTo(rateA).inSeconds(duration)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)
      hex.nectar += transferTo(rateA).inSeconds(duration)
      hex.nectar = cap(0, hex.NECTAR_CAPACITY)(hex.nectar)
    }
    const rateB = bee.HONEY_SACK_CAPACITY
    bee.honeySack += transferTo(rateB).inSeconds(duration)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)

    const rateC = bee.HONEY_SACK_CAPACITY * 1.5
    hex.nectar -= transferTo(rateC).inSeconds(duration)
    hex.nectar = cap(0, hex.NECTAR_CAPACITY)(hex.nectar)

    if (hex.hasUpgrade('converter-adjacent-feed')) {
      const ad = adjacent(hex.index.x, hex.index.y)
        .filter(({ type }) => type === 'honey')
        .filter(hex => !hex.isHoneyFull())

      if (ad.length > 0) {
        const target = ad[0]
        target.honey += transferTo(target.HONEY_HEX_CAPACITY / 6).inSeconds(5)
        target.honey = cap(0, target.HONEY_HEX_CAPACITY)(target.honey)
      }
    }

    bee.eat()
    if (isHoneySackFull() || (hex.isNectarEmpty() && isNectarSackEmpty())) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToNectarToConvert () {
    const nectarHex = filterHexagon(hexGrid, hex => hex.type === 'nectar' && hex.isUnclaimed(bee) && (!hex.isNectarEmpty() || !isNectarSackEmpty()))
    if (nectarHex.length === 0 || isHoneySackFull()) return false
    const closest = getClosestHex(nectarHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function construct () {
    const hex = bee.isAtType('construction')
    if (!hex || isPollenSackEmpty()) return false
    hex.claimSlot(bee)

    const rateA = bee.POLLEN_SACK_CAPACITY
    bee.pollenSack -= transferTo(rateA).inSeconds(5)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen += transferTo(rateA).inSeconds(5)
    hex.pollen = cap(0, hex.POLLEN_REQUIRED)(hex.pollen)

    if (isPollenSackEmpty() || hex.isComplete()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToWax () {
    const waxHex = filterHexagon(hexGrid, hex => hex.type === 'wax' && hex.isUnclaimed(bee) && !hex.isWaxEmpty())
    if (waxHex.length === 0 || isWaxSackFull()) return false
    const closest = getClosestHex(waxHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function prepareCell () {
    if (isWaxSackEmpty()) return
    const hex = bee.isAtType('prepared')
    if (!hex) return false
    hex.claimSlot(bee)

    hex.completeness += transferTo(100).inSeconds(20)
    hex.completeness = cap(0, 100)(hex.completeness)

    bee.waxSack -= transferTo(bee.WAX_SACK_CAPACITY).inSeconds(5)
    bee.waxSack = cap(0, bee.WAX_SACK_CAPACITY)(bee.waxSack)

    if (hex.completeness >= 100) {
      activateAdjacent(hex.index.x, hex.index.y)
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToPrepareCell () {
    if (isWaxSackEmpty()) return
    const preparedHex = filterHexagon(hexGrid, hex => hex.type === 'prepared' && hex.isUnclaimed(bee) && hex.completeness < 100)
    if (preparedHex.length === 0) return false
    const closest = getClosestHex(preparedHex, bee, distance)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  bee.setShadowPosition = () => {
    const xPos = 0 - bee.position.x + bee.idle.x + 2
    shadow.position.x = bee.scale.x === 1 ? xPos : -xPos - 6
    shadow.position.y = 0 - bee.position.y + bee.idle.y + 4
  }

  bee.removeUiTicker = () => (bee.uiTicker.remove = true)

  bee.uiTicker = addTicker('ui', time => {
    bee.setShadowPosition()
  })

  bee.hideAllAnimations = () => {
    Object.values(workingAnimations).forEach((animation) => (animation.sprite.visible = false))
    Object.values(unloadingAnimations).forEach((animation) => (animation.sprite.visible = false))
    Object.values(eatingAnimations).forEach((animation) => (animation.sprite.visible = false))
    Object.values(dyingAgeAnimations).forEach((animation) => (animation.sprite.visible = false))
    convertingNectarAnimation.sprite.visible = false
  }

  bee.removeTicker = () => (bee.ticker.remove = true)
  bee.handleAnimations = () => {
    // Reset all
    bee.hideBee()
    bee.hideAllAnimations()

    {
      // Nectar to honey conversion
      const isConverting = bee.isAtType('nectar') && bee.type === 'worker'
      if (isConverting) {
        if (!convertingNectarAnimation.isRunning()) convertingNectarAnimation.restart()
        convertingNectarAnimation.sprite.visible = true
        return
      }
      convertingNectarAnimation.pause()
    }

    // Is eating
    const honeyTarget = bee.isAtType('honey')
    const isEating = honeyTarget && bee.isHoneySackEmpty()

    if (isEating) {
      eatingAnimations[bee.type].sprite.visible = true
      return
    }

    // Unloading animation
    const isUnloading =
      (bee.isAtType('pollen') && bee.type === 'forager') ||
      (bee.isAtType('nectar') && bee.type === 'forager') ||
      (bee.isAtType('honey') && bee.type === 'worker' && season === 'summer')

    if (isUnloading) {
      unloadingAnimations[bee.type].sprite.visible = true
      return
    }

    // Generic working animation
    const isWorking = bee.isAtType('brood') || bee.isAtType('pollen') || bee.isAtType('prepared') || bee.isAtType('honey') || bee.isAtType('wax') || bee.isAtType('nectar') || bee.isAtType('flower')

    if (isWorking) {
      workingAnimations[bee.type].sprite.visible = true
      return
    }

    bee.showBee()
  }

  bee.ticker = addTicker('game-stuff', time => {
    bee.roundedPos = {
      x: Math.round(bee.position.x),
      y: Math.round(bee.position.y)
    }

    bee.setShadowPosition()

    bee.handleAnimations()

    beeExclamation.visible = bee.isHungry()

    bee.animationTicker += speeds[gameSpeed]

    // 3 buckets can be visible, and is placed "in order"
    let bucketCount = 0
    const bucketMeasures = [isHoneySackFull(), isNectarSackFull(), isWaxSackFull(), isPollenSackFull()]
    const bucketTargets = [honeyBucket, nectarBucket, waxBucket, pollenBucket]
    const bucketPositions = [{ x: 7, y: 7 }, { x: 2, y: 7 }, { x: 10, y: 2 }]

    for (let i = 0; i < 4; i++) {
      if (bucketMeasures[i] && bucketCount < 3) {
        bucketTargets[i].visible = true
        bucketTargets[i].position.x = bucketPositions[bucketCount].x
        bucketTargets[i].position.y = bucketPositions[bucketCount].y
        bucketCount++
      } else {
        bucketTargets[i].visible = false
      }
    }
    droneHand.visible = bucketCount > 2

    if (bee.vx !== 0 || bee.vy !== 0) {
      (bee.vx >= -0.15 || bee.vx === 0) ? bee.scale.set(1, 1) : bee.scale.set(-1, 1) //
      if (Math.sin(bee.animationTicker) > 0) {
        beeAddon.texture = Texture.fromImage('bee-drone-wings.png')
      } else {
        beeAddon.texture = Texture.fromImage('bee-drone-wings-flapped.png')
      }
    } else {
      bee.scale.set(1, 1)
      if ((bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) || Math.sin(bee.animationTicker / 2) > 0) {
        beeAddon.texture = Texture.fromImage('bee-drone-legs.png')
      } else {
        beeAddon.texture = Texture.fromImage('bee-drone-legs-jerk.png')
      }
    }

    if (bee.type === 'forager') forager()
    if (bee.type === 'nurser') nurser()
    if (bee.type === 'worker') worker()
    if (bee.type === 'bookie') bookie()
    if (bee.type === 'idle') idle()

    bee.setShadowPosition()
  })

  bees.push(bee)
  parent.addChild(bee)
  return bee
}

function createAngel (bee) {
  const container = new Container()

  const angelSprite = Sprite.fromImage('angel.png')
  angelSprite.alpha = 0.6
  container.addChild(angelSprite)

  const beeExclamation = Sprite.fromImage('exclamation-warning-severe.png')
  beeExclamation.position.x = 12
  beeExclamation.position.y = -2
  beeExclamation.visible = false
  angelSprite.addChild(beeExclamation)

  container.position.x = bee.position.x
  container.position.y = bee.position.y

  container.interactive = true
  container.mouseup = e => {
    if (angelBubble.parent) {
      angelBubble.parent.removeChild(angelBubble)
    }
    container.addChild(angelBubble)
    setAngelBubbleTimer(fps * 5)
  }

  let obituary = bee.type.toUpperCase()
  if (bee.hunger <= 0) {
    obituary += ' WHO DIED OF HUNGER'
  } else {
    obituary += ' WHO DIED OF AGE'
  }

  beeExclamation.visible = bee.hunger <= 0

  angelBubbleText.text = obituary

  container.ticker = addTicker('game-stuff', time => {
    container.position.y -= 0.05 + 0.1 * Math.random()

    if (container.position.y < -30) {
      setAngels(angels.filter(a => a !== container))
      container.ticker.remove = true
      container.destroy()
    }
  })

  bee.parent.addChild(container)
  return container
}
