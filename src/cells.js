import { Container, Polygon, Point, Sprite, Text, Texture } from 'pixi.js'
import { bees, hexGrid, day, selected, season } from './game/game-state'
import { toLocalCoordinateFlat, forEachHexagon } from './hex'
import { makeHexagon, makeSelectable, makeOccupiable, makeUpgradeable, makeHexDetectable } from './sprite-factories'
import { replaceSelectedHex, updateSelected, replaceHex, addTicker, transferTo } from './exported-help-functions'
import { cap, isHoneyBuff, isNectarBuff } from './pure-help-functions'
import { hexBackground, beeContainer, hatchContainer } from './game/pixi-elements'
import { fontConfig, smallFont, colors } from './config'
import { Button, ProgressBar, ProgressBar2 } from './ui'
import { createBee } from './bee'
import { animateSprite } from './animate-sprite'

const generateHitArea = () =>
  new Polygon([
    new Point(5, 0),
    new Point(13, 0),
    new Point(18, 5),
    new Point(13, 10),
    new Point(5, 10),
    new Point(0, 5)
  ])

export function cellDisabled (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const disabledSprite = Sprite.fromImage('states/cell-disabled.png')
  makeHexagon(disabledSprite, x, y, 'disabled')
  disabledSprite.position.x = pixelCoordinate.x
  disabledSprite.position.y = pixelCoordinate.y
  disabledSprite.isDisabled = () => true

  parent.addChild(disabledSprite)
  return disabledSprite
}

export function cellBlocked (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const blockedSprite = Sprite.fromImage('states/cell-blocked.png')
  makeHexagon(blockedSprite, x, y, 'blocked')
  blockedSprite.position.x = pixelCoordinate.x
  blockedSprite.position.y = pixelCoordinate.y

  parent.addChild(blockedSprite)
  return blockedSprite
}

export function cellEmpty (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })

  const backgroundSprite = Sprite.fromImage('states/cell-empty-background.png')
  backgroundSprite.position.x = pixelCoordinate.x
  backgroundSprite.position.y = pixelCoordinate.y
  hexBackground.addChild(backgroundSprite)

  const emptySprite = Sprite.fromImage('states/cell-empty.png')
  makeSelectable(emptySprite, 'cell', 'hex')
  makeHexagon(emptySprite, x, y, 'empty')
  emptySprite.hitArea = generateHitArea()
  emptySprite.position.x = pixelCoordinate.x
  emptySprite.position.y = pixelCoordinate.y

  emptySprite.panelLabel = () => false
  emptySprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  emptySprite.panelContent = () => {
    const container = new Container()

    const contentPrepare = Sprite.fromImage('button-large/button-large-content-prepare.png')

    container.addChild(Button(-19, -34, contentPrepare, () => {
      replaceSelectedHex('prepared')
      updateSelected(null)
    }, null, null, 'large'))

    return container
  }

  parent.addChild(emptySprite)

  return emptySprite
}

