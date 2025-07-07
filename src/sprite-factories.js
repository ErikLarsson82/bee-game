import { Sprite, Text } from 'pixi.js'
import {
  hoveredCells,
  setHoveredCells,
  gameSpeed,
  flowers,
  hexGrid
} from './game/game-state'
import { addTicker, updateSelected } from './exported-help-functions'
import { secondsToTicks } from './framerate'
import { filterHexagon } from './hex'
import { samePosition } from './pure-help-functions'

export function makeSelectable (sprite, label, shape) {
  const hoverCellSprite = Sprite.fromImage('hover-cell.png')
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
      setHoveredCells(hoveredCells.filter((cell) => cell !== sprite))
    }
  }
  sprite.mousedown = () => updateSelected(sprite)
}

export function makeHexagon (sprite, x, y, type) {
  sprite.type = type
  sprite.index = { x, y }
  sprite.bonuses = []
}

export function makeUpgradeable (sprite) {
  sprite.upgrades = []
  sprite.hasUpgrade = type => sprite.upgrades.includes(type)
  sprite.addUpgrade = type => sprite.upgrades.push(type)
}

export function makeOccupiable (parent) {
  // const text = new Text('debug hex', { fill: 0xffffff, fontSize: '8px' })
  // text.position.set(0, -50)
  // parent.addChild(text)

  parent.slot = [
    { bee: null, counter: null },
    { bee: null, counter: null }
  ]

  const offsets = [
    { x: 0, y: 0 },
    { x: 0, y: -10 }
  ]

  const isEmpty = x => x.counter === null

  parent.setSlots = x => {
    if (x === 1) {
      parent.slot = [
        { bee: null, counter: null }
      ]
      return
    }
    if (x === 2) {
      parent.slot = [
        { bee: null, counter: null },
        { bee: null, counter: null }
      ]
      return
    }
    throw new Error('Unsupported amount')
  }

  parent.isFirstInLine = bee => {
    return parent.slot[0].bee === bee
  }

  parent.getSpotPositionOffset = bee => {
    const isMe = x => x.bee === bee
    const index = parent.slot.findIndex(isMe)
    if (index === -1) throw new Error('Unable to find index - this should not happen')
    return offsets[index]
  }

  parent.isUnclaimed = attemptee => {
    if (!attemptee) {
      console.error('Needs input')
      return
    }
    const isMe = x => x.bee === attemptee
    if (parent.slot.filter(isMe).length > 0) return true
    if (parent.slot.filter(isEmpty).length > 0) return true
    return false
  }

  parent.claimSlot = bee => {
    const isMe = x => x.bee === bee
    const indexMe = parent.slot.findIndex(isMe)
    if (indexMe !== -1) {
      parent.slot[indexMe].bee = bee
      parent.slot[indexMe].counter = secondsToTicks(1)
      return
    }
    const indexFree = parent.slot.findIndex(isEmpty)
    if (indexFree === -1) throw new Error('Unable to find index - this should not happen')
    parent.slot[indexFree].bee = bee
    parent.slot[indexFree].counter = secondsToTicks(1)
  }

  addTicker('game-stuff', time => {
    // if (parent.slot.length === 1) text.text = `1 slot = ${parent.slot[0].bee ? 'bee' : '-'} - ${parent.slot[0].counter}`
    // if (parent.slot.length === 2) text.text = `2 slots = ${parent.slot[0].bee ? 'bee' : '-'} - ${parent.slot[0].counter} | ${parent.slot[1].bee ? 'bee' : '-'} - ${parent.slot[1].counter}`
    parent.slot.forEach((slot, idx) => {
      if (slot.counter === null) return
      parent.slot[idx].counter = parent.slot[idx].counter - gameSpeed
      if (parent.slot[idx].counter <= 0) {
        parent.slot[idx].bee = null
        parent.slot[idx].counter = null
      }
      // Shuffle
      // if (parent.slot.length > 2) throw new Error('this function only supports length 2')
      if (parent.slot.length === 2 && parent.slot[1].bee !== null && parent.slot[0].bee === null) {
        parent.slot[0].bee = parent.slot[1].bee
        parent.slot[0].counter = parent.slot[1].counter
        parent.slot[1].bee = null
        parent.slot[1].counter = null
      }
    })
  })
}

export function makeHexDetectable (bee) {
  bee.isAtType = type => {
    const hexesInGrid = filterHexagon(hexGrid, hex => hex.type === type && samePosition(bee, hex))
    if (hexesInGrid.length > 0) return hexesInGrid[0]

    const flowerResult = flowers.filter(flower => samePosition(bee, flower))
    if (flowerResult.length > 0 && type === 'flower') return flowerResult[0]
    return null
  }
}
