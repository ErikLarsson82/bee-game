export function cap (min, max) {
  return (value) => Math.max(Math.min(max, value), min)
}

export function distance (x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
}

export const colorToHex = (color) => parseInt(color.substring(1), 16)

export function samePosition (a, b) {
  if (b) {
    return a.position.x === b.position.x && a.position.y === b.position.y
  } else {
    return function prepared (c) {
      return a.position.x === c.position.x && a.position.y === c.position.y
    }
  }
}

export function distanceFactor (a, b) {
  const x2 = Math.abs(a.position.x - b.position.x) * 2
  const y2 = Math.abs(a.position.y - b.position.y) * 2
  return Math.sqrt(x2 + y2)
}

export function something (x) {
  return x !== undefined
}

export function notMe (_x, _y) {
  return (hex) => {
    const { x, y } = hex.index
    return !(_x === x && _y === y)
  }
}

export function isHoney (hex) {
  return hex.type === 'honey'
}

export function isNectar (hex) {
  return hex.type === 'nectar'
}

export function isHoneyBuff (hex) {
  return hex.bonusType === 'honey-buff'
}

export function isNectarBuff (hex) {
  return hex.bonusType === 'nectar-buff'
}

export function isPollenFeederBuff (hex) {
  return hex.bonusType === 'pollen-feeder'
}

export function normalize (Point, p) {
  const outPoint = new Point()
  const magnitude = Math.sqrt((p.x * p.x) + (p.y * p.y))
  outPoint.x = p.x / magnitude
  outPoint.y = p.y / magnitude
  return outPoint
}

export function magnitude (p) {
  return Math.sqrt((p.x * p.x) + (p.y * p.y))
}
