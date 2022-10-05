function setupWorldMap2() {
  scene = 'world-map-2'
  document.body.style['background-color'] = '#fff6c5'
  
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const mapImage = Sprite.fromImage('images/world-map-2/desertmap.png')
  container.addChild(mapImage)

  const levelImagePositions = [
    { x: 16, y: 160 },
    { x: 16, y: 16 },
    { x: 200, y: 16 },
    { x: 200, y: 160 },
  ]

  const levelImages = (levelImagePositions).map((position, index) => {
    const levelImage = Sprite.fromImage(`images/world-map-2/level${index}-green.png`)
    levelImage.position.x = position.x
    levelImage.position.y = position.y
    levelImage.alpha = 0
    container.addChild(levelImage)

    return levelImage
  })

  const keyLevelMap = {
    '1': 0,
    '2': 1,
    '3': 2,
    '4': 3,
  }

  window.addEventListener('keydown', e => {

    if (e.key in keyLevelMap) {
      const levelImage = levelImages[keyLevelMap[e.key]]
      delete keyLevelMap[e.key]
      const id = setInterval(() => {
        levelImage.alpha += 0.01
        if (levelImage.alpha >= 1) {
          clearInterval(id)
        }
      }, 0);
    }
  })
}
