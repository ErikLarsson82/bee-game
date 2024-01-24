import { Sprite, Text } from 'pixi.js'
import { fontConfig } from '../config'
import { addTicker, isDayBeforeWinter } from '../exported-help-functions'
import { season } from '../game/game-state'
import { foreground, queen } from '../game/pixi-elements'

export function createWarningSign () {
  const queenWarning = Sprite.fromImage('dialogue.png')
  queenWarning.dismissed = false
  queenWarning.position.x = 0
  queenWarning.position.y = 0
  queenWarning.visible = true
  queenWarning.interactive = true
  queenWarning.buttonMode = true
  queenWarning.mouseup = (e) => {
    queenWarning.dismissed = true
  }
  foreground.addChild(queenWarning)

  const textHeading = new Text('WINTER IN ONE DAY', { ...fontConfig, fill: 'black' })
  textHeading.scale.set(0.15, 0.15)
  textHeading.position.x = 10
  textHeading.position.y = 3
  queenWarning.addChild(textHeading)

  addTicker('game-stuff', () => {
    queenWarning.position.x = queen.position.x - 2
    queenWarning.position.y = queen.position.y - 18

    if (season === 'winter') queenWarning.dismissed = false
    queenWarning.visible = isDayBeforeWinter() && !queenWarning.dismissed
  })
}
