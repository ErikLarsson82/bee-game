
const OFFSET_X = 120
const OFFSET_Y = 36
const VERTICAL_SIZE = 6
const HORIZONTAL_SIZE = 9

const WIDTH_FLAT = 2 * HORIZONTAL_SIZE
const HEIGHT_FLAT = Math.round(Math.sqrt(3) * VERTICAL_SIZE)

const WIDTH_POINTY = Math.sqrt(3) * HORIZONTAL_SIZE
const HEIGHT_POINTY = 2 * VERTICAL_SIZE

// “odd-q” vertical layout, shoves odd columns down
function toLocalCoordinateFlat(index) {
  const { x, y } = index
  const odd = x % 2

  return {
    x: ((x * WIDTH_FLAT * (3/4)) + OFFSET_X),
    y: ((y * HEIGHT_FLAT) + OFFSET_Y + (odd ? HEIGHT_FLAT/2 : 0))
  } 
}

// “odd-r” horizontal layout, shoves odd rows right
function toLocalCoordinatePointy(index) {
  const { x, y } = index
  const odd = y % 2

  return {
    x: ((x * WIDTH_POINTY) + OFFSET_X + (odd ? WIDTH_POINTY/2 : 0)),
    y: ((y * HEIGHT_POINTY * (3/4)) + OFFSET_Y)
  }
}

function hexCornerFlat(center, size, i) {
  const angle_deg = 60 * i
  const angle_rad = Math.PI / 180 * angle_deg
  
  return { 
    x: (center.x + size * Math.cos(angle_rad)),
    y: (center.y + size * Math.sin(angle_rad))
  }
}

function hexCornerPointy(center, size, i) {
  var angle_deg = 60 * i - 30
  var angle_rad = Math.PI / 180 * angle_deg
  
  return {
    x: (center.x + size * Math.cos(angle_rad)),
    y: (center.y + size * Math.sin(angle_rad))
  }
}
    

const DIRECTIONS_POINTY_ODD = {
  'NW': { x: 0, y: -1},
  'NE': { x: 1, y: -1},
  'W': { x: -1, y: 0},
  'E': { x: 1, y: 0},
  'SW': { x: 0, y: 1},
  'SE': { x: 1, y: 1},
}
const DIRECTIONS_POINTY_EVEN = {
  'NW': { x: -1, y: -1},
  'NE': { x: 0, y: -1},
  'W': { x: -1, y: 0},
  'E': { x: 1, y: 0},
  'SW': { x: -1, y: 1},
  'SE': { x: 0, y: 1},
}

const DIRECTIONS_FLAT_ODD = {
  '-': { x: 0, y: 0 },
  'N': { x: 0, y: -1},
  'NE': { x: 1, y: 0 },
  'NW': { x: -1, y: 0 },
  'S': { x: 0, y: 1},
  'SE': { x: 1, y: 1},
  'SW': { x: -1, y: 1},
}
const DIRECTIONS_FLAT_EVEN = {
  '-': { x: 0, y: 0 },
  'NW': { x: -1, y: -1},
  'NE': { x: 1, y: -1},
  'N': { x: 0, y: -1},
  'SW': { x: -1, y: 0},
  'SE': { x: 1, y: 0},
  'S': { x: 0, y: 1},
}

const forEachHexagon = (hexGrid, f) => hexGrid.forEach((row, x) => row.forEach((hex, y) => f(hex, x, y)))

const filterHexagon = (hexGrid, f) => {
  const result = []
  hexGrid.forEach(row => row.forEach(hex => f(hex) && result.push(hex)))
  return result
}

const dist = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))

const getClosestHex = (hexes, bee) => {
  if (hexes.length === 0) {
    throw 'hexes array must have length above 0'
  }
  let closestHex = null
  let closestDistance = 9999
  let i = 0

  do {
    const d = dist(
      hexes[i].worldTransform.tx,
      hexes[i].worldTransform.ty,
      bee.worldTransform.tx,
      bee.worldTransform.ty)

    if (d < closestDistance) {
      closestDistance = d
      closestHex = hexes[i]
    }

    i++
  } while (i < hexes.length)

  return closestHex
}