function cellPrepared (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })

  const backgroundSprite = Sprite.fromImage('states/cell-background.png')
  backgroundSprite.position.x = pixelCoordinate.x - 10
  backgroundSprite.position.y = pixelCoordinate.y - 10
  hexBackground.addChild(backgroundSprite)

  const preparedCellSprite = Sprite.fromImage('prepared/cell-prepared-partial1.png')
  makeHexagon(preparedCellSprite, x, y, 'prepared')

  const spriteExclamation = Sprite.fromImage('exclamation-warning-mild.png')
  spriteExclamation.position.x = 14
  spriteExclamation.position.y = -6
  spriteExclamation.visible = false
  preparedCellSprite.addChild(spriteExclamation)

  makeHexagon(preparedCellSprite, x, y, 'prepared')
  makeOccupiable(preparedCellSprite)
  makeSelectable(preparedCellSprite, 'prepared', 'hex')
  preparedCellSprite.hitArea = generateHitArea()
  preparedCellSprite.position.x = pixelCoordinate.x
  preparedCellSprite.position.y = pixelCoordinate.y
  preparedCellSprite.completeness = 0
  preparedCellSprite.done = false

  preparedCellSprite.instantlyPrepare = () => {
    preparedCellSprite.completeness = 100
  }

  const prepareWarning = () => {
    const waxInBeesHandsFound = bees.filter(({ type }) => type === 'worker').filter(bee => !bee.isWaxSackEmpty()).length > 0
    const isAnyWorkers = bees.filter(({ type }) => type === 'worker').length > 0

    let waxInHexagonsFound = false
    forEachHexagon(hexGrid, hex => {
      if (hex.type === 'wax' && !hex.isWaxEmpty()) waxInHexagonsFound = true
    })

    return (waxInHexagonsFound || waxInBeesHandsFound) && isAnyWorkers
  }

  const needsHelp = () => preparedCellSprite.completeness <= 100 && !prepareWarning()

  preparedCellSprite.panelLabel = () => false
  preparedCellSprite.panelPosition = () => ({ x: pixelCoordinate.x - (preparedCellSprite.done ? 0 : 50), y: pixelCoordinate.y })

  preparedCellSprite.panelContent = () => {
    const container = new Container()

    if (preparedCellSprite.done) {
      const contentHoney = Sprite.fromImage('button-large/button-large-content-honey.png')
      const contentBrood = Sprite.fromImage('button-large/button-large-content-brood.png')
      const contentPollen = Sprite.fromImage('button-large/button-large-content-pollen.png')
      const contentNectar = Sprite.fromImage('button-large/button-large-content-nectar.png')

      container.addChild(Button(-11, -28, contentHoney, () => {
        replaceSelectedHex('honey')
        updateSelected(null)
      }, null, null, 'large'))
      container.addChild(Button(18, -17, contentNectar, () => {
        replaceSelectedHex('nectar')
        updateSelected(null)
      }, null, null, 'large'))
      container.addChild(Button(18, 5, contentPollen, () => {
        replaceSelectedHex('pollen')
        updateSelected(null)
      }, null, null, 'large'))
      container.addChild(Button(-11, 16, contentBrood, () => {
        replaceSelectedHex('brood')
        updateSelected(null)
      }, null, null, 'large'))
    } else {
      const content = Sprite.fromImage('content-prepared.png')
      content.position.x = 72
      content.position.y = -29
      container.addChild(content)

      const text = '  1.Have wax\n\n  2.Have\n  worker bees'
      const helperText = new Text(text, { ...fontConfig, fill: '#96a5bc' })
      helperText.scale.set(0.15, 0.15)
      helperText.position.x = 80
      helperText.position.y = -6
      container.addChild(helperText)

      container.addChild(ProgressBar(113, -15, 'build', () => preparedCellSprite.completeness, 100))

      const buttonDelete = Button(84, 54, 'Delete', () => {
        replaceHex([x, y], 'empty')
        updateSelected(null)
      })
      container.addChild(buttonDelete)

      addTicker('ui', time => {
        if (needsHelp()) {
          buttonDelete.position.y = 54
          helperText.visible = true
          content.texture = Texture.fromImage('content-prepared-help.png')
        } else {
          buttonDelete.position.y = -4
          helperText.visible = false
          content.texture = Texture.fromImage('content-prepared.png')
        }
      })
    }
    return container
  }

  addTicker('ui', time => {
    if (preparedCellSprite.done) {
      spriteExclamation.visible = false
      return
    }
    spriteExclamation.visible = needsHelp()
  })
  addTicker('game-stuff', time => {
    if (preparedCellSprite.completeness >= 100) {
      preparedCellSprite.texture = Texture.fromImage('prepared/cell-prepared-complete.png')
      if (selected === preparedCellSprite && !preparedCellSprite.done) updateSelected(null)
      preparedCellSprite.done = true
      return
    }

    const partialNumber = Math.ceil(preparedCellSprite.completeness / 100 * 7) + 1
    preparedCellSprite.texture = Texture.fromImage(`prepared/cell-prepared-partial${partialNumber}.png`)
  })

  parent.addChild(preparedCellSprite)

  return preparedCellSprite
}

