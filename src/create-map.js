
function createMap(m) {
  createQueen(beeContainer)
   
  if (m === 'default') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    
    return
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
  }

  if (m === 'all') {
    seeds = 2
    createBee(beeContainer, 'idle').setHunger(40).setAge(80)
    
    for (let i = 0; i < hexGrid.length; i++) {
      for (let j = 0; j < hexGrid[0].length; j++) {
        replaceHex([i, j], 'prepared', 'activate').instantlyPrepare()
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
        const type = ['pollen', 'honey', 'wax', 'brood', 'converter'][Math.floor(Math.random()*5)]
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
    replaceSelectedHex('converter').setNectar(15)
    setSelected(hexGrid[0][1])
    replaceSelectedHex('pollen').setPollen(120)
    setSelected(hexGrid[0][2])

    setSelected(hexGrid[2][2])
    replaceSelectedHex('brood')
    setSelected(hexGrid[2][3])
    replaceSelectedHex('brood')
    setSelected(hexGrid[2][4])
    replaceSelectedHex('brood')

    setSelected(hexGrid[4][2])
    replaceSelectedHex('brood')
    setSelected(hexGrid[4][3])
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
    setSelected(hexGrid[0][1])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][2])
    replaceSelectedHex('converter')
    setSelected(hexGrid[0][3])
    replaceSelectedHex('brood')
  }

  if (m === 'pollination scenario') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager')
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[0][1])
    replaceSelectedHex('converter')
  }

  if (m === 'honey-deposits') {
    createBee(beeContainer, 'nurser')
    createBee(beeContainer, 'forager').setPollen(20)
    createBee(beeContainer, 'worker')

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(60)
    setSelected(hexGrid[0][1])
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
    setSelected(hexGrid[0][1])
    replaceSelectedHex('honey')
    setSelected(hexGrid[0][2])
    replaceSelectedHex('honey')

    setSelected(hexGrid[1][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[2][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[3][0])
    replaceSelectedHex('pollen')
    setSelected(hexGrid[4][0])
    replaceSelectedHex('pollen')

    setSelected(hexGrid[0][3])
    replaceSelectedHex('converter').setNectar(15)
    setSelected(hexGrid[0][4])
    replaceSelectedHex('converter')
  }


  if (m === 'deposit nectar sceanrio') {
    createBee(beeContainer, 'forager').setNectar(18)
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('converter')
  }

  if (m === 'deposit honey sceanrio') {
    createBee(beeContainer, 'worker').setHoney(20)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('honey')
  }


  if (m === 'converter sceanrio') {
    createBee(beeContainer, 'worker').setHunger(20)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey').setHoney(0)

    setSelected(hexGrid[1][0])
    replaceSelectedHex('converter').setNectar(15)
  }

  if (m === 'brooder scenario') {
    // Things are prepared with pollen so you can breed directly
    createBee(beeContainer, 'nurser').setPollen(20)
    createBee(beeContainer, 'forager').setPollen(20)
    createQueen(beeContainer)

    setSelected(hexGrid[0][0])
    replaceSelectedHex('honey')

    setSelected(hexGrid[0][2])
    replaceSelectedHex('pollen')
    hexGrid[0][2].pollen = hexGrid[0][2].POLLEN_HEX_CAPACITY
    
    setSelected(hexGrid[0][3])
    replaceSelectedHex('pollen')
    hexGrid[0][3].pollen = hexGrid[0][3].POLLEN_HEX_CAPACITY   

    setSelected(hexGrid[2][1])
    replaceSelectedHex('brood')
    hexGrid[2][1].setContents('egg')
  }  

  setSelected(null)
}
