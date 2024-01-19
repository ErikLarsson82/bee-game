import { Texture, Sprite, Container } from 'pixi.js'
import { flowers, setFlowers, seeds, setSeeds, selected, season, hour, killNonPollinatedFlowers } from '../game/game-state'
import { makeOccupiable, makeSelectable } from '../sprite-factories'
import { addTicker, updateSelected, isDayBeforeWinter } from '../exported-help-functions'
import { WIDTH, fontConfig } from '../config'
import { ProgressBar } from '../ui'

export function createFlowers (flowerBed) {
  const positions = [10, -50, 60, -110, 120, -160, 170]
  const texture = {
    dead: Texture.fromImage('images/scene/flower-dead.png'),
    normal: Texture.fromImage('images/scene/flower.png'),
    pollinated: Texture.fromImage('images/scene/flower-pollinated.png')
  }

  // first, cleanup
  flowers.forEach(flower => {
    flower.removeChild(flower.flowerSprite)
    delete flower.flowerSprite
    flowerBed.removeChild(flower)
  })
  setFlowers([])

  // then, create flowers
  for (let f = 1; f <= seeds; f++) {
    const flower = Sprite.fromImage('images/scene/flower.png')

    const flipped = Math.random() < 0.5

    const exclamationTextures = {
      mild: Texture.fromImage('images/exclamations/exclamation-warning-mild.png'),
      severe: Texture.fromImage('images/exclamations/exclamation-warning-severe.png')
    }
    const flowerExclamation = Sprite.fromImage('images/exclamations/exclamation-warning-mild.png')
    flowerExclamation.position.x = flipped ? -10 : 10
    flowerExclamation.position.y = -20
    flowerExclamation.visible = false
    flower.addChild(flowerExclamation)

    makeOccupiable(flower)
    makeSelectable(flower, 'flower')

    flower.POLLINATION_REQUIREMENT = 50
    flower.pollinationLevel = 0
    flower.isPollinated = () => flower.pollinationLevel >= flower.POLLINATION_REQUIREMENT

    flower.scale.x = flipped ? -1 : 1
    flower.anchor.set(flipped ? 0.6 : 0.2, 0.2)
    flower.position.x = Math.round((WIDTH / 4) + (positions[f] ? positions[f] : f))
    flower.position.y = 280 - Math.round(Math.random() * 10)
    flowerBed.addChild(flower)

    flower.panelLabel = () => false
    flower.panelPosition = () => flower.position

    flower.panelContent = () => {
      const container = new Container()

      const whiteLine = Sprite.fromImage('images/ui/white-description-line.png')
      whiteLine.position.x = 0
      whiteLine.position.y = -30
      container.addChild(whiteLine)

      const content = Sprite.fromImage('images/ui/content-flower.png')
      content.position.x = 72
      content.position.y = -29
      container.addChild(content)

      container.addChild(ProgressBar(124, -15, 'flower', () => flower.pollinationLevel, flower.POLLINATION_REQUIREMENT))

      const textHeading = new Text('FLOWER', { ...fontConfig })
      textHeading.scale.set(0.15, 0.15)
      textHeading.position.x = 105
      textHeading.position.y = -26
      container.addChild(textHeading)

      const textDescription = new Text('POLLINATED', { ...fontConfig, fill: '#96a5bc' })
      textDescription.scale.set(0.15, 0.15)
      textDescription.position.x = 82
      textDescription.position.y = -16
      container.addChild(textDescription)

      return container
    }

    addTicker('game-stuff', () => {
      flowerExclamation.visible = isDayBeforeWinter() && !flower.isPollinated()
      flowerExclamation.texture = flowers.filter(flower => flower.isPollinated()).length === 0 && killNonPollinatedFlowers ? exclamationTextures.severe : exclamationTextures.mild

      if (season === 'summer' && !flower.visible) {
        flower.visible = true
      }

      if (season === 'winter') {
        if (!flower.isPollinated()) {
          flower.texture = texture.dead
        }
        if (hour > 8 && flower.visible) {
          flower.visible = false
        }
      } else {
        if (flower.isPollinated()) {
          flower.texture = texture.pollinated
        }
      }
    })

    flowers.push(flower)
  }
}

export function resolveWinterFlowers () {
  const pollinated = flowers.filter(flower => flower.isPollinated())
  const allDone = (pollinated.length === flowers.length) && flowers.length !== 0
  if (killNonPollinatedFlowers) {
    setSeeds(pollinated.length)
  }
  setSeeds(seeds + (allDone ? 1 : 0))
  if (selected && selected.label === 'flower') {
    updateSelected(null)
  }
}