function cellExperiment1 (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const experimentOneSprite = Sprite.fromImage('bread/cell-bee-bread.png')
  makeHexagon(experimentOneSprite, x, y, 'experiment-1')
  experimentOneSprite.position.x = pixelCoordinate.x
  experimentOneSprite.position.y = pixelCoordinate.y

  experimentOneSprite.boostAmount = 3
  experimentOneSprite.hasBoostLeft = () => experimentOneSprite.boostAmount > 0
  experimentOneSprite.consumeOneBoost = () => {
    experimentOneSprite.boostAmount -= 1
    if (!experimentOneSprite.hasBoostLeft()) {
      replaceHex([x, y], 'pollen')
    }
  }

  parent.addChild(experimentOneSprite)
  return experimentOneSprite
}

function cellHoney (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const honeySprite = Sprite.fromImage('honey/cell-honey-empty.png')
  makeHexagon(honeySprite, x, y, 'honey')
  makeOccupiable(honeySprite)
  makeSelectable(honeySprite, 'honey', 'hex')
  honeySprite.hitArea = generateHitArea()
  honeySprite.position.x = pixelCoordinate.x
  honeySprite.position.y = pixelCoordinate.y

  honeySprite.HONEY_HEX_CAPACITY_BASELINE = 30
  honeySprite.HONEY_HEX_CAPACITY = 30
  honeySprite.honey = 0
  honeySprite.setHoney = amount => { honeySprite.honey = cap(0, honeySprite.HONEY_HEX_CAPACITY)(amount); return honeySprite }
  honeySprite.isHoneyFull = () => honeySprite.honey >= honeySprite.HONEY_HEX_CAPACITY
  honeySprite.isHoneyEmpty = () => honeySprite.honey <= 0

  addTicker('game-stuff', time => {
    if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.95) {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-full.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.85) {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-a.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.6) {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-b.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.5) {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-c.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.35) {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-d.png')
    } else if (honeySprite.honey > honeySprite.HONEY_HEX_CAPACITY * 0.1) {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-e.png')
    } else {
      honeySprite.texture = Texture.fromImage('honey/cell-honey-empty.png')
    }
  })

  honeySprite.panelLabel = () => false
  honeySprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  honeySprite.panelContent = () => {
    const container = new Container()

    const content = Sprite.fromImage('content-honey.png')
    content.position.x = -24
    content.position.y = -37
    container.addChild(content)

    container.addChild(ProgressBar2(-20, -26, 'honey', () => honeySprite.honey, honeySprite.HONEY_HEX_CAPACITY))

    const textContent = new Text('-', { ...fontConfig })
    textContent.scale.set(0.15, 0.15)
    textContent.position.x = 13
    textContent.position.y = -33
    container.addChild(textContent)

    const textBonus = new Text('-', { ...fontConfig })
    textBonus.scale.set(0.15, 0.15)
    textBonus.position.x = -22
    textBonus.position.y = -46
    container.addChild(textBonus)

    addTicker('ui', () => {
      textContent.text = Math.round(honeySprite.honey)
      textContent.position.x = Math.round(honeySprite.honey) > 9 ? 9 : 13

      const buff = honeySprite.bonuses.find(isHoneyBuff)
      textBonus.text = buff ? `Adjacency bonus: +${((buff.modifier - 1) * 100).toFixed(0)}%` : 'No bonuses'
    })

    const notEnoughWarning = new Text('NOT ENOUGH HONEY', { ...fontConfig, fill: 'white' })
    notEnoughWarning.scale.set(0.15, 0.15)
    notEnoughWarning.position.x = 76
    notEnoughWarning.position.y = 26
    notEnoughWarning.visible = false
    container.addChild(notEnoughWarning)

    const buttonDelete = Button(-20, 11, Sprite.fromImage('button-large/button-large-content-delete.png'), () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonDelete)

    const button = Button(9, 0, Sprite.fromImage('button-large/button-large-content-wax.png'), () => {
      if (honeySprite.honey >= (honeySprite.HONEY_HEX_CAPACITY * 0.9)) {
        replaceHex([x, y], 'wax')
        updateSelected(null)
      } else {
        notEnoughWarning.visible = true
      }
    }, null, null, 'large')
    container.addChild(button)

    return container
  }

  parent.addChild(honeySprite)
  return honeySprite
}

