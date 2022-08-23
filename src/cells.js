const generateHitArea = () => 
  new PIXI.Polygon([
      new PIXI.Point(5, 0),
      new PIXI.Point(13, 0),
      new PIXI.Point(18, 5),
      new PIXI.Point(13, 10),
      new PIXI.Point(5, 10),
      new PIXI.Point(0, 5),
  ])

function cellDisabled(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const disabledSprite = Sprite.fromImage('images/hex/states/cell-disabled.png')
  makeHexagon(disabledSprite, x, y, 'disabled')
  disabledSprite.position.x = pixelCoordinate.x
  disabledSprite.position.y = pixelCoordinate.y
  disabledSprite.isDisabled = () => true
  
  parent.addChild(disabledSprite)
  return disabledSprite
}

function cellEmpty(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })

  const backgroundSprite = Sprite.fromImage('images/hex/states/cell-empty-background.png')
  backgroundSprite.position.x = pixelCoordinate.x
  backgroundSprite.position.y = pixelCoordinate.y
  hexBackground.addChild(backgroundSprite)

  const emptySprite = Sprite.fromImage('images/hex/states/cell-empty.png')
  makeSelectable(emptySprite, 'cell')
  makeHexagon(emptySprite, x, y, 'empty')
  emptySprite.hitArea = generateHitArea()
  emptySprite.position.x = pixelCoordinate.x
  emptySprite.position.y = pixelCoordinate.y

  emptySprite.panelLabel = () => false
  emptySprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  emptySprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/prepare-cell.png')
    whiteLine.anchor.set(0, 0.65)
    container.addChild(whiteLine)

    const description = Sprite.fromImage('images/ui/prepare-cell-hover.png')
    description.visible = false
    description.position.x = 95
    description.position.y = -29
    container.addChild(description)

    const buttonText = Sprite.fromImage('images/text/prepare.png')
    buttonText.position.x = 24
    buttonText.position.y = 2
    buttonText.anchor.set(0.5, 0)
    
    const button = Button(44, -29, buttonText, () => replaceSelectedHex('prepared'), () => description.visible = true, () => description.visible = false)
    container.addChild(button)

    return container
  }
  
  parent.addChild(emptySprite)

  return emptySprite
}

