const OFFSET = 100;
const SIZE = 20;
const WIDTH = Math.sqrt(3) * SIZE;
const HEIGHT = 2 * SIZE;

const l = console.log;

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 300;

const hexGrid = new Array(5).fill().map((_, x) => {
  return new Array(5).fill().map((_, y) => {
    return { x, y }
  })
})

function drawGrid() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  hexGrid.forEach(x => 
    x.map(toLocalCoordinate).forEach(drawHex)
  );
}

function drawNeighborhood(hex) {
  const odd = hex.y % 2;
  // Top left
  if (hexGrid[hex.x] && hexGrid[hex.x][hex.y - 1] && odd) {
    drawHex(toLocalCoordinate({ x: hex.x, y: hex.y - 1 }), 'blue')
  }
  if (hexGrid[hex.x - 1] && hexGrid[hex.x - 1][hex.y - 1] && !odd) {
    drawHex(toLocalCoordinate({ x: hex.x - 1, y: hex.y - 1 }), 'blue')
  }
  // Top right
  if (hexGrid[hex.x + 1] && hexGrid[hex.x + 1][hex.y - 1] && odd) {
    drawHex(toLocalCoordinate({ x: hex.x + 1, y: hex.y - 1 }), 'blue')
  }
  if (hexGrid[hex.x] && hexGrid[hex.x][hex.y - 1] && !odd) {
    drawHex(toLocalCoordinate({ x: hex.x, y: hex.y - 1 }), 'blue')
  }
  // Left
  if (hexGrid[hex.x - 1] && hexGrid[hex.x - 1][hex.y]) {
    drawHex(toLocalCoordinate({ x: hex.x - 1, y: hex.y }), 'blue')
  }
  // Right
  if (hexGrid[hex.x + 1] && hexGrid[hex.x + 1][hex.y]) {
    drawHex(toLocalCoordinate({ x: hex.x + 1, y: hex.y }), 'blue')
  }
  // Bottom left
  if (hexGrid[hex.x] && hexGrid[hex.x][hex.y + 1] && odd) {
    drawHex(toLocalCoordinate({ x: hex.x, y: hex.y + 1 }), 'blue')
  }
  if (hexGrid[hex.x - 1] && hexGrid[hex.x - 1][hex.y + 1] && !odd) {
    drawHex(toLocalCoordinate({ x: hex.x - 1, y: hex.y + 1 }), 'blue')
  }
  // Bottom right
  if (hexGrid[hex.x + 1] && hexGrid[hex.x + 1][hex.y + 1] && odd) {
    drawHex(toLocalCoordinate({ x: hex.x + 1, y: hex.y + 1 }), 'blue')
  }
  if (hexGrid[hex.x] && hexGrid[hex.x][hex.y + 1] && !odd) {
    drawHex(toLocalCoordinate({ x: hex.x, y: hex.y + 1 }), 'blue')
  }
}

function toLocalCoordinate(index) {
  const { x, y } = index;
  const odd = y % 2;

  return {
    x: (x * WIDTH) + OFFSET + (odd ? WIDTH/2 : 0),
    y: (y * HEIGHT * (3/4)) + OFFSET
  }
}

function drawHex(center, color) {
  if (color === 'red') {
    context.fillStyle = '#f00';
    context.strokeStyle = '#ff0';
  } else if (color === 'blue') {
    context.fillStyle = '#00f';
    context.strokeStyle = '#0ff';
  } else {
    context.fillStyle = '#0f0';
    context.strokeStyle = '#00f';
  }

  context.beginPath();

  const { x, y } = pointy_hex_corner(center, SIZE, 0);
  context.moveTo(x, y);

  for (var i = 1; i <= 5; i++) {
    const { x, y } = pointy_hex_corner(center, SIZE, i);
    context.lineTo(x, y);
  }

  context.closePath();
  context.fill();
  context.stroke();  
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

  drawGrid();

  let lowest = Infinity;
  let closest = null;

  hexGrid.forEach(row => {
    row.forEach(v => {
      const lV = toLocalCoordinate(v)
      const xP = Math.abs(x - lV.x);
      const yP = Math.abs(y - lV.y);
      const dist = Math.sqrt((xP * 2) + (yP * 2))
      if (dist < lowest && dist < (SIZE / 2.5)) {
        lowest = dist;
        closest = v;
      }
    })
  })
  if (closest === null) return;
  drawHex(toLocalCoordinate(closest), 'red')
  drawNeighborhood(closest)
})


// draw one hexagon, CHECK

// draw a 5x5 grid of hexagons, CHECK

// use a crude distance calc to highlight the one you are hovering, CHECK

// show neighbors on hover aswell, CHECK