function cellWax (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const waxSprite = Sprite.fromImage('wax/cell-wax-full.png')
  makeHexagon(waxSprite, x, y, 'wax')
  makeOccupiable(waxSprite)
  makeSelectable(waxSprite, 'wax', 'hex')
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
      waxSprite.wax = 1
      replaceHex([x, y], 'honey').honey = 0
    }

    if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.96) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-full.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.72) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-a.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.66) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-b.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.5) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-c.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.4) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-d.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.3) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-e.png')
    } else if (waxSprite.wax > waxSprite.WAX_HEX_CAPACITY * 0.1) {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-f.png')
    } else {
      waxSprite.texture = Texture.fromImage('wax/cell-wax-empty.png')
    }
  })

  waxSprite.panelLabel = () => false
  waxSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  waxSprite.panelContent = () => {
    const container = new Container()

    const content = Sprite.fromImage('content-wax.png')
    content.position.x = -24
    content.position.y = -37
    container.addChild(content)

    container.addChild(ProgressBar2(-20, -26, 'wax', () => waxSprite.wax, waxSprite.WAX_HEX_CAPACITY))

    const buttonDelete = Button(-20, 11, Sprite.fromImage('button-large/button-large-content-delete.png'), () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonDelete)

    return container
  }

  parent.addChild(waxSprite)
  return waxSprite
}

export function cellNectar (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const nectarSprite = Sprite.fromImage('nectar/cell-nectar-empty.png')
  makeUpgradeable(nectarSprite)
  makeHexagon(nectarSprite, x, y, 'nectar')
  makeHexDetectable(nectarSprite)
  makeOccupiable(nectarSprite)
  makeSelectable(nectarSprite, 'nectar', 'hex')
  nectarSprite.hitArea = generateHitArea()
  nectarSprite.position.x = pixelCoordinate.x
  nectarSprite.position.y = pixelCoordinate.y
  nectarSprite.NECTAR_CAPACITY_BASELINE = 15
  nectarSprite.NECTAR_CAPACITY = 15
  nectarSprite.nectar = 0
  nectarSprite.setNectar = amount => { nectarSprite.nectar = cap(0, nectarSprite.NECTAR_CAPACITY)(amount); return nectarSprite }
  nectarSprite.isNectarFull = () => nectarSprite.nectar >= nectarSprite.NECTAR_CAPACITY
  nectarSprite.isNectarEmpty = () => nectarSprite.nectar <= 0

  nectarSprite.panelLabel = () => false
  nectarSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  nectarSprite.panelContent = () => {
    const container = new Container()

    const content = Sprite.fromImage('content-nectar.png')
    content.position.x = -24
    content.position.y = -37
    container.addChild(content)

    container.addChild(ProgressBar2(-20, -26, 'nectar', () => nectarSprite.nectar, nectarSprite.NECTAR_CAPACITY))

    const buttonDelete = Button(-20, 11, Sprite.fromImage('button-large/button-large-content-delete.png'), () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonDelete)

    const buttonUpgrade = Button(9, 0, Sprite.fromImage('button-large/button-large-content-upgrade-a.png'), () => {
      nectarSprite.addUpgrade('converter-adjacent-feed')
    }, null, null, 'large')
    container.addChild(buttonUpgrade)

    const upgradesText = new Text('-', { ...fontConfig })
    upgradesText.scale.set(0.15, 0.15)
    upgradesText.position.x = 22
    upgradesText.position.y = -4
    container.addChild(upgradesText)

    const textContent = new Text('-', { ...fontConfig })
    textContent.scale.set(0.15, 0.15)
    textContent.position.x = 13
    textContent.position.y = -33
    container.addChild(textContent)

    const textBonus = new Text('-', { ...fontConfig })
    textBonus.scale.set(0.15, 0.15)
    textBonus.position.x = -22
    textBonus.position.y = -46
    container.addChild(textBonus)

    addTicker('ui', () => {
      textContent.text = Math.round(nectarSprite.nectar)
      textContent.position.x = Math.round(nectarSprite.nectar) > 9 ? 9 : 13

      const buff = nectarSprite.bonuses.find(isNectarBuff)
      textBonus.text = buff ? `Adjacency bonus: +${((buff.modifier - 1) * 100).toFixed(0)}%` : 'No bonuses'

      upgradesText.text = ''
      buttonUpgrade.visible = true
      if (nectarSprite.hasUpgrade('converter-adjacent-feed')) {
        upgradesText.text = 'Upgrade A: Adds bonus\nhoney to adjacent\nhoney hexagons\nwhen converting'
        buttonUpgrade.visible = false
      }
    })

    return container
  }

  addTicker('game-stuff', time => {
    if (season === 'winter') {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-ice.png')
      return
    }
    if (nectarSprite.nectar > nectarSprite.NECTAR_CAPACITY * 0.9) {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-full.png')
    } else if (nectarSprite.nectar > nectarSprite.NECTAR_CAPACITY * 0.72) {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-a.png')
    } else if (nectarSprite.nectar > nectarSprite.NECTAR_CAPACITY * 0.66) {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-b.png')
    } else if (nectarSprite.nectar > nectarSprite.NECTAR_CAPACITY * 0.5) {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-c.png')
    } else if (nectarSprite.nectar > nectarSprite.NECTAR_CAPACITY * 0.25) {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-d.png')
    } else if (nectarSprite.nectar > nectarSprite.NECTAR_CAPACITY * 0.05) {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-e.png')
    } else {
      nectarSprite.texture = Texture.fromImage('nectar/cell-nectar-empty.png')
    }
  })

  parent.addChild(nectarSprite)
  return nectarSprite
}