function cellPrepared(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })

  const backgroundSprite = Sprite.fromImage('images/hex/states/cell-background.png')
  backgroundSprite.position.x = pixelCoordinate.x - 10
  backgroundSprite.position.y = pixelCoordinate.y - 10
  hexBackground.addChild(backgroundSprite)

  const preparedCellSprite = Sprite.fromImage('images/hex/prepared/cell-prepared-partial1.png')
  makeHexagon(preparedCellSprite, x, y, 'prepared')
  
  const spriteExclamation = Sprite.fromImage('images/exclamations/exclamation-warning-severe.png')
  spriteExclamation.position.x = 14
  spriteExclamation.position.y = -6
  spriteExclamation.visible = false
  preparedCellSprite.addChild(spriteExclamation)

  makeHexagon(preparedCellSprite, x, y, 'prepared')
  makeOccupiable(preparedCellSprite)
  makeSelectable(preparedCellSprite, 'prepared')
  preparedCellSprite.hitArea = generateHitArea()
  preparedCellSprite.position.x = pixelCoordinate.x
  preparedCellSprite.position.y = pixelCoordinate.y
  preparedCellSprite.completeness = 0
  preparedCellSprite.done = false

  preparedCellSprite.instantlyPrepare = () => {
    preparedCellSprite.completeness = 100
  }

  const needsHelp = () => preparedCellSprite.completeness <= 100 && bees.filter(({ type }) => type === 'worker').length === 0
  
  preparedCellSprite.panelLabel = () => false
  preparedCellSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  preparedCellSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const contentHoney = Sprite.fromImage('images/ui/button-large/button-large-content-honey.png')
    const contentBrood = Sprite.fromImage('images/ui/button-large/button-large-content-brood.png')
    const contentPollen = Sprite.fromImage('images/ui/button-large/button-large-content-pollen.png')
    const contentNectar = Sprite.fromImage('images/ui/button-large/button-large-content-nectar.png')
    
    if (preparedCellSprite.done) {
      container.addChild(Button(70, -34, contentHoney, () => replaceSelectedHex('honey'), null, null, 'large'))
      container.addChild(Button(100, -23, contentBrood, () => replaceSelectedHex('brood'), null, null, 'large'))
      container.addChild(Button(70, -12, contentPollen, () => replaceSelectedHex('pollen'), null, null, 'large'))
      container.addChild(Button(100, -1, contentNectar, () => replaceSelectedHex('converter'), null, null, 'large'))
    } else {
      const content = Sprite.fromImage('images/ui/content-prepared.png')
      content.position.x = 72
      content.position.y = -29
      container.addChild(content)

      const text = '  1.Have wax\n\n  2.Have\n  worker bees'
      const helperText = new PIXI.Text(text, { ...picoFontConfig, fill: '#96a5bc' })
      helperText.scale.set(0.15, 0.15)
      helperText.position.x = 80
      helperText.position.y = -6
      container.addChild(helperText)

      container.addChild(ProgressBar(113, -15, 'build', () => preparedCellSprite.completeness, 100))

      const buttonDelete = Button(84, 54, 'Delete', () => {
        replaceHex([x, y], 'empty')
        setSelected(null) 
      })
      container.addChild(buttonDelete)

      addTicker('ui', time => {
        if (needsHelp()) {
          buttonDelete.position.y = 54
          helperText.visible = true
          content.texture = Texture.fromImage('images/ui/content-prepared-help.png')
        } else {
          buttonDelete.position.y = -4
          helperText.visible = false
          content.texture = Texture.fromImage('images/ui/content-prepared.png')
        }
      })
    }
    return container
  }

  addTicker('ui', time => {
    if (preparedCellSprite.done) {
      spriteExclamation.visible = false
      return;
    }
    spriteExclamation.visible = needsHelp()
  })
  addTicker('game-stuff', time => {
    if (preparedCellSprite.completeness >= 100) {
      preparedCellSprite.texture = Texture.fromImage('images/hex/prepared/cell-prepared-complete.png')
      if (selected === preparedCellSprite && !preparedCellSprite.done) setSelected(null)
      preparedCellSprite.done = true
      return
    }

    const partialNumber = Math.ceil(preparedCellSprite.completeness / 100 * 7) + 1
    preparedCellSprite.texture = Texture.fromImage(`images/hex/prepared/cell-prepared-partial${partialNumber}.png`)       
  })
  
  parent.addChild(preparedCellSprite)

  return preparedCellSprite
}

function cellHoney(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const honeySprite = Sprite.fromImage('images/hex/honey/cell-honey-empty.png')
  makeHexagon(honeySprite, x, y, 'honey')
  makeOccupiable(honeySprite)
  makeSelectable(honeySprite, 'honey')
  honeySprite.hitArea = generateHitArea()
  honeySprite.position.x = pixelCoordinate.x
  honeySprite.position.y = pixelCoordinate.y

  honeySprite.HONEY_HEX_CAPACITY = 30
  honeySprite.honey = 0
  honeySprite.setHoney = amount => { honeySprite.honey = cap(0, honeySprite.HONEY_HEX_CAPACITY)(amount); return honeySprite }
  honeySprite.isHoneyFull = () => honeySprite.honey >= honeySprite.HONEY_HEX_CAPACITY
  honeySprite.isHoneyEmpty = () => honeySprite.honey <= 0
  
  addTicker('game-stuff', time => {
    if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.95) {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-full.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.85) {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-a.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.6) {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-b.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.5) {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-c.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.35) {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-d.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.1) {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-e.png')
    } else {
      honeySprite.texture = Texture.fromImage('images/hex/honey/cell-honey-empty.png')
    }
  })

  honeySprite.panelLabel = () => false
  honeySprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  honeySprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-honey-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'honey', () => honeySprite.honey, honeySprite.HONEY_HEX_CAPACITY))

    const textHeading = new PIXI.Text('HONEY HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textBonus = new PIXI.Text('-', { ...picoFontConfig })
    textBonus.scale.set(0.15, 0.15)
    textBonus.position.x = 90
    textBonus.position.y = 100
    container.addChild(textBonus)

    addTicker('ui', () => {
      const buff = honeySprite.bonuses.find(isHoneyBuff)
      textBonus.text = buff ? `Adjacency bonus: +${((buff.modifier - 1) * 100).toFixed(0)}%` : 'No bonuses'
    })

    const textDescription = new PIXI.Text('HONEY', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 90
    textDescription.position.y = -16
    container.addChild(textDescription)

    const notEnoughWarning = new PIXI.Text('NOT ENOUGH HONEY', { ...picoFontConfig, fill: 'white' })
    notEnoughWarning.scale.set(0.15, 0.15)
    notEnoughWarning.position.x = 76
    notEnoughWarning.position.y = 26
    notEnoughWarning.visible = false
    container.addChild(notEnoughWarning)

    const buttonDelete = Button(84, -6, 'Delete', () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      setSelected(null) 
    })
    container.addChild(buttonDelete)

    const button = Button(84, 8, 'Make Wax', () => {
      if (honeySprite.honey >= (honeySprite.HONEY_HEX_CAPACITY * 0.9)) {
        replaceHex([x, y], 'wax')
        setSelected(null) 
      } else {
        notEnoughWarning.visible = true
      }
    })
    container.addChild(button)


    return container
  }

  parent.addChild(honeySprite)
  return honeySprite
}

