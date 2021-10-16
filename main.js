const OFFSET = 100;
const SIZE = 20;
const WIDTH = Math.sqrt(3) * SIZE;
const HEIGHT = 2 * SIZE;
const DIRECTIONS_ODD = {
  'NW': { x: 0, y: -1},
  'NE': { x: 1, y: -1},
  'W': { x: -1, y: 0},
  'E': { x: 1, y: 0},
  'SW': { x: 0, y: 1},
  'SE': { x: 1, y: 1},
}
const DIRECTIONS_EVEN = {
  'NW': { x: -1, y: -1},
  'NE': { x: 0, y: -1},
  'W': { x: -1, y: 0},
  'E': { x: 1, y: 0},
  'SW': { x: -1, y: 1},
  'SE': { x: 0, y: 1},
}

const l = console.log;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 300;

const hexGrid = new Array(5).fill().map((_, x) => 
  new Array(5).fill().map((_, y) => hexagon(x, y))
)
const forEachHexagon = f => hexGrid.forEach(row => row.forEach(hex => f(hex)));

function hexagon(x, y) {
  
  const odd = y % 2;
  const lookup = odd ? DIRECTIONS_ODD : DIRECTIONS_EVEN;
  
  let fillColor = '#0f0';
  let strokeColor = '#00f';

  const pixelCoordinate = toLocalCoordinate({ x, y });

  const setColor = color => {
    if (color === 'red') {
      fillColor = '#f00';
      strokeColor = '#ff0';
    } else if (color === 'blue') {
      fillColor = '#00f';
      strokeColor = '#0ff';
    } else {
      fillColor = '#0f0';
      strokeColor = '#00f';
    }
  }

  const getNeighbour = direction => {
    const xD = lookup[direction].x;
    const yD = lookup[direction].y;
    const result = hexGrid[x + xD] && hexGrid[x + xD][y + yD]
    return result || null;
  }

  const getNeighbours = () => Object.keys(lookup).map(getNeighbour).filter(x => x !== null)

  function render() {
    context.beginPath();

    const { x, y } = pointy_hex_corner(pixelCoordinate, SIZE, 0);
    context.moveTo(x, y);

    for (var i = 1; i <= 5; i++) {
      const { x, y } = pointy_hex_corner(pixelCoordinate, SIZE, i);
      context.lineTo(x, y);
    }

    context.fillStyle = fillColor;
    context.strokeStyle = strokeColor;

    context.closePath();
    context.fill();
    context.stroke();  
  }

  return {
    x,
    y,
    pixelX: pixelCoordinate.x,
    pixelY: pixelCoordinate.y,
    getNeighbour,
    getNeighbours,
    setColor,
    render,
  }
}


function drawGrid() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  forEachHexagon(hex => hex.render());
}

function toLocalCoordinate(index) {
  const { x, y } = index;
  const odd = y % 2;

  return {
    x: (x * WIDTH) + OFFSET + (odd ? WIDTH/2 : 0),
    y: (y * HEIGHT * (3/4)) + OFFSET
  }
}


function pointy_hex_corner(center, size, i) {
  var angle_deg = 60 * i - 30;
  var angle_rad = Math.PI / 180 * angle_deg;
  
  return {
    x: center.x + size * Math.cos(angle_rad),
    y: center.y + size * Math.sin(angle_rad)
  }
}
    


// Init
drawGrid();


window.addEventListener('pointermove', evt => {
  const { x, y } = evt;

  forEachHexagon(hex => hex.setColor(null));

  let lowest = Infinity;
  let closest = null;

  hexGrid.forEach(row => {
    row.forEach(v => {
      const xP = Math.abs(x - v.pixelX);
      const yP = Math.abs(y - v.pixelY);
      const dist = Math.sqrt((xP * 2) + (yP * 2))
      if (dist < lowest && dist < (SIZE / 2.5)) {
        lowest = dist;
        closest = v;
      }
    })
  })
  if (closest === null) return;
  closest.setColor('red');

  closest.getNeighbours().forEach(neighbor => neighbor.setColor('blue'));

  drawGrid();
})

// draw one hexagon, CHECK

// draw a 5x5 grid of hexagons, CHECK

// use a crude distance calc to highlight the one you are hovering, CHECK

// show neighbors on hover aswell, CHECK