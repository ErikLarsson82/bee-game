function setupWorldMap3() {
  scene = 'world-map-3'
  document.body.style['background-color'] = '#fff6c5'
  
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const mapImage = Sprite.fromImage('images/world-map-3/sample.png')
  container.addChild(mapImage)

  const dirs = [false, false, false, false]
  setInterval(() => {
    if (dirs[0]) mapImage.position.y += 10
    if (dirs[1]) mapImage.position.y -= 10
    if (dirs[2]) mapImage.position.x += 10
    if (dirs[3]) mapImage.position.x -= 10
  }, 16.66)
  window.addEventListener('keydown', e => {
    if (e.keyCode === 87) {
      dirs[0] = true
    }
    if (e.keyCode === 83) {
      dirs[1] = true
    }
    if (e.keyCode === 65) {
      dirs[2] = true
    }
    if (e.keyCode === 68) {
      dirs[3] = true      
    }
  })
  window.addEventListener('keyup', e => {
    if (e.keyCode === 87) {
      dirs[0] = false
    }
    if (e.keyCode === 83) {
      dirs[1] = false
    }
    if (e.keyCode === 65) {
      dirs[2] = false
    }
    if (e.keyCode === 68) {
      dirs[3] = false      
    }
  })
}