function cellWax(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const waxSprite = Sprite.fromImage('images/hex/wax/cell-wax-full.png')
  makeHexagon(waxSprite, x, y, 'wax')
  makeOccupiable(waxSprite)
  makeSelectable(waxSprite, 'wax')
  waxSprite.hitArea = generateHitArea()
  waxSprite.position.x = pixelCoordinate.x
  waxSprite.position.y = pixelCoordinate.y

  waxSprite.WAX_HEX_CAPACITY = 130
  waxSprite.wax = 130
  waxSprite.setWax = amount => { waxSprite.wax = cap(0, waxSprite.WAX_HEX_CAPACITY)(amount); return waxSprite }
  waxSprite.isWaxFull = () => waxSprite.wax >= waxSprite.WAX_HEX_CAPACITY
  waxSprite.isWaxEmpty = () => waxSprite.wax <= 0
  
  addTicker('game-stuff', time => {
    
    if (waxSprite.wax <= 0) {
      waxSprite.wax = 1 // this is dirty
      replaceHex([x, y], 'prepared').instantlyPrepare()
    }

    if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.96) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-full.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.72) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-a.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.66 ) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-b.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.5) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-c.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.4) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-d.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.3) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-e.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.1) {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-f.png')
    } else {
      waxSprite.texture = Texture.fromImage('images/hex/wax/cell-wax-empty.png')
    }
  })

  waxSprite.panelLabel = () => false
  waxSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  waxSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-wax-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'wax', () => waxSprite.wax, waxSprite.WAX_HEX_CAPACITY))

    const textHeading = new PIXI.Text('WAX HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('WAX', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 90
    textDescription.position.y = -16
    container.addChild(textDescription)

    const buttonDelete = Button(84, -6, 'Delete', () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      setSelected(null) 
    })
    container.addChild(buttonDelete)

    return container
  }

  parent.addChild(waxSprite)
  return waxSprite
}


