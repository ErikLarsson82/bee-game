import { Text, Sprite, Container } from 'pixi.js'
import { makeSelectable, makeHexDetectable } from '../sprite-factories'
import { makeFlyable } from '../bee-factories'
import { addTicker, transferTo, goIdle } from '../exported-help-functions'
import { filterHexagon } from '../hex'
import { season, gameSpeed, hexGrid } from '../game/game-state'
import { setQueen } from '../game/pixi-elements'
import { fontConfig, speeds } from '../config'

export function createQueen (parent) {
  const queenSprite = Sprite.fromImage('bee-queen.png')

  makeSelectable(queenSprite, 'queen', 'round')
  queenSprite.type = 'queen'

  const queenWingAddon = Sprite.fromImage('bee-queen-wings-flapped.png')
  queenWingAddon.visible = false
  queenSprite.addChild(queenWingAddon)

  const queenLegAddon = Sprite.fromImage('bee-queen-legs-jerk.png')
  queenLegAddon.visible = false
  queenSprite.addChild(queenLegAddon)

  queenSprite.idle = {
    x: 146,
    y: 34
  }
  goIdle(queenSprite)
  queenSprite.animationTicker = Math.random() * 100
  queenSprite.delay = 0

  makeFlyable(queenSprite)
  makeHexDetectable(queenSprite)

  queenSprite.setShadowPosition = () => {}
  queenSprite.isOverburdened = () => false
  queenSprite.isBoosted = () => false

  const helperText = () => {
    if (season === 'winter') return 'Does not\nlay eggs\nin winter'
    if (queenSprite.isAtType('brood')) return 'Laying egg'
    if (!queenSprite.isMoving()) return 'Cannot find\nempty brood\nhexagon to\nlay eggs in'
    return '-'
  }

  queenSprite.panelLabel = () => false
  queenSprite.panelPosition = () => ({ x: queenSprite.position.x + 8, y: queenSprite.position.y + 5 })

  queenSprite.panelContent = () => {
    const container = new Container()

    const whiteLine = Sprite.fromImage('white-description-line.png')
    whiteLine.position.x = 0
    whiteLine.position.y = -30
    container.addChild(whiteLine)

    const content = Sprite.fromImage('content-queen.png')
    content.position.x = 72
    content.position.y = -29
    container.addChild(content)

    const textHeading = new Text('QUEEN', { ...fontConfig })
    textHeading.scale.set(0.15, 0.15)
    textHeading.position.x = 100
    textHeading.position.y = -26
    container.addChild(textHeading)

    const helper = new Text('Loading...', { ...fontConfig })
    helper.scale.set(0.15, 0.15)
    helper.position.x = 82
    helper.position.y = -14
    container.addChild(helper)

    addTicker('ui', () => (helper.text = helperText()))

    return container
  }

  addTicker('game-stuff', time => {
    queenSprite.animationTicker += speeds[gameSpeed]

    const targetBrood = queenSprite.isAtType('brood')

    queenWingAddon.visible = (queenSprite.vx !== 0 || queenSprite.vy !== 0) && Math.sin(queenSprite.animationTicker) > 0
    queenLegAddon.visible = (queenSprite.vx === 0 && queenSprite.vy === 0 && targetBrood) && Math.sin(queenSprite.animationTicker) > 0

    if (targetBrood && season === 'summer') {
      queenSprite.delay += transferTo(1).inSeconds(30)
      if (queenSprite.delay < 1) return true
      queenSprite.delay = 0
      targetBrood.setContents('egg')
      queenSprite.position.y = queenSprite.position.y - 5
      return true
    }

    const emptyBroodCells = filterHexagon(hexGrid, hex => hex.type === 'brood' && !hex.isOccupiedWithOffspring() && hex.paused === false)
    if (emptyBroodCells.length > 0 && season === 'summer') {
      queenSprite.flyTo(emptyBroodCells[0])
      return true
    }
    queenSprite.flyTo(null)
    return false
  })

  setQueen(queenSprite)
  parent.addChild(queenSprite)
}
