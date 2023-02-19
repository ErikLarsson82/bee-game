
function createFlowers() {
  const positions = [10, -50, 60, -110, 120, -160, 170]
  for (var f = 0; f <= seeds; f++) {
    const flower = Sprite.fromImage('images/scene/flower.png')

    const flipped = Math.random() < 0.5

    const flowerExclamation = Sprite.fromImage('images/exclamations/exclamation-warning-mild.png')
    flowerExclamation.position.x = flipped ? -10 : 10
    flowerExclamation.position.y = -20
    flowerExclamation.visible = false
    flower.addChild(flowerExclamation)

    makeOccupiable(flower)
    makeSelectable(flower, 'flower')

    flower.POLLINATION_REQUIREMENT = 100
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

      const textHeading = new PIXI.Text('FLOWER', { ...fontConfig })
      textHeading.scale.set(0.15, 0.15)
      textHeading.position.x = 105
      textHeading.position.y = -26
      container.addChild(textHeading)

      const textDescription = new PIXI.Text('POLLINATED', { ...fontConfig, fill: '#96a5bc' })
      textDescription.scale.set(0.15, 0.15)
      textDescription.position.x = 82
      textDescription.position.y = -16
      container.addChild(textDescription)

     return container
    }

    addTicker('game-stuff', () => {
      flowerExclamation.visible = isDayBeforeWinter() && !flower.isPollinated()
      if (flower.isPollinated()) {
        flower.texture = Texture.fromImage('images/scene/flower-pollinated.png')        

        if (!flower.pollinationAnimationSprite) {

          const doneCallback = () => {
            flower.removeChild(flower.pollinationAnimationSprite)
            flower.pollinationAnimationSprite = 'no not animate again'
          }
          const { sprite } = animateSprite(flower, 'flower-is-pollinated', 7, 46, 50, false, doneCallback, true)
          sprite.anchor.set(flipped ? 0.6 : 0.2, 0.2)
          flower.pollinationAnimationSprite = sprite
        }
      }
    })

    flowers.push(flower)
  }
}

function killFlowers() {
  if (flowers.filter(flower => flower.isPollinated()).length === flowers.length) {
    seeds++
  }
  if (selected && selected.label === 'flower') setSelected(null)
  flowers.forEach(flower => {
    flower.removeChild(flower.flowerSprite)
    delete flower.flowerSprite
    flowerBed.removeChild(flower)
  })
  flowers = []
}