export function cellBrood (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const broodSprite = Sprite.fromImage('brood/cell-brood-empty.png')
  makeHexagon(broodSprite, x, y, 'brood')
  const disabledSprite = Sprite.fromImage('brood/cell-brood-disabled.png')
  disabledSprite.visible = false

  broodSprite.addChild(disabledSprite)

  const broodExclamation = Sprite.fromImage('exclamation-warning-severe.png')
  broodExclamation.position.x = 14
  broodExclamation.position.y = -6
  broodExclamation.visible = false
  broodSprite.addChild(broodExclamation)

  makeOccupiable(broodSprite)
  makeSelectable(broodSprite, 'brood', 'hex')
  broodSprite.hitArea = generateHitArea()
  broodSprite.position.x = pixelCoordinate.x
  broodSprite.position.y = pixelCoordinate.y

  const hatchingCompleteCallback = () => {
    broodSprite.setContents('empty')
    createBee(beeContainer, 'idle', { x: broodSprite.position.x, y: broodSprite.position.y - 12 })
    hatchingAnimation.pause()
  }
  const hatchingAnimation = animateSprite(hatchContainer, 'hex/hatching.png', 35, 19, 24, false, hatchingCompleteCallback, false)
  hatchingAnimation.pause()
  hatchingAnimation.sprite.position.x = pixelCoordinate.x
  hatchingAnimation.sprite.position.y = pixelCoordinate.y - 11
  hatchingAnimation.sprite.visible = true

  broodSprite.paused = false

  // Stored in seconds for easy transitions
  broodSprite.lifecycle = 0
  const eggDuration = 30
  const larvaeDuration = 300
  const puppaDuration = 540

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
        broodSprite.texture = Texture.fromImage(`brood/cell-brood-${broodSprite.content}-fat.png`)
      } else if (broodSprite.nutrition > broodSprite.NUTRITION_CAPACITY - 60) {
        broodSprite.texture = Texture.fromImage(`brood/cell-brood-${broodSprite.content}-medium.png`)
      } else {
        broodSprite.texture = Texture.fromImage(`brood/cell-brood-${broodSprite.content}-starving.png`)
      }
    } else {
      broodSprite.texture = Texture.fromImage(`brood/cell-brood-${broodSprite.content}.png`)
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
    } else if (broodSprite.lifecycle > eggDuration + larvaeDuration + puppaDuration && broodSprite.content === 'puppa' && season === 'summer' && day === 1 && !hatchingAnimation.isRunning()) {
      hatchingAnimation.restart()
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

    const content = Sprite.fromImage('content-brood-empty.png')
    content.position.x = -24
    content.position.y = -54
    container.addChild(content)

    const emptyText = new Text('NO EGG', { ...fontConfig, ...smallFont, fill: colors.darkPink })
    emptyText.position.x = -20
    emptyText.position.y = -26
    container.addChild(emptyText)

    const eggLifecycleBar = ProgressBar2(-20, -26, 'brood', () => broodSprite.lifecycle, eggDuration)
    container.addChild(eggLifecycleBar)

    const larvaLifecycleBar = ProgressBar2(-20, -43, 'brood', () => broodSprite.lifecycle - eggDuration, larvaeDuration)
    container.addChild(larvaLifecycleBar)

    const larvaDeadProgress = ProgressBar2(-20, -43, 'brood-dead', () => broodSprite.lifecycle - eggDuration, larvaeDuration)
    container.addChild(larvaDeadProgress)

    const puppaLifecycleBar = ProgressBar2(-20, -26, 'brood', () => broodSprite.lifecycle - eggDuration - larvaeDuration, puppaDuration)
    container.addChild(puppaLifecycleBar)

    const nutrientsBar = ProgressBar2(-20, -26, 'pollen', () => broodSprite.nutrition, broodSprite.NUTRITION_CAPACITY)
    container.addChild(nutrientsBar)

    const buttonDelete = Button(-20, 11, Sprite.fromImage('button-large/button-large-content-delete.png'), () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonDelete)

    addTicker('ui', () => {
      const isDead = broodSprite.content === 'dead'
      const isEmpty = broodSprite.content === 'empty'
      const isEgg = broodSprite.content === 'egg'
      const isLarva = broodSprite.content === 'larvae'
      const isPuppa = broodSprite.content === 'puppa'

      buttonDelete.visible = !isDead
      emptyText.visible = isEmpty
      eggLifecycleBar.visible = isEgg
      larvaLifecycleBar.visible = isLarva
      larvaDeadProgress.visible = isDead
      nutrientsBar.visible = isLarva || isDead
      puppaLifecycleBar.visible = isPuppa

      if (isEmpty) {
        content.texture = Texture.fromImage('content-brood-empty.png')
        if (broodSprite.paused) {
          emptyText.text = 'PAUSED'
          emptyText.style.fill = colors.orange
        } else {
          emptyText.text = 'NO EGG'
          emptyText.style.fill = colors.darkPink
        }
      } else if (isEgg) {
        content.texture = Texture.fromImage('content-brood-egg.png')
      } else if (isDead) {
        content.texture = Texture.fromImage('content-brood-dead.png')
      } else if (isLarva) {
        content.texture = Texture.fromImage('content-brood-larva.png')
      } else if (isPuppa) {
        content.texture = Texture.fromImage('content-brood-puppa.png')
      }
    })

    const button = Button(9, 0, Sprite.fromImage('button-large/button-large-content-toggle.png'), broodSprite.togglePause, null, null, 'large')
    container.addChild(button)

    return container
  }

  parent.addChild(broodSprite)
  return broodSprite
}