function cellConverter(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const converterSprite = Sprite.fromImage('images/hex/nectar/cell-nectar-empty.png')
  makeUpgradeable(converterSprite)
  makeHexagon(converterSprite, x, y, 'converter')
  makeHexDetectable(converterSprite)
  makeOccupiable(converterSprite)
  makeSelectable(converterSprite, 'converter')
  converterSprite.hitArea = generateHitArea()
  converterSprite.position.x = pixelCoordinate.x
  converterSprite.position.y = pixelCoordinate.y
  converterSprite.NECTAR_CAPACITY = 15
  converterSprite.nectar = 0
  converterSprite.setNectar = amount => { converterSprite.nectar = cap(0, converterSprite.NECTAR_CAPACITY)(amount); return converterSprite }
  converterSprite.isNectarFull = () => converterSprite.nectar >= converterSprite.NECTAR_CAPACITY
  converterSprite.isNectarEmpty = () => converterSprite.nectar <= 0
 
  converterSprite.panelLabel = () => false
  converterSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  converterSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-nectar-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'nectar', () => converterSprite.nectar, converterSprite.NECTAR_CAPACITY))

    const textHeading = new PIXI.Text('NECTAR HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('NECTAR', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 86
    textDescription.position.y = -16
    container.addChild(textDescription)

    const buttonDelete = Button(84, -6, 'Delete', () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      setSelected(null) 
    })
    container.addChild(buttonDelete)

    const buttonUpgrade = Button(84, 20, 'Upgrade A', () => converterSprite.addUpgrade('converter-adjacent-feed'))
    container.addChild(buttonUpgrade)

    const upgradesText = new PIXI.Text('-', { ...picoFontConfig })
    upgradesText.scale.set(0.15, 0.15)
    upgradesText.position.x = 90
    upgradesText.position.y = 40
    container.addChild(upgradesText)

    addTicker('ui', () => {
      upgradesText.text = ''
      buttonUpgrade.visible = true
      if (converterSprite.hasUpgrade('converter-adjacent-feed')) {
        upgradesText.text = 'Upgrade A: Adds bonus\nhoney to adjacent\nhoney hexagons\nwhen converting'
        buttonUpgrade.visible = false
      }
    })

    return container
  }

  addTicker('game-stuff', time => {
    if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.9) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-full.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.72) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-a.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.66 ) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-b.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.5) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-c.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.25) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-d.png')
    } else if (converterSprite.nectar > converterSprite.NECTAR_CAPACITY * 0.05) {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-e.png')
    } else {
      converterSprite.texture = Texture.fromImage('images/hex/nectar/cell-nectar-empty.png')
    }
  })
  
  parent.addChild(converterSprite)
  return converterSprite
}


