import { Sprite, Text } from 'pixi.js'
import { fontConfig } from '../config'
import { addTicker, isDayBeforeWinter, isTwoDaysBeforeWinter } from '../exported-help-functions'
import { season } from '../game/game-state'
import { foreground, queen } from '../game/pixi-elements'

export function createWarningSign () {
  const queenWarning = Sprite.fromImage('dialogue.png')
  queenWarning.dismissed = [false, false]
  queenWarning.position.x = 0
  queenWarning.position.y = 0
  queenWarning.visible = false
  queenWarning.interactive = true
  queenWarning.buttonMode = true
  let target = -1
  queenWarning.mouseup = (e) => {
    if (target === -1) return
    queenWarning.dismissed[target] = true
  }
  foreground.addChild(queenWarning)

  const textHeading = new Text('...', { ...fontConfig, fill: 'black' })
  textHeading.scale.set(0.15, 0.15)
  textHeading.position.x = 10
  textHeading.position.y = 3
  queenWarning.addChild(textHeading)

  addTicker('game-stuff', () => {
    queenWarning.position.x = queen.position.x - 2
    queenWarning.position.y = queen.position.y - 18

    if (season === 'winter') {
      queenWarning.dismissed[0] = false
      queenWarning.dismissed[1] = false
      target = -1
    }
    if (isTwoDaysBeforeWinter() && !queenWarning.dismissed[0]) {
      queenWarning.visible = true
      textHeading.text = 'POLLINATE FLOWERS?'
      target = 0
      return
    }
    if (isDayBeforeWinter() && !queenWarning.dismissed[1]) {
      queenWarning.visible = true
      textHeading.text = 'WINTER IN ONE DAY'
      target = 1
      return
    }
    queenWarning.visible = false
    textHeading.text = '...'
  })
}
