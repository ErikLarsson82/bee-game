
function createBee(parent, type, startPosition) {
  const bee = new Container()
  
  const { sprite } = animateSprite(bee, 'bee-working-animation', 43, 13, 8)
  const workingSprite = sprite

  const shadow = Sprite.fromImage('images/bee/shadow.png')
  bee.addChild(shadow)

  const droneBody = Sprite.fromImage('images/bee/bee-drone-body.png')
  bee.addChild(droneBody)
  
  const animationSprite = Sprite.fromImage('images/bee/cell-conversion-animation-a.png')
  animationSprite.position.y = -2
  animationSprite.visible = true
  animationSprite.delay = 0
  bee.addChild(animationSprite)
  
  const beeAddon = Sprite.fromImage('images/bee/bee-drone-legs.png')
  beeAddon.position.x = -1
  beeAddon.position.y = -1
  beeAddon.opacity = 1
  bee.addChild(beeAddon)
  const honeyDrop = Sprite.fromImage('images/drops/drop-honey.png')
  honeyDrop.position.x = 2
  honeyDrop.position.y = 6
  bee.addChild(honeyDrop)
  const nectarDrop = Sprite.fromImage('images/drops/drop-nectar.png')
  nectarDrop.position.x = 0
  nectarDrop.position.y = 5
  bee.addChild(nectarDrop)
  const waxDrop = Sprite.fromImage('images/drops/drop-wax.png')
  waxDrop.position.x = -2
  waxDrop.position.y = 5
  bee.addChild(waxDrop)
  const beeExclamation = Sprite.fromImage('images/exclamations/exclamation-warning-severe.png')
  beeExclamation.position.x = 12
  beeExclamation.position.y = -2
  beeExclamation.visible = false
  bee.addChild(beeExclamation)
  makeSelectable(bee, 'bee')
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
  bee.NECTAR_SACK_CAPACITY = 20
  bee.POLLEN_SACK_CAPACITY = 20
  bee.HONEY_SACK_CAPACITY = 10
  bee.WAX_SACK_CAPACITY = 10
  
  bee.age = 0
  bee.setAge = amount => { bee.age = amount; return bee }
  bee.pollenSack = 0
  bee.setPollen = amount => { bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(amount); return bee }
  bee.nectarSack = 0
  bee.setNectar = amount => { bee.nectarSack = cap(0, bee.NECTAR_SACK_CAPACITY)(amount); return bee }
  bee.honeySack = 0
  bee.setHoney = amount => { bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(amount); return bee }
  bee.waxSack = 0
  bee.setWax = amount => { bee.waxSack = cap(0, bee.WAX_SACK_CAPACITY)(amount); return bee }
  bee.type = type || 'unassigned'
  bee.setType = type => { bee.type = type; bee.idle = getIdlePosition(type) }
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
    if (bee.type === 'dead' && bee.hunger === 0) {
      return 'Bee died\nof hunger'
    }
    if (bee.type === 'dead') {
      return 'Bee died\nof old age'
    }
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
    
    const textHeading = new PIXI.Text('BEE', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = contentOffsetX + 30
    textHeading.position.y = contentOffsetY + 3
    container.addChild(textHeading)

    const texts = ['HUNGER', 'HONEY', 'NECTAR', 'WAX', 'POLLEN', 'AGE']

    texts.forEach((text, idx) => {
      const textDescription = new PIXI.Text(text, { ...picoFontConfig, fill: '#8b9bb4' })
      textDescription.scale.set(0.15, 0.15)
      textDescription.position.x = contentOffsetX + 10
      textDescription.position.y = contentOffsetY + 13 + (idx * 7)
      container.addChild(textDescription)
    })

    const helper = new PIXI.Text('Loading...', { ...picoFontConfig, lineHeight: 44 })
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
    const closest = getClosestHex(converterNeedsNectar, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)
    
    return true
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
    bee.pollenSack -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    hex.pollen = cap(0, hex.POLLEN_HEX_CAPACITY)(hex.pollen)
    if (isPollenSackEmpty() || hex.isPollenFull()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function refillPollen() {
    const hex = bee.isAtType('pollen')
    if (!hex) return false
    hex.claimSlot(bee)  
    bee.pollenSack += transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
    bee.pollenSack = cap(0, bee.POLLEN_SACK_CAPACITY)(bee.pollenSack)
    hex.pollen -= transferTo(bee.POLLEN_SACK_CAPACITY).inSeconds(30)
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
    bee.waxSack += transferTo(bee.WAX_SACK_CAPACITY).inSeconds(30)
    bee.wax = cap(0, bee.WAX_SACK_CAPACITY)(bee.waxSack)
    hex.wax -= transferTo(bee.WAX_SACK_CAPACITY).inSeconds(30)
    hex.wax = cap(0, hex.WAX_HEX_CAPACITY)(hex.wax)
    if (isWaxSackFull() || hex.isWaxEmpty()) {
      bee.position.y = hex.position.y - 5
    }
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
    const isAtAnyLarvae = filterHexagon(hexGrid, hex => hex.type === 'brood' && hex.content === 'larvae' && hex.isUnclaimed(bee) && isAt(hex))
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
    bee.flyTo(null)
  }

  function forager() {
    if (ageBee()) return
    if (bee.feedBee()) return
    if (pollinateFlower()) return
    if (depositPollen()) return    
    if (flyToAndDepositNectar()) return
    if (flyToPollenToDeposit()) return    
    if (flyToFlower()) return    
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
    if (season === 'summer') {
      if (depositHoney()) return
      if (flyToHoney()) return
      bee.consumeEnergy()
    } else {
      if (bee.feedBee()) return
    }
    if (refillWax()) return
    if (prepareCell()) return
    if (flyToPrepareCell()) return
    if (flyToWax()) return
    if (convertNectar()) return
    if (flyToConverter()) return
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
    const closest = getClosestHex(converterHex, bee)
    closest.claimSlot(bee)
    bee.flyTo(closest)      
    return true
  }

  function depositHoney() {
    const hex = bee.isAtType('honey')
    if (!hex) return false
    hex.claimSlot(bee)

    hex.honey += transferTo(hex.HONEY_HEX_CAPACITY / 3).inSeconds(5)
    hex.honey = cap(0, hex.HONEY_HEX_CAPACITY)(hex.honey)

    bee.honeySack -= transferTo(bee.HONEY_SACK_CAPACITY).inSeconds(5)
    bee.honeySack = cap(0, bee.HONEY_SACK_CAPACITY)(bee.honeySack)

    if (isHoneySackEmpty() || hex.isHoneyFull()) {
      bee.position.y = hex.position.y - 5
    }
    return true
  }

  function flyToHoney() {
    const honeyHex = filterHexagon(hexGrid, hex => hex.type === 'honey' && hex.isUnclaimed(bee) && !hex.isHoneyFull())
    if (honeyHex.length === 0 || !isHoneySackFull()) return false
    const closest = getClosestHex(honeyHex, bee)
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

  bee.removeTicker = () => bee.ticker.remove = true
  bee.handleAnimations = () => {
    {
      // Specifically conversion animation only
      animationSprite.delay++
      animationSprite.delay = animationSprite.delay < 12 ? animationSprite.delay : 0
      const isConverting = bee.isAtType('converter') && bee.type === 'worker'
      if (isConverting) {
        bee.hideBee()
        animationSprite.visible = true
        animationSprite.texture = animationSprite.delay > 6
          ? Texture.fromImage('images/bee/cell-conversion-animation-a.png')
          : Texture.fromImage('images/bee/cell-conversion-animation-b.png')
        return
      } else {
        animationSprite.visible = false
      }
    }
    // Generic working animation
    const isWorking = bee.isAtType('brood') || bee.isAtType('pollen') || bee.isAtType('prepared') || bee.isAtType('honey') || bee.isAtType('wax') || bee.isAtType('converter') || bee.isAtType('flower')
    workingSprite.visible = isWorking
    isWorking
      ? bee.hideBee()
      : bee.showBee()
  }

  bee.ticker = addTicker('game-stuff', time => {
    bee.setShadowPosition()
    
    bee.handleAnimations()

    const deadPosition = 32
    if (bee.position.y === deadPosition) return

    if (bee.isDead()) {
      bee.texture = Texture.fromImage('images/bee/bee-drone-dead.png')
      honeyDrop.visible = false
      nectarDrop.visible = false
      waxDrop.visible = false
      beeAddon.visible = false
      beeExclamation.visible = false
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

    honeyDrop.visible = isHoneySackFull()
    nectarDrop.visible = isNectarSackFull()
    waxDrop.visible = isWaxSackFull()

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
    if (bee.type === 'idle') idle()
    
    bee.setShadowPosition()
  })

  bees.push(bee)
  parent.addChild(bee)
  return bee
}