function cellBrood(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const broodSprite = Sprite.fromImage('images/hex/brood/cell-brood-empty.png')
  makeHexagon(broodSprite, x, y, 'brood')
  const disabledSprite = Sprite.fromImage('images/hex/brood/cell-brood-disabled.png')
  disabledSprite.visible = false

  broodSprite.addChild(disabledSprite)

  const broodExclamation = Sprite.fromImage('images/exclamations/exclamation-warning-severe.png')
  broodExclamation.position.x = 14
  broodExclamation.position.y = -6
  broodExclamation.visible = false
  broodSprite.addChild(broodExclamation)

  makeOccupiable(broodSprite)
  makeSelectable(broodSprite, 'brood')
  broodSprite.hitArea = generateHitArea()
  broodSprite.position.x = pixelCoordinate.x
  broodSprite.position.y = pixelCoordinate.y

  broodSprite.paused = false
  
  // Stored in seconds for easy transitions
  broodSprite.lifecycle = 0
  const eggDuration = 30
  const larvaeDuration = 300
  const puppaDuration = 500    
  
  broodSprite.content = 'empty'
  broodSprite.NUTRITION_CAPACITY = 100
  broodSprite.nutrition = null
  broodSprite.CORPSE_DELAY = 60
  broodSprite.corpseCleaned = broodSprite.CORPSE_DELAY
  broodSprite.isOccupiedWithOffspring = () => broodSprite.content !== 'empty'
  broodSprite.setContents = item => {
    // empty -> egg -> (larvae -> puppa) || dead
    broodSprite.content = item
    if (item === 'egg') {
      broodSprite.lifecycle = 0
      broodSprite.nutrition = 50
    }
  }
  broodSprite.kill = () => {
    broodSprite.setContents('dead')
  }
  broodSprite.isWellFed = () => broodSprite.nutrition >= broodSprite.NUTRITION_CAPACITY - 10
  broodSprite.isStarving = () => broodSprite.content === 'larvae' && broodSprite.nutrition < 20
  broodSprite.isDead = () => broodSprite.content === 'dead'
  broodSprite.togglePause = () => {
    broodSprite.paused = !broodSprite.paused
    disabledSprite.visible = broodSprite.paused
  }

  addTicker('game-stuff', time => {
    if (broodSprite.content === 'larvae') {
      if (broodSprite.nutrition > broodSprite.NUTRITION_CAPACITY - 30) {
        broodSprite.texture = Texture.fromImage(`images/hex/brood/cell-brood-${broodSprite.content}-fat.png`)
      } else if (broodSprite.nutrition > broodSprite.NUTRITION_CAPACITY - 60) {
        broodSprite.texture = Texture.fromImage(`images/hex/brood/cell-brood-${broodSprite.content}-medium.png`)
      } else {
        broodSprite.texture = Texture.fromImage(`images/hex/brood/cell-brood-${broodSprite.content}-starving.png`)
      }
    } else {
      broodSprite.texture = Texture.fromImage(`images/hex/brood/cell-brood-${broodSprite.content}.png`)
    }
    
    broodExclamation.visible = broodSprite.isStarving()
    if (!broodSprite.content) return
    if (broodSprite.content === 'empty') return
    if (broodSprite.content === 'dead') {
      if (broodSprite.corpseCleaned <= 0) {
        broodSprite.corpseCleaned = broodSprite.CORPSE_DELAY
        broodSprite.setContents('empty')
      }
      return
    }
    
    if (season === 'winter' && broodSprite.content === 'puppa') {
      // Make sure all puppas will hatch on the first day of summer by speeding up the process in the winter
      broodSprite.lifecycle += transferTo(225).inSeconds(10)
    } else {
      broodSprite.lifecycle += transferTo(225).inSeconds(225)
    }

    // Transitions
    if (broodSprite.lifecycle > eggDuration && broodSprite.content === 'egg') {
      broodSprite.setContents('larvae')      
    } else if (broodSprite.lifecycle > eggDuration + larvaeDuration && broodSprite.content === 'larvae') {
      broodSprite.setContents('puppa')
    } else if (broodSprite.lifecycle > eggDuration + larvaeDuration + puppaDuration && broodSprite.content === 'puppa' && season === 'summer') {
      broodSprite.setContents('empty')
      createBee(beeContainer, 'idle', { x: broodSprite.position.x, y: broodSprite.position.y - 5 })
    }

    // States
    if (broodSprite.content === 'larvae') {
      broodSprite.nutrition -= transferTo(broodSprite.NUTRITION_CAPACITY).inSeconds(90)
      if (broodSprite.nutrition <= 0) {
        broodSprite.setContents('dead')
      }
    }
  })

  broodSprite.panelLabel = () => false
  broodSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  broodSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-brood.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    const textHeading = new PIXI.Text('BROOD HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textState = new PIXI.Text('-', { ...picoFontConfig, fill: '#96a5bc' })
    textState.scale.set(0.15, 0.15)
    textState.position.x = 80
    textState.position.y = -16
    container.addChild(textState)

    const eggLifecycleBar = ProgressBar(113, -6, 'lifecycle', () => broodSprite.lifecycle, eggDuration)
    container.addChild(eggLifecycleBar)

    const larvaeLifecycleBar = ProgressBar(113, -6, 'lifecycle', () => broodSprite.lifecycle - eggDuration, larvaeDuration)
    container.addChild(larvaeLifecycleBar)

    const puppaLifecycleBar = ProgressBar(113, -6, 'lifecycle', () => broodSprite.lifecycle - eggDuration - larvaeDuration, puppaDuration)
    container.addChild(puppaLifecycleBar)

    const nutrientsBar = ProgressBar(113, 3, 'nutrition', () => broodSprite.nutrition, broodSprite.NUTRITION_CAPACITY)
    container.addChild(nutrientsBar)

    const textProgress = new PIXI.Text('Progress', { ...picoFontConfig, fill: '#96a5bc' })
    textProgress.scale.set(0.15, 0.15)
    textProgress.position.x = 80
    textProgress.position.y = -8
    container.addChild(textProgress)

    const textNutrients = new PIXI.Text('Nutrient', { ...picoFontConfig, fill: '#96a5bc' })
    textNutrients.scale.set(0.15, 0.15)
    textNutrients.position.x = 80
    textNutrients.position.y = 1
    textNutrients.visible = false
    container.addChild(textNutrients)

    const paused = new PIXI.Text('-', { ...picoFontConfig })
    paused.scale.set(0.15, 0.15)
    paused.position.x = 82
    paused.position.y = 15 
    container.addChild(paused)

    const helper = new PIXI.Text('Loading...', { ...picoFontConfig })
    helper.scale.set(0.15, 0.15)
    helper.position.x = 82
    helper.position.y = 35
    container.addChild(helper)

    const buttonDelete = Button(84, 80, 'Delete', () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      setSelected(null) 
    })
    container.addChild(buttonDelete)

    const helperText = () => {
      if (broodSprite.content === 'dead') {
        return 'Larvae needs\npollen from\nnurser bees\nto survive'
      }
      if (broodSprite.content === 'puppa' && season === 'winter') {
        return 'Puppa will\nhatch first\nday of summer'
      }
      return ''
    }

    addTicker('ui', () => {
      textState.text = broodSprite.content
      const isDead = broodSprite.content === 'dead'
      const isEmpty = broodSprite.content === 'empty'
      const isEgg = broodSprite.content === 'egg'
      const isLarvae = broodSprite.content === 'larvae'
      const isPuppa = broodSprite.content === 'puppa'
      if (isEmpty || isDead) {
        content.texture = Texture.fromImage('images/ui/content-brood.png')
      } else if (isLarvae) {
        content.texture = Texture.fromImage('images/ui/content-larvae.png')
      } else if (isEgg || isPuppa) {
        content.texture = Texture.fromImage('images/ui/content-egg-puppa.png')
      }
      textProgress.visible = !isEmpty && !isDead
      
      eggLifecycleBar.visible = isEgg
      larvaeLifecycleBar.visible = isLarvae
      puppaLifecycleBar.visible = isPuppa
      
      textNutrients.visible = isLarvae
      nutrientsBar.visible = isLarvae

      paused.text = broodSprite.paused ? 'paused' : 'active'

      helper.text = helperText()
    })


    const button = Button(83, 60, 'Disable', () => broodSprite.togglePause())
    container.addChild(button)
    
    return container
  }

  parent.addChild(broodSprite)
  return broodSprite
}


