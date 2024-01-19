import { Texture, Sprite } from 'pixi.js'
import {
  gameSpeed,
  paused,
  hexGrid,
  tickers,
  setSelected,
  setTickers,
  currentCycle,
  season,
  setAngelBubbleTimer,
  bees
} from './game/game-state'
import { fontConfig } from './config'
import { fps } from './framerate'
import { panel, gameSpeedIcon, pauseFrame } from './game/pixi-elements'
import { forEachHexagon } from './hex'

// These are dirty fuckers

export function toGameTick (seconds) {
  return seconds * fps
}

export function fromSeconds (gameTicks) {
  return gameTicks / 144
}

export function rate (capacity, seconds) {
  return (capacity / (seconds * fps)) * gameSpeed
}

export function transferTo (capacity) {
  return {
    inSeconds: (seconds) => rate(capacity, seconds),
    inMinutes: (minutes) => {
      const seconds = minutes * 60
      return rate(capacity, seconds)
    }
  }
}

export function isGameOver (aliveBees) {
  if (aliveBees.length === 0) return true
  return false
}

export function addTicker (type, func) {
  const id = generateRandomId()
  const tickerObject = {
    id,
    type,
    func,
    remove: false
  }
  setTickers(tickers.concat(tickerObject))
  return tickerObject
}

function generateRandomId () {
  const chars = 'abcdefghijklmnopqrstuvx'
  let str = ''
  for (let i = 0; i < 20; i++) {
    str += chars[Math.floor(Math.random() * (chars.length - 1))]
  }
  return str + '_' + Math.random()
}

export function updateTotals (valueLabel, capacityLabel, type, funcA, funcB) {
  return (time) => {
    let value = 0
    let capacity = 0
    forEachHexagon(hexGrid, (hex) => {
      if (hex.type === type) {
        value += funcA(hex)
        capacity += funcB(hex)
      }
    })
    valueLabel.text = value.toFixed(0)
    capacityLabel.text = capacity.toFixed(0)
  }
}

export function updateGameSpeedText () {
  if (paused) {
    gameSpeedIcon.texture = Texture.fromImage('images/ui/gamespeed0.png')
  } else {
    gameSpeedIcon.texture = Texture.fromImage(
      'images/ui/gamespeed' + gameSpeed + '.png'
    )
  }
  pauseFrame.visible = paused
}

export function updateSelected (item) {
  // start with cleanup of panel
  panel.removeChildren()

  setAngelBubbleTimer(0)
  setSelected(item || null)

  if (!item) {
    return
  }

  panel.addChild(item.panelContent())

  if (item.label && !(item.panelLabel && item.panelLabel() !== true)) {
    const panelText = new Text(item.label, { ...fontConfig })
    panelText.position.x = 6
    panelText.position.y = 2
    panel.addChild(panelText)
  }
}

export function addJobsButtons (jobsPanel) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const button = new Sprite()
      const textureA = Texture.fromImage(
        j === 0
          ? 'images/ui/button-jobs/button-plus.png'
          : 'images/ui/button-jobs/button-minus.png'
      )
      const textureB = Texture.fromImage(
        j === 0
          ? 'images/ui/button-jobs/button-active-plus.png'
          : 'images/ui/button-jobs/button-active-minus.png'
      )
      const textureC = Texture.fromImage(
        j === 0
          ? 'images/ui/button-jobs/button-hover-plus.png'
          : 'images/ui/button-jobs/button-hover-minus.png'
      )
      button.texture = textureA

      button.position.x = 76
      button.position.y = 36 + i * 38 + j * 10
      button.interactive = true
      button.buttonMode = true
      const idx = ['forager', 'nurser', 'worker']
      const type = idx[i]
      const action = j === 0 ? 'add' : 'remove'
      button.mouseover = () => {
        button.texture = textureC
      }
      button.mouseout = () => {
        button.texture = textureA
      }
      button.mouseup = () => {
        jobs(action, type)
        button.texture = textureA
      }
      button.mousedown = () => {
        button.texture = textureB
      }
      jobsPanel.addChild(button)
    }
  }
}

export function isDayBeforeWinter () {
  return currentCycle === 1 && season === 'summer'
}

const isIdle = (b) => b.type === 'idle'

export function jobs (addOrRemove, type) {
  const aliveBees = bees.filter((bee) => !bee.isDead() && !bee.isDying())
  const availableBees = aliveBees.filter(
    addOrRemove === 'add' ? isIdle : (x) => x.type === type
  )

  if (availableBees.length > 0) {
    availableBees[0].setType(addOrRemove === 'add' ? type : 'idle')
  }
}
