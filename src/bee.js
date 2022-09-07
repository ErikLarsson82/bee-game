
function createBee(parent, type, startPosition) {
  if (!type) {
    throw 'Error: createBee called without type'
  }

  const bee = new Container()
  
  const workingAnimations = {
    idle: animateSprite(bee, 'bee-working-animation-idle', 43, 13, 8),
    worker: animateSprite(bee, 'bee-working-animation-worker', 43, 13, 8),
    nurser: animateSprite(bee, 'bee-working-animation-nurser', 43, 13, 8),
    forager: animateSprite(bee, 'bee-working-animation-forager', 43, 13, 8),
    bookie: animateSprite(bee, 'bee-working-animation-forager', 43, 13, 8),
  }

  const unloadingAnimations = {
    idle: animateSprite(bee, 'bee-unloading-animation-idle', 43, 13, 8),
    worker: animateSprite(bee, 'bee-unloading-animation-worker', 43, 13, 8),
    nurser: animateSprite(bee, 'bee-unloading-animation-nurser', 43, 13, 8),
    forager: animateSprite(bee, 'bee-unloading-animation-forager', 43, 13, 8),
  }

  const shadow = Sprite.fromImage('images/bee/shadow.png')
  bee.addChild(shadow)

  const honeyBucket = Sprite.fromImage('images/buckets/honey.png')
  bee.addChild(honeyBucket)
  const nectarBucket = Sprite.fromImage('images/buckets/nectar.png')
  bee.addChild(nectarBucket)
  const waxBucket = Sprite.fromImage('images/buckets/wax.png')
  bee.addChild(waxBucket)
  const pollenBucket = Sprite.fromImage('images/buckets/pollen.png')
  bee.addChild(pollenBucket)

  const droneBody = Sprite.fromImage('images/bee/bee-drone-body-idle.png')
  bee.addChild(droneBody)

  const droneHand = Sprite.fromImage('images/bee/bee-drone-hand.png')
  droneHand.position.x = 10
  droneHand.position.y = 5
  droneHand.visible = false
  bee.addChild(droneHand)  
  
  const animationSprite = Sprite.fromImage('images/bee/cell-conversion-animation-a.png')
  animationSprite.position.y = -4
  animationSprite.visible = true
  animationSprite.delay = 0
  bee.addChild(animationSprite)
  
  const beeAddon = Sprite.fromImage('images/bee/bee-drone-legs.png')
  beeAddon.position.x = -1
  beeAddon.position.y = -1
  bee.addChild(beeAddon)
  
  const beeExclamation = Sprite.fromImage('images/exclamations/exclamation-warning-severe.png')
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
  
  bee.age = 0
  bee.setAge = amount => {
    bee.age = amount
    return bee
  }

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
      bees = bees.filter((b) => b !== bee)
      angels.push(createAngel(bee))
      bee.destroy()
    } else {
      bee.type = type
      droneBody.texture = Texture.fromImage('images/bee/bee-drone-body-' + type + '.png')
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
    bee.removeUiTicker()
    bee.removeTicker()
    bee.removeParticleTicker()
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
      return 'Cannot find a\nconverter hex\nfilled with\nnectar'
    }
    if (bee.type === 'idle') {
      return 'Bee needs\na job'
    }
    return ''
  }

  bee.panelLabel = () => false
  bee.panelPosition = () => ({ x: bee.position.x + 8, y: bee.position.y + 5 })

  bee.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = -3
    whiteLine.position.y = -38
    container.addChild(whiteLine)

    const contentOffsetX = 66
    const contentOffsetY = -37

    const content = Sprite.fromImage('images/ui/content-boilerplate.png')
    content.position.x = contentOffsetX
    content.position.y = contentOffsetY
    container.addChild(content)

    const beeExclamationLabel = Sprite.fromImage('images/exclamations/exclamation-warning-severe.png')
    beeExclamationLabel.position.x = contentOffsetX + 10
    beeExclamationLabel.position.y = contentOffsetY + 58
    beeExclamationLabel.visible = false
    container.addChild(beeExclamationLabel)

    const bs = -22
    const p = [bs, bs + (1 * 7), bs + (2 * 7), bs + (3 * 7), bs + (4 * 7), bs + (5 * 7)]
    container.addChild(ProgressBar(106, p[0], 'hunger', () => bee.hunger, bee.HUNGER_CAPACITY))
    container.addChild(ProgressBar(106, p[1], 'honey', () => bee.honeySack, bee.HONEY_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[2], 'nectar', () => bee.nectarSack, bee.NECTAR_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[3], 'wax', () => bee.waxSack, bee.WAX_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[4], 'pollen', () => bee.pollenSack, bee.POLLEN_SACK_CAPACITY))
    container.addChild(ProgressBar(106, p[5], 'age', () => bee.age, 100))
    
    const textHeading = new PIXI.Text('BEE', { ...fontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = contentOffsetX + 30
    textHeading.position.y = contentOffsetY + 3
    container.addChild(textHeading)

    const texts = ['HUNGER', 'HONEY', 'NECTAR', 'WAX', 'POLLEN', 'AGE']

    texts.forEach((text, idx) => {
      const textDescription = new PIXI.Text(text, { ...fontConfig, fill: '#8b9bb4' })
      textDescription.scale.set(0.15, 0.15)
      textDescription.position.x = contentOffsetX + 10
      textDescription.position.y = contentOffsetY + 13 + (idx * 7)
      container.addChild(textDescription)
    })

    const helper = new PIXI.Text('Loading...', { ...fontConfig, lineHeight: 44 })
    helper.scale.set(0.15, 0.15)
    helper.position.x = contentOffsetX + 10
    helper.position.y = contentOffsetY + 58
    container.addChild(helper)

    addTicker('ui', () => {
      beeExclamationLabel.visible = bee.isHungry() && !bee.isDead()
      helper.text = helperText().toUpperCase()
    })
    
    return container
  }

  function pollinateFlower() {
    const flower = bee.isAtType('flower')
    const needsResource = !(isPollenSackFull() && isNectarSackFull())
    if (flower && needsResource) { 
      flower.claimSlot(bee)
      flower.pollinationLevel += transferTo(flower.POLLINATION_REQUIREMENT).inSeconds(200)
      flower.pollinationLevel = cap(0, flower.POLLINATION_REQUIREMENT)(flower.pollinationLevel)

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

  function flyToFlower() {
    const flower = flowers.find(flower => flower.isUnclaimed(bee))
    const needsResource = !(isPollenSackFull() && isNectarSackFull())

    if (needsResource && flower) {
      flower.claimSlot(bee)
      bee.flyTo(flower)
      return true
    }
    return false
  }

  function depositPollen() {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)

    if (hex.hasUpgrade('pollen-feeder')) {
      const rate = bee.POLLEN_SACK_CAPACITY
      bee.pollenSack -= transferTo(rate).inSeconds(10)
      bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
      hex.pollen += transferTo(rate).inSeconds(10)      
      hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY - 10)(hex.pollen) // This can never be completely filled
      bee.hunger += transferTo(bee.HUNGER_CAPACITY).inSeconds(10)
      bee.hunger = cap(0, bee.HUNGER_CAPACITY)(bee.hunger)
    } else {
      const rate = bee.POLLEN_SACK_CAPACITY
      bee.pollenSack -= transferTo(rate).inSeconds(30)
      bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
      hex.pollen += transferTo(rate).inSeconds(30)
      hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)
    }

    if (isPollenSackEmpty() || hex.isPollenFull()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function refillPollen() {
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

  function refillWax() {
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

  function depositHoney() {
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

  function depositNectar() {
    const targetHex = bee.isAtType('converter')
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

  function flyToHoneyToDeposit() {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.isUnclaimed(bee) && !hex.isHoneyFull())
    if (honeyHex.length === 0 || isHoneySackEmpty()) return false
    const closest = getClosestHex(honeyHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)      
    return true
  }

  function flyToNectarToDeposit() {
    const converterHex = filterHexagon(hexGrid, hex => hex.type === 'converter' && hex.isUnclaimed(bee) && !hex.isNectarFull())
    if (converterHex.length === 0 || isNectarSackEmpty()) return false
    const closest = getClosestHex(converterHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToPollenToDeposit() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenFull())
    if (pollenHex.length === 0 || isPollenSackEmpty()) return false
    const closest = getClosestHex(pollenHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToPollenToRefill() {
    const pollenHex = filterHexagon(hexGrid, hex => hex.type === 'pollen' && hex.isUnclaimed(bee) && !hex.isPollenEmpty())
    if (pollenHex.length === 0 || isPollenSackFull()) return false
    const closest = getClosestHex(pollenHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function flyToBroodling() {
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

  function flyToCleanBrood() {
    const deadLarvaeHex = filterHexagon(hexGrid, hex => 
      hex.type === 'brood' &&
      hex.isUnclaimed(bee) && 
      hex.isDead()
    )

    if (deadLarvaeHex.length === 0) return false
    const closest = getClosestHex(deadLarvaeHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function nurseBroodling() {
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

  function cleanBrood() {
    const hex = bee.isAtType('brood')
    if (!hex) return false
    hex.claimSlot(bee)  
    hex.corpseCleaned -= transferTo(hex.CORPSE_DELAY).inSeconds(10)
    if (hex.corpseCleaned <= 0) {
      bee.position.y = hex.position.y - 5
    }
    return true    
  }

  function ageBee() {
    bee.age += transferTo(100).inMinutes(70)
    if (bee.age >= 100) {
      bee.setType('dead')
      return true
    }
  }

  function idle() {
    if (ageBee()) return
    if (bee.feedBee()) return
    if (depositPollen()) return
    if (depositNectar()) return 
    if (depositHoney()) return
    if (flyToHoneyToDeposit()) return
    if (flyToNectarToDeposit()) return
    if (flyToPollenToDeposit()) return    
    bee.flyTo(null)
  }

  function forager() {
    if (ageBee()) return
    if (bee.feedBee()) return
    if (pollinateFlower()) return
    if (depositPollen()) return
    if (depositNectar()) return
    if (flyToNectarToDeposit()) return
    if (flyToPollenToDeposit()) return    
    if (flyToFlower()) return
    if (flyToRestingPlace()) return
    bee.flyTo(null)
  }

  function nurser() {
    if (ageBee()) return
    if (bee.feedBee()) return
    if (refillPollen()) return
    if (nurseBroodling()) return
    if (season !== 'summer') {
      if (cleanBrood()) return
      if (flyToCleanBrood()) return
    }  
    if (flyToPollenToRefill()) return
    if (flyToBroodling()) return
    bee.flyTo(null)
  }

  function worker() {
    if (ageBee()) return
    if (convertNectar()) return
    if (depositHoney()) return
    if (flyToHoneyToDeposit()) return
    if (season === 'summer') {
      bee.consumeEnergy()
    } else {
      if (bee.feedBee()) return
    }
    if (refillWax()) return
    if (prepareCell()) return
    if (flyToPrepareCell()) return
    if (flyToWax()) return
    if (flyToConverterToConvert()) return
    bee.flyTo(null)
  }

  function bookie() {
    if (ageBee()) return
    if (bee.feedBee()) return
    if (tallyFlower()) return
    if (flyToFlowerToTally()) return
    if (flyToQueenToReport()) return
    bee.flyTo(null)
  }

  function tallyFlower() {
    const flower = bee.isAtType('flower')

    if (flower) {
      bee.tallyIndex++
    }
    return false
  }

  function flyToFlowerToTally() {
    const flower = flowers[bee.tallyIndex]

    if (flower) {
      bee.flyTo(flower)
      return true
    }
    return false
  }

  function flyToQueenToReport() {
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

    const closest = getClosestHex(restingPlaces, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)

    return true
  }

  function convertNectar() {
    const hex = bee.isAtType('converter')
    if (!hex || isHoneySackFull()) return false
    hex.claimSlot(bee)
    if (!isNectarSackEmpty()) {
      const rateA = bee.NECTAR_SACK_CAPACITY
      bee.nectarSack -= transferTo(rateA).inSeconds(30)
      bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(bee.nectarSack)      
      hex.nectar += transferTo(rateA).inSeconds(30)
      hex.nectar = cap(0, hex.NECTAR_CAPACITY)(hex.nectar)
    }
    const rateB = bee.HONEY_SACK_CAPACITY
    bee.honeySack += transferTo(rateB).inSeconds(30)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)

    const rateC = bee.HONEY_SACK_CAPACITY * 1.5
    hex.nectar -= transferTo(rateC).inSeconds(30)
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

  function flyToConverterToConvert() {
    const converterHex = filterHexagon(hexGrid, hex => hex.type === 'converter' && hex.isUnclaimed(bee) && (!hex.isNectarEmpty() || !isNectarSackEmpty()))
    if (converterHex.length === 0 || isHoneySackFull()) return false
    const closest = getClosestHex(converterHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)      
    return true
  }

  function flyToWax() {
    const waxHex = filterHexagon(hexGrid, hex => hex.type === 'wax' && hex.isUnclaimed(bee) && !hex.isWaxEmpty())
    if (waxHex.length === 0 || isWaxSackFull()) return false
    const closest = getClosestHex(waxHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    return true
  }

  function prepareCell() {
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

  function flyToPrepareCell() {
    if (isWaxSackEmpty()) return
    const preparedHex = filterHexagon(hexGrid, hex => hex.type === 'prepared' && hex.isUnclaimed(bee) && hex.completeness < 100)
    if (preparedHex.length === 0) return false
    const closest = getClosestHex(preparedHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)      
    return true
  }

  bee.setShadowPosition = () => {
    const xPos = 0 - bee.position.x + bee.idle.x + 2
    shadow.position.x = bee.scale.x === 1 ? xPos : -xPos - 6
    shadow.position.y = 0 - bee.position.y + bee.idle.y + 4
  }

  bee.removeUiTicker = () => bee.uiTicker.remove = true

  bee.uiTicker = addTicker('ui', time => {
    bee.setShadowPosition()
  })

  bee.hideAllAnimations = () => {
    Object.values(workingAnimations).forEach((animation) => animation.sprite.visible = false)
    Object.values(unloadingAnimations).forEach((animation) => animation.sprite.visible = false)
    animationSprite.visible = false
  }

  bee.removeTicker = () => bee.ticker.remove = true
  bee.handleAnimations = () => {
    // Reset all
    bee.hideBee()
    bee.hideAllAnimations()

    {
      // Specifically conversion animation only
      animationSprite.delay++
      animationSprite.delay = animationSprite.delay < 12 ? animationSprite.delay : 0
      const isConverting = bee.isAtType('converter') && bee.type === 'worker'
      if (isConverting) {
        animationSprite.visible = true
        animationSprite.texture = animationSprite.delay > 6
          ? Texture.fromImage('images/bee/cell-conversion-animation-a.png')
          : Texture.fromImage('images/bee/cell-conversion-animation-b.png')
        return
      }
    }
    // Unloading animation
    const isUnloading =
      (bee.isAtType('pollen') && bee.type === 'forager') ||
      (bee.isAtType('converter') && bee.type === 'forager') ||
      (bee.isAtType('honey') && bee.type === 'worker' && season === 'summer')

    if (isUnloading) {
      unloadingAnimations[bee.type].sprite.visible = true
      return
    }

    // Generic working animation
    const isWorking = bee.isAtType('brood') || bee.isAtType('pollen') || bee.isAtType('prepared') || bee.isAtType('honey') || bee.isAtType('wax') || bee.isAtType('converter') || bee.isAtType('flower')
    
    if (isWorking) {
      workingAnimations[bee.type].sprite.visible = true
      return
    }
    
    bee.showBee()
  }

  bee.ticker = addTicker('game-stuff', time => {
    bee.setShadowPosition()
    
    bee.handleAnimations()

    const deadPosition = 32
    if (bee.position.y === deadPosition) return

    if (bee.isDead()) {
      bee.texture = Texture.fromImage('images/bee/bee-drone-dead.png')
      honeyBucket.visible = false
      nectarBucket.visible = false
      waxBucket.visible = false
      pollenBucket.visible = false
      beeAddon.visible = false
      beeExclamation.visible = false
      bee.hideAllAnimations()
      bee.disableParticle()
      if (bee.position.y !== deadPosition) {
        bee.position.x = 65 + (Math.random() * 100)
        bee.position.y = deadPosition
      }
      bee.destroy()
      return
    }

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
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-wings.png')
      } else {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-wings-flapped.png')
      }
    } else {
      bee.scale.set(1, 1)
      if ((bee.position.x === bee.idle.x && bee.position.y === bee.idle.y) || Math.sin(bee.animationTicker / 2) > 0) {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-legs.png')
      } else {
        beeAddon.texture = Texture.fromImage('images/bee/bee-drone-legs-jerk.png')
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

function createAngel(bee) {
  const container = new Container()
  
  const angelSprite = Sprite.fromImage('images/bee/angel.png')
  angelSprite.alpha = 0.6
  container.addChild(angelSprite)

  container.position.x = bee.position.x
  container.position.y = bee.position.y

  container.interactive = true
  container.mouseup = e => {
    if (angelBubble.parent) {
      angelBubble.parent.removeChild(angelBubble)
    }
    container.addChild(angelBubble)
    angelBubbleTimer = FPS * 5
  }

  let obituary = bee.type.toUpperCase()
  if (bee.hunger <= 0) {
    obituary += ' WHO DIED OF HUNGER'
  } else {
    obituary += ' WHO DIED OF AGE'
  }

  angelBubbleText.text = obituary

  container.ticker = addTicker('game-stuff', time => {
    container.position.y -= 0.05 + 0.1 * Math.random()

    if (container.position.y < -30) {
      angels = angels.filter(a => a !== container)
      container.ticker.remove = true
      container.destroy()
    }
  })

  bee.parent.addChild(container)
  return container
}