function cellPollen(x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const pollenSprite = Sprite.fromImage('images/hex/pollen/cell-pollen-empty.png')
  makeHexagon(pollenSprite, x, y, 'pollen')
  makeOccupiable(pollenSprite)
  makeSelectable(pollenSprite, 'pollen')
  pollenSprite.hitArea = generateHitArea()
  pollenSprite.position.x = pixelCoordinate.x
  pollenSprite.position.y = pixelCoordinate.y

  pollenSprite.POLLEN_HEX_CAPACITY = 120
  pollenSprite.pollen = 0
  pollenSprite.setPollen = (pollen) => pollenSprite.pollen = pollen
  pollenSprite.isPollenFull = () => pollenSprite.pollen >= pollenSprite.POLLEN_HEX_CAPACITY
  pollenSprite.isPollenEmpty = () => pollenSprite.pollen <= 0
  
  addTicker('game-stuff', time => {
    if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.95) {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-full.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.8) {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-a.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.6) {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-b.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.5) {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-c.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.3) {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-d.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.1) {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-e.png')
    } else {
      pollenSprite.texture = Texture.fromImage('images/hex/pollen/cell-pollen-empty.png')
    }
  })

  pollenSprite.panelLabel = () => false
  pollenSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  pollenSprite.panelContent = () => {
    const container = new Container()
    
    const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('images/ui/content-pollen-hex.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    container.addChild(ProgressBar(113, -15, 'pollen', () => pollenSprite.pollen, pollenSprite.POLLEN_HEX_CAPACITY))

    const textHeading = new PIXI.Text('POLLEN HEX', { ...picoFontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 90
    textHeading.position.y = -26
    container.addChild(textHeading)

    const textDescription = new PIXI.Text('POLLEN', { ...picoFontConfig, fill: '#96a5bc' })
    textDescription.scale.set(0.15, 0.15)
    textDescription.position.x = 86
    textDescription.position.y = -16
    container.addChild(textDescription)

    const buttonDelete = Button(84, -6, 'Delete', () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      setSelected(null) 
    })
    container.addChild(buttonDelete)

    return container
  }
  
  parent.addChild(pollenSprite)
  return pollenSprite
}
