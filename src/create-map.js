
let MAP_CONFIGURATIONS = [
  {
    name: 'Level 1 - Green fields',
    id: 'default',
    cycles: [5, 1, 5, 2, 5, 2, 4, 3, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 16, 16, 18, 18, 20, 20, 24, 24, 30, 30],
    seeds: 2,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-summer'
  },
  {
    name: 'Level 2 - Green gone cold',
    id: 'generous start',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 4,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-summer-cold'
  },
  {
    name: 'Level 3 - Desert haze',
    id: 'some-hexes-blocked',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 4,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-desert'
  },
  {
    name: 'Level 4 - Blizzard winter',
    id: 'corner start',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1],
    seeds: 2,
    winterHungerMultiplier: 5,
    backgroundImage: 'background-hurricane'
  },
  {
    // Give players many many empty hexagons to choose from
    name: 'Experiment: - Many empty hex',
    id: 'many empty',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1],
    seeds: 1,
    winterHungerMultiplier: 4
  },
  {
    // Give players lots of resources at the start, but have winters be pretty punishing
    name: 'Experiment: Generous start - punishing',
    id: 'generous start',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 4,
    winterHungerMultiplier: 4
  },
  {
    // Bees are VERY hungry during winter, albeit they are short - this one could be considered a very hard map, especially to get far
    name: 'Experiment: Hunger winter - escalating',
    id: 'corner start',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 3, 3, 3, 3, 4, 3, 4, 3, 5, 3, 6, 3, 7, 3, 8, 3, 9, 3, 10, 3, 11],
    seeds: 2,
    winterHungerMultiplier: 5
  },
  {
    // Not much to start with and winter coming fast
    name: 'Experiment: Fast winter',
    id: 'fast winter',
    cycles: [1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    seeds: 1,
    winterHungerMultiplier: 1
  }
]

