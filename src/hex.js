export const OFFSET_X = 120
export const OFFSET_Y = 56

export const HEX_AMOUNT_WIDTH = 14
export const HEX_AMOUNT_HEIGHT = 13
export const HEX_COLUMN_WIDTH = 13
export const HEX_ROW_HEIGHT = 10
export const HEX_ODD_ROW_OFFSET = 5

// “odd-q” vertical layout, shoves odd columns down
export function toLocalCoordinateFlat (index) {
  const { x, y } = index
  const odd = x % 2

  return {
    x: x * HEX_COLUMN_WIDTH + OFFSET_X,
    y: y * HEX_ROW_HEIGHT + (odd ? HEX_ODD_ROW_OFFSET : 0) + OFFSET_Y
  }
}

export function hexCornerFlat (center, size, i) {
  const angleDeg = 60 * i
  const angleRad = Math.PI / 180 * angleDeg

  return {
    x: (center.x + size * Math.cos(angleRad)),
    y: (center.y + size * Math.sin(angleRad))
  }
}

export function hexCornerPointy (center, size, i) {
  const angleDeg = 60 * i - 30
  const angleRad = Math.PI / 180 * angleDeg

  return {
    x: (center.x + size * Math.cos(angleRad)),
    y: (center.y + size * Math.sin(angleRad))
  }
}

/* eslint-disable quote-props */
export const DIRECTIONS_POINTY_ODD = {
  'NW': { x: 0, y: -1 },
  'NE': { x: 1, y: -1 },
  'W': { x: -1, y: 0 },
  'E': { x: 1, y: 0 },
  'SW': { x: 0, y: 1 },
  'SE': { x: 1, y: 1 }
}
export const DIRECTIONS_POINTY_EVEN = {
  'NW': { x: -1, y: -1 },
  'NE': { x: 0, y: -1 },
  'W': { x: -1, y: 0 },
  'E': { x: 1, y: 0 },
  'SW': { x: -1, y: 1 },
  'SE': { x: 0, y: 1 }
}

export const DIRECTIONS_FLAT_ODD = {
  '-': { x: 0, y: 0 },
  'N': { x: 0, y: -1 },
  'NE': { x: 1, y: 0 },
  'NW': { x: -1, y: 0 },
  'S': { x: 0, y: 1 },
  'SE': { x: 1, y: 1 },
  'SW': { x: -1, y: 1 }
}
export const DIRECTIONS_FLAT_EVEN = {
  '-': { x: 0, y: 0 },
  'NW': { x: -1, y: -1 },
  'NE': { x: 1, y: -1 },
  'N': { x: 0, y: -1 },
  'SW': { x: -1, y: 0 },
  'SE': { x: 1, y: 0 },
  'S': { x: 0, y: 1 }
}
/* eslint-enable quote-props */

export const forEachHexagon = (hexGrid, f) => hexGrid.forEach((row, x) => row.forEach((hex, y) => f(hex, x, y)))

export const filterHexagon = (hexGrid, f) => {
  const result = []
  hexGrid.forEach(row => row.forEach(hex => f(hex) && result.push(hex)))
  return result
}

export const getClosestHex = (hexes, bee, distance) => {
  if (hexes.length === 0) {
    throw new Error('hexes array must have length above 0')
  }
  let closestHex = null
  let closestDistance = 9999
  let i = 0

  do {
    const d = distance(
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

export const pay = (hexGrid, _amount) => {
  let amount = _amount
  const hexes = filterHexagon(hexGrid, hex => hex.type === 'honey')

  const sumTotal = hexes.reduce((acc, curr) => curr.honey + acc, 0)

  if (sumTotal < amount) return 'Insufficient honey'

  // Traverse all hexagons and pay the amount
  hexes.forEach(hex => {
    if (amount === 0) return
    if (hex.honey > 0) {
      if (hex.honey >= amount) {
        hex.honey -= amount
        amount = 0
      } else {
        amount -= hex.honey
        hex.honey = 0
      }
    }
  })

  return `-${_amount} honey`
}