export function cellPollen (x, y, parent) {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const pollenSprite = Sprite.fromImage('pollen/cell-pollen-empty.png')
  makeUpgradeable(pollenSprite)
  makeHexagon(pollenSprite, x, y, 'pollen')
  makeOccupiable(pollenSprite)
  makeSelectable(pollenSprite, 'pollen', 'hex')
  pollenSprite.hitArea = generateHitArea()
  pollenSprite.position.x = pixelCoordinate.x
  pollenSprite.position.y = pixelCoordinate.y

  pollenSprite.POLLEN_HEX_CAPACITY = 120
  pollenSprite.pollen = 0
  pollenSprite.setPollen = (pollen) => (pollenSprite.pollen = pollen)
  pollenSprite.isPollenFull = () => pollenSprite.pollen >= pollenSprite.POLLEN_HEX_CAPACITY
  pollenSprite.isPollenEmpty = () => pollenSprite.pollen <= 0

  addTicker('game-stuff', time => {
    if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.95) {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-full.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.8) {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-a.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.6) {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-b.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.5) {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-c.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.3) {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-d.png')
    } else if (pollenSprite.pollen > pollenSprite.POLLEN_HEX_CAPACITY * 0.1) {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-e.png')
    } else {
      pollenSprite.texture = Texture.fromImage('pollen/cell-pollen-empty.png')
    }
  })

  pollenSprite.panelLabel = () => false
  pollenSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  pollenSprite.panelContent = () => {
    const container = new Container()

    const content = Sprite.fromImage('content-pollen.png')
    content.position.x = -24
    content.position.y = -37
    container.addChild(content)

    container.addChild(ProgressBar2(-20, -26, 'pollen', () => pollenSprite.pollen, pollenSprite.POLLEN_HEX_CAPACITY))

    const buttonDelete = Button(-20, 11, Sprite.fromImage('button-large/button-large-content-delete.png'), () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonDelete)

    const buttonUpgrade = Button(9, 0, Sprite.fromImage('button-large/button-large-content-upgrade-b.png'), () => {
      replaceHex([x, y], 'experiment-1')
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonUpgrade)

    /*
    const buttonUpgrade2 = Button(-49, 0, Sprite.fromImage('button-large/button-large-content-forager-resting-place.png'), () => {
      replaceHex([x, y], 'forager-resting-place')
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonUpgrade2)
    */

    const upgradesText = new Text('-', { ...fontConfig })
    upgradesText.scale.set(0.15, 0.15)
    upgradesText.position.x = 22
    upgradesText.position.y = -4
    container.addChild(upgradesText)

    addTicker('ui', () => {
      upgradesText.text = ''
      buttonUpgrade.visible = true
      if (pollenSprite.hasUpgrade('pollen-feeder')) {
        upgradesText.text = 'Upgrade B: Eat surplus\npollen as food.\nCan never be filled.'
        buttonUpgrade.visible = false
      }
    })

    return container
  }

  parent.addChild(pollenSprite)
  return pollenSprite
}