function createMap(m) {
  createQueen(beeContainer)
   
  if (m === 'default') {
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)

    const bee = createBee(beeContainer, 'bookie').setHunger(100).setAge(0)
    bee.setType('bookie')

    replaceHex([0, 0], 'prepared', 'activate').instantlyPrepare()
    replaceHex([0, 8], 'prepared', 'activate').instantlyPrepare()
    replaceHex([8, 0], 'prepared', 'activate').instantlyPrepare()
    replaceHex([8, 8], 'prepared', 'activate').instantlyPrepare()
    
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)
    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')
  }

  if (m === 'many empty') {
    createBee(beeContainer, 'idle').setHunger(60).setAge(40)
    createBee(beeContainer, 'idle').setHunger(70).setAge(30)
    createBee(beeContainer, 'idle').setHunger(80).setAge(20)
    createBee(beeContainer, 'idle').setHunger(90).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)
    
    for (let i = 2; i <= 10; i++) {
      for (var j = 3; j <= 12; j++) {
        replaceHex([i, j], 'prepared', 'activate').instantlyPrepare()    
      }
    }
  }

  if (m === 'some-hexes-blocked') {
    createBee(beeContainer, 'idle').setHunger(60).setAge(40)
    createBee(beeContainer, 'idle').setHunger(70).setAge(30)
    createBee(beeContainer, 'idle').setHunger(80).setAge(20)
    
    replaceHex([4, 2], 'blocked', 'no-activation')
    replaceHex([3, 2], 'blocked', 'no-activation')
    replaceHex([5, 2], 'blocked', 'no-activation')
    replaceHex([2, 3], 'blocked', 'no-activation')
    replaceHex([6, 3], 'blocked', 'no-activation')
    replaceHex([2, 4], 'blocked', 'no-activation')
    replaceHex([6, 4], 'blocked', 'no-activation')
    replaceHex([2, 5], 'blocked', 'no-activation')
    replaceHex([6, 5], 'blocked', 'no-activation')
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')    
  }

  if (m === 'mini') {
    createBee(beeContainer, 'idle').setHunger(20).setAge(80).setNectar(60).setPollen(30) //.setHoney(30)
    
    replaceHex([4, 5], 'nectar', 'activate')
    replaceHex([4, 6], 'pollen', 'activate')
    replaceHex([4, 7], 'honey', 'activate')
  }

  if (m === 'brood single test') {
    createBee(beeContainer, 'nurser').setHunger(100)
    
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'brood', 'activate')
    replaceHex([4, 4], 'pollen', 'activate').setPollen(100)
  }

  if (m === 'corner start') {
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)

    replaceHex([0, 8], 'prepared', 'activate').instantlyPrepare()
    replaceHex([0, 9], 'prepared', 'activate').instantlyPrepare()
    replaceHex([1, 8], 'prepared', 'activate').instantlyPrepare()
    replaceHex([1, 9], 'prepared', 'activate').instantlyPrepare()
  }

  if (m === 'generous start') {
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)

    replaceHex([2, 3], 'pollen', 'activate').setPollen(60)
    replaceHex([2, 2], 'pollen', 'activate').setPollen(60)
    
    replaceHex([6, 6], 'nectar', 'activate')
    replaceHex([6, 7], 'nectar', 'activate')

    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')
    
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)

    replaceHex([8, 8], 'honey', 'activate').setHoney(30)
    replaceHex([8, 9], 'honey', 'activate').setHoney(30)
    replaceHex([7, 8], 'honey', 'activate').setHoney(30)
    replaceHex([7, 9], 'honey', 'activate').setHoney(30)
  }

  if (m === 'plenty honey') {
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)

    replaceHex([0, 0], 'prepared', 'activate').instantlyPrepare()
    replaceHex([0, 8], 'prepared', 'activate').instantlyPrepare()
    replaceHex([8, 0], 'prepared', 'activate').instantlyPrepare()
    replaceHex([8, 8], 'prepared', 'activate').instantlyPrepare()
    
    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)
    replaceHex([5, 5], 'honey', 'activate').setHoney(30)
    replaceHex([3, 5], 'honey', 'activate').setHoney(30)
    replaceHex([5, 6], 'honey', 'activate').setHoney(30)
    replaceHex([3, 6], 'honey', 'activate').setHoney(30)
    replaceHex([5, 7], 'honey', 'activate').setHoney(30)
    replaceHex([3, 7], 'honey', 'activate').setHoney(30)
    replaceHex([5, 8], 'honey', 'activate').setHoney(30)
    replaceHex([3, 8], 'honey', 'activate').setHoney(30)
  }

  if (m === 'fast winter') {
    createBee(beeContainer, 'idle').setHunger(100).setAge(20)
    createBee(beeContainer, 'idle').setHunger(100).setAge(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0)
    
    replaceHex([4, 7], 'prepared', 'activate').instantlyPrepare()
    replaceHex([5, 7], 'prepared', 'activate').instantlyPrepare()
    replaceHex([5, 8], 'prepared', 'activate').instantlyPrepare()
    replaceHex([6, 7], 'prepared', 'activate').instantlyPrepare()
  }

  if (m === 'all') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    
    for (let i = 0; i < hexGrid.length; i++) {
      for (let j = 0; j < hexGrid[0].length; j++) {
        replaceHex([j, i], 'prepared', 'activate').instantlyPrepare()
      }
    }
  }

  if (m === 'die') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(1).setPollen(60)
  }

  if (m === 'loe') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(40).setAge(80).setWax(10)
    createBee(beeContainer, 'idle').setHunger(42).setAge(60).setWax(10)
    createBee(beeContainer, 'idle').setHunger(50).setAge(20).setWax(10)
    createBee(beeContainer, 'idle').setHunger(80).setAge(10).setWax(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(6).setWax(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(5).setWax(10)
    createBee(beeContainer, 'idle').setHunger(100).setAge(0).setWax(10)

    replaceHex([4, 4], 'wax', 'activate')
    replaceHex([4, 5], 'wax', 'activate')
    replaceHex([5, 4], 'honey', 'activate').setHoney(30)
    replaceHex([3, 4], 'honey', 'activate').setHoney(30)
    replaceHex([4, 5], 'prepared', 'activate').instantlyPrepare()
    replaceHex([4, 3], 'prepared', 'activate').instantlyPrepare()
  }

  if (m === 'die test') {
    createBee(beeContainer, 'idle').setHunger(60).setAge(99.8)
    createBee(beeContainer, 'idle').setHunger(60).setAge(99.7)
    createBee(beeContainer, 'idle').setHunger(40).setAge(70 - 20)
    
    replaceHex([2, 2], 'wax', 'activate')
    replaceHex([2, 3], 'honey', 'activate').setHoney(30)
  }

  if (m === 'stress') {
    seeds = 100

    for (let i = 0; i <100; i++) {
      createBee(beeContainer, 'forager') //.setPollen(30)
    }
    for (let i = 0; i <100; i++) {
      createBee(beeContainer, 'nurser')
    }
    for (let i = 0; i <100; i++) {
      createBee(beeContainer, 'worker')
    }
    
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        const type = ['pollen', 'honey', 'wax', 'brood', 'nectar'][Math.floor(Math.random()*5)]
        replaceHex([x, y], type, 'activate')
        // replaceSelectedHex(type)
        //activateAdjacent(x, y)  
      }
    }
  }

  if (m === 'prepared') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')
    setSelected(hexGrid[0][0])
    replaceSelectedHex('prepared').instantlyPrepare()
  }

  if (m === 'kill brood') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'nurser')
    
    setSelected(hexGrid[0][0])
    replaceSelectedHex('nectar').setNectar(15)
    setSelected(hexGrid[1][0])
    replaceSelectedHex('pollen').setPollen(120)
    setSelected(hexGrid[2][0])

    setSelected(hexGrid[2][2])
    replaceSelectedHex('brood')
    setSelected(hexGrid[3][2])
    replaceSelectedHex('brood')
    setSelected(hexGrid[4][2])
    replaceSelectedHex('brood')

    setSelected(hexGrid[2][4])
    replaceSelectedHex('brood')
    setSelected(hexGrid[3][4])
    replaceSelectedHex('brood')
    setSelected(hexGrid[4][4])
    replaceSelectedHex('brood')
  }

  if (m === 'playtest') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey')
    setSelected(hexGrid[1][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[2][0])
    replaceSelectedHex('nectar')
    setSelected(hexGrid[3][0])
    replaceSelectedHex('brood')
  }

  if (m === 'pollination scenario') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[1][0])
    replaceSelectedHex('nectar')
  }

  if (m === 'honey-deposits') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager').setPollen(20)
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(60)
    setSelected(hexGrid[1][0])
    replaceSelectedHex('honey').setHoney(60)
  }

  if (m === 'sparse') {
    createBee(beeContainer, 'worker')
  }

  if (m === 'jobs') {
    paused = false
    for (var i = 0; i < 6; i++) {
      createBee(beeContainer, 'idle')
    }

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(15)
    setSelected(hexGrid[1][0])
    replaceSelectedHex('honey')
    setSelected(hexGrid[2][0])
    replaceSelectedHex('honey')

    setSelected(hexGrid[0][1])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][2])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][3])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][4])
    replaceSelectedHex('pollen')

    setSelected(hexGrid[3][0])
    replaceSelectedHex('nectar').setNectar(15)
    setSelected(hexGrid[4][0])
    replaceSelectedHex('nectar')
  }


  if (m === 'deposit nectar sceanrio') {
    createBee(beeContainer, 'forager').setNectar(18)
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[0][1])
    replaceSelectedHex('nectar')
  }

  if (m === 'deposit honey sceanrio') {
    createBee(beeContainer, 'worker').setHoney(20)

    setSelected(hexGrid[0][1])
    replaceSelectedHex('honey')
  }


  if (m === 'converter sceanrio') {
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(0)

    setSelected(hexGrid[0][1])
    replaceSelectedHex('nectar').setNectar(15)
  }

  if (m === 'brooder scenario') {
    // Things are prepared with pollen so you can breed directly
    createBee(beeContainer, 'nurser').setPollen(20)
    createBee(beeContainer, 'forager').setPollen(20)
    createQueen(beeContainer)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey')

    setSelected(hexGrid[2][0])
    replaceSelectedHex('pollen')
    hexGrid[2][0].pollen = hexGrid[2][0].POLLEN_HEX_CAPACITY
    
    setSelected(hexGrid[3][0])
    replaceSelectedHex('pollen')
    hexGrid[3][0].pollen = hexGrid[3][0].POLLEN_HEX_CAPACITY   

    setSelected(hexGrid[1][2])
    replaceSelectedHex('brood')
    hexGrid[1][2].setContents('egg')
  }  
}
