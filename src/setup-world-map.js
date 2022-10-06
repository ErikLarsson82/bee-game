
const TILES = 8

const WORLDMAP = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 6, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 15,1, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 15,1, 4, 11,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 10,1, 11,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 16,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 15,3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 10,7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 15,6, 18,19,3, 0, 0, 0, 0, 0, 15,12,6, 6, 3, 0, 0],
  [0, 0, 0, 0, 15,1, 20,21,7, 0, 0, 0, 0, 0, 15,1, 18,19,7, 0, 0],
  [0, 0, 0, 0, 15,1, 20,21,7, 0, 0, 0, 0, 0, 13,1, 20,21,7, 0, 0],
  [0, 0, 0, 0, 15,1, 26,27,1, 17,17,17,17,17,1, 1, 20,21,7, 0, 0],
  [0, 0, 0, 0, 10,5, 1, 4, 11,0, 0, 0, 0, 0, 10,5, 26,27,7, 0, 0],
  [0, 0, 0, 0, 0, 10,14,11,0, 0, 0, 0, 0, 0, 0, 10,14,14,11, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]


function setupWorldMap() {
  scene = 'world-map'
  document.body.style['background-color'] = '#fff6c5'
  
  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const tileSpritesheet = Sprite.fromImage('images/world-map/spritesheet-worldmap.png')
  
  for (let y = 0; y < WORLDMAP.length; y++) {
    for (let x = 0; x < WORLDMAP[0].length; x++) {
      const type = WORLDMAP[y][x]
      const xPrime = (type % TILES) * 20
      const yPrime = Math.floor(type / TILES) * 20
      const xPos = x * 20
      const yPos = y * 20
      const texture = new Texture(tileSpritesheet.texture, new PIXI.Rectangle(xPrime, yPrime, 20, 20))
      const sprite = new Sprite(texture)
      sprite.position.x = xPos
      sprite.position.y = yPos
      container.addChild(sprite)
    }
  }
}