const cellForagerRestingPlace = (x, y, parent) => {
  const pixelCoordinate = toLocalCoordinateFlat({ x, y })
  const restingSprite = Sprite.fromImage('forager-resting-place.png')
  makeHexagon(restingSprite, x, y, 'forager-resting-place')
  makeOccupiable(restingSprite)
  makeSelectable(restingSprite, 'forager-resting-place', 'hex')
  restingSprite.hitArea = generateHitArea()
  restingSprite.position.x = pixelCoordinate.x
  restingSprite.position.y = pixelCoordinate.y

  restingSprite.panelLabel = () => false
  restingSprite.panelPosition = () => ({ x: pixelCoordinate.x + 8, y: pixelCoordinate.y + 5 })

  restingSprite.panelContent = () => {
    const container = new Container()

    const text = new Text('Forager resting place', { ...fontConfig, fill: colors.yellow })
    text.scale.set(0.15, 0.15)
    text.position.x = -30
    text.position.y = -14
    container.addChild(text)

    const buttonDelete = Button(-20, 11, Sprite.fromImage('button-large/button-large-content-delete.png'), () => {
      replaceHex([x, y], 'prepared').instantlyPrepare()
      updateSelected(null)
    }, null, null, 'large')
    container.addChild(buttonDelete)

    return container
  }

  parent.addChild(restingSprite)
  return restingSprite
}

export const nameToFunction = (input) => {
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
