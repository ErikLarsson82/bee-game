let MAP_CONFIGURATIONS = [
  {
    name: 'Level 1 - Green fields',
    cycles: [5, 2, 5, 2, 5, 2, 4, 3, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 16, 16, 18, 18, 20, 20, 24, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    seeds: 1,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-summer',
    blizzardWinter: false,
    backgroundColor: 0x2ce8f5,
    init: (parent) => {
      // I enjoy this one (pro level)
      createBee(parent, 'idle').setHunger(40)
      createBee(parent, 'idle').setHunger(42)
      createBee(parent, 'idle').setHunger(50)
      createBee(parent, 'idle').setHunger(80)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)

      replaceHex([5, 7], 'prepared', 'activate').instantlyPrepare()
      replaceHex([6, 7], 'prepared', 'activate').instantlyPrepare()
      replaceHex([6, 10], 'prepared', 'activate').instantlyPrepare()
      replaceHex([7, 9], 'prepared', 'activate').instantlyPrepare()
      
      replaceHex([5, 8], 'honey', 'activate').setHoney(30)
      replaceHex([6, 8], 'wax', 'activate')
      replaceHex([6, 9], 'wax', 'activate')
      replaceHex([7, 8], 'honey', 'activate').setHoney(30)
    }
  },
  {
    name: 'Level 2 - Green gone cold',
    cycles: [4, 2, 4, 2, 4, 2, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3],
    seeds: 3,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-summer-cold',
    blizzardWinter: false,
    backgroundColor: 0x2ce8f5,
    init: (parent) => {
      createBee(parent, 'idle').setHunger(40)
      createBee(parent, 'idle').setHunger(42)
      createBee(parent, 'idle').setHunger(50)
      createBee(parent, 'idle').setHunger(80)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)
      createBee(parent, 'idle').setHunger(100)

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
  },
  {
    name: 'Level 3 - Desert haze',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 3,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-desert',
    blizzardWinter: false,
    backgroundColor: 0x2ce8f5,
    init: (parent) => {
      createBee(parent, 'idle').setHunger(60)
      createBee(parent, 'idle').setHunger(70)
      createBee(parent, 'idle').setHunger(80)
      
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
  },
  {
    name: 'Level 4 - Blizzard winter',
    id: 'corner start',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1],
    seeds: 1,
    winterHungerMultiplier: 5,
    backgroundImage: 'background-hurricane',
    blizzardWinter: true,
    backgroundColor: 0x2ce8f5,
    init: (parent) => {
      for (let i = 0; i < 6; i++) {
        createBee(parent, 'idle').setAge(0)
      }
      replaceHex([5, 4], 'honey', 'activate').setHoney(15)
      replaceHex([4, 4], 'honey', 'activate').setHoney(30)
      replaceHex([0, 8], 'prepared', 'activate').instantlyPrepare()
      replaceHex([0, 9], 'prepared', 'activate').instantlyPrepare()
    }
  },
  /*
  {
    // Give players many many empty hexagons to choose from
    name: 'Experiment: - Many empty hex',
    id: 'honey benchmark far',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1, 3, 1],
    seeds: 1,
    winterHungerMultiplier: 4,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  },
  {
    // Give players lots of resources at the start, but have winters be pretty punishing
    name: 'Experiment: Generous start - punishing',
    id: 'generous start',
    cycles: [5, 2, 5, 2, 5, 2, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3, 5, 3],
    seeds: 4,
    winterHungerMultiplier: 4,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  },
  {
    // Bees are VERY hungry during winter, albeit they are short - this one could be considered a very hard map, especially to get far
    name: 'Experiment: Hunger winter - escalating',
    id: 'corner start',
    cycles: [3, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 3, 3, 3, 3, 4, 3, 4, 3, 5, 3, 6, 3, 7, 3, 8, 3, 9, 3, 10, 3, 11],
    seeds: 2,
    winterHungerMultiplier: 5,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  },
  {
    // Not much to start with and winter coming fast
    name: 'Experiment: Fast winter',
    id: 'fast winter',
    cycles: [1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    seeds: 1,
    winterHungerMultiplier: 1,
    backgroundImage: 'background-unknown',
    blizzardWinter: false
  }
  */
  {
    // Give players many many empty hexagons to choose from
    name: 'Playground',
    cycles: [2, 1, 5, 2, 5, 2, 4, 3, 4, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 16, 16, 18, 18, 20, 20, 24, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    seeds: 1,
    winterHungerMultiplier: 4,
    backgroundImage: 'background-unknown',
    blizzardWinter: false,
    backgroundColor: 0x2ce8f5,
    init: (parent) => {
      const m = 'test brood' //    <------ here

      if (m === 'test brood') {
        // I want this to be the beginner level
        createBee(parent, 'idle').setHunger(40).setWax(100)
        createBee(parent, 'idle').setHunger(42)
        createBee(parent, 'idle').setHunger(50)
        createBee(parent, 'idle').setHunger(80)
        createBee(parent, 'idle').setHunger(100)
        createBee(parent, 'idle').setHunger(100)
        createBee(parent, 'idle').setHunger(100)

        /*
        for (let i = 0; i < hexGrid.length-2; i++) {
          for (let j = 0; j < hexGrid[0].length; j++) {
            replaceHex([j, i], 'prepared', 'activate').instantlyPrepare()
          }
        }
        */

        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            replaceHex([j, i], 'prepared', 'activate').instantlyPrepare()
          }
        }

        /*
        for (let i = 5; i < 10; i++) {
          for (let j = 5; j < 10; j++) {
            replaceHex([i, j], 'brood', 'activate').setContents('puppa')
          }
        }
        */

        /*
        for (let i = 10; i < 12; i++) {
          for (let j = 5; j < 10; j++) {
            replaceHex([i, j], 'honey', 'activate').setHoney(30)
          }
        }
        */

        /*
        for (let i = 2; i < 4; i++) {
          for (let j = 8; j < 12; j++) {
            replaceHex([i, j], 'pollen', 'activate').setPollen(100)
          }
        }
        */
        // replaceHex([7, 7], 'brood', 'activate').setContents('puppa')

        /*
        replaceHex([2, 2], 'honey', 'activate').setHoney(45)
        replaceHex([2, 3], 'honey', 'activate').setHoney(45)
        replaceHex([3, 2], 'honey', 'activate').setHoney(45)
        */
        replaceHex([3, 3], 'wax', 'activate').setWax(1)

        replaceHex([2+4, 2], 'nectar', 'activate').setNectar(30)
        replaceHex([2+4, 3], 'nectar', 'activate').setNectar(30)
        replaceHex([3+4, 2], 'nectar', 'activate').setNectar(30)
        replaceHex([3+4, 3], 'nectar', 'activate').setNectar(30)
        
        return
      }

      if (m === 'beginner') {
        // I want this to be the beginner level
        createBee(parent, 'idle').setHunger(40).setAge(80)
        createBee(parent, 'idle').setHunger(42).setAge(60)
        createBee(parent, 'idle').setHunger(50).setAge(20)
        createBee(parent, 'idle').setHunger(80).setAge(10)
        createBee(parent, 'idle').setHunger(100).setAge(6)
        createBee(parent, 'idle').setHunger(100).setAge(5)
        createBee(parent, 'idle').setHunger(100).setAge(0)

        replaceHex([5, 7], 'prepared', 'activate').instantlyPrepare()
        replaceHex([6, 7], 'prepared', 'activate').instantlyPrepare()
        replaceHex([6, 10], 'prepared', 'activate').instantlyPrepare()
        replaceHex([7, 9], 'prepared', 'activate').instantlyPrepare()
        
        replaceHex([5, 8], 'honey', 'activate').setHoney(30)
        replaceHex([6, 8], 'wax', 'activate')
        replaceHex([6, 9], 'wax', 'activate')
        replaceHex([7, 8], 'honey', 'activate').setHoney(30)
        return
      }

      if (m === 'old default') {
        createBee(parent, 'idle').setHunger(40).setAge(80)
        createBee(parent, 'idle').setHunger(42).setAge(60)
        createBee(parent, 'idle').setHunger(50).setAge(20)
        createBee(parent, 'idle').setHunger(80).setAge(10)
        createBee(parent, 'idle').setHunger(100).setAge(6)
        createBee(parent, 'idle').setHunger(100).setAge(5)
        createBee(parent, 'idle').setHunger(100).setAge(0)

        replaceHex([0, 0], 'prepared', 'activate').instantlyPrepare()
        replaceHex([0, 8], 'prepared', 'activate').instantlyPrepare()
        replaceHex([8, 0], 'prepared', 'activate').instantlyPrepare()
        replaceHex([8, 8], 'prepared', 'activate').instantlyPrepare()
        
        replaceHex([5, 4], 'honey', 'activate').setHoney(30)
        replaceHex([3, 4], 'honey', 'activate').setHoney(30)
        replaceHex([4, 4], 'wax', 'activate')
        replaceHex([4, 5], 'wax', 'activate')
        return
      }

      if (m === 'many empty') {
        createBee(parent, 'idle').setHunger(60).setAge(40)
        createBee(parent, 'idle').setHunger(70).setAge(30)
        createBee(parent, 'idle').setHunger(80).setAge(20)
        createBee(parent, 'idle').setHunger(90).setAge(10)
        createBee(parent, 'idle').setHunger(100).setAge(0)
        
        for (let i = 2; i <= 10; i++) {
          for (var j = 3; j <= 12; j++) {
            replaceHex([i, j], 'prepared', 'activate').instantlyPrepare()
          }
        }
        return
      }

      if (m === 'mini') {
        createBee(parent, 'idle').setHunger(20).setAge(80).setNectar(60).setPollen(30) //.setHoney(30)
        
        replaceHex([4, 5], 'nectar', 'activate')
        replaceHex([4, 6], 'pollen', 'activate')
        replaceHex([4, 7], 'honey', 'activate')
        return
      }

      if (m === 'plenty honey') {
        createBee(parent, 'idle').setHunger(40).setAge(80)
        createBee(parent, 'idle').setHunger(42).setAge(60)
        createBee(parent, 'idle').setHunger(50).setAge(20)
        createBee(parent, 'idle').setHunger(80).setAge(10)
        createBee(parent, 'idle').setHunger(100).setAge(6)
        createBee(parent, 'idle').setHunger(100).setAge(5)
        createBee(parent, 'idle').setHunger(100).setAge(0)

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
        return
      }

      if (m === 'fast winter') {
        createBee(parent, 'idle').setHunger(100).setAge(20)
        createBee(parent, 'idle').setHunger(100).setAge(10)
        createBee(parent, 'idle').setHunger(100).setAge(6)
        createBee(parent, 'idle').setHunger(100).setAge(5)
        createBee(parent, 'idle').setHunger(100).setAge(0)
        
        replaceHex([4, 7], 'prepared', 'activate').instantlyPrepare()
        replaceHex([5, 7], 'prepared', 'activate').instantlyPrepare()
        replaceHex([5, 8], 'prepared', 'activate').instantlyPrepare()
        replaceHex([6, 7], 'prepared', 'activate').instantlyPrepare()
        return
      }

      if (m === 'all') {
        seeds = 2
        createBee(parent, 'idle').setHunger(40).setAge(80)
        
        for (let i = 0; i < hexGrid.length; i++) {
          for (let j = 0; j < hexGrid[0].length; j++) {
            replaceHex([j, i], 'prepared', 'activate').instantlyPrepare()
          }
        }
        return
      }

      if (m === 'die') {
        seeds = 2
        createBee(parent, 'idle').setHunger(1).setPollen(60)
        return
      }

      if (m === 'loe') {
        seeds = 2
        createBee(parent, 'idle').setHunger(40).setAge(80).setWax(10)
        createBee(parent, 'idle').setHunger(42).setAge(60).setWax(10)
        createBee(parent, 'idle').setHunger(50).setAge(20).setWax(10)
        createBee(parent, 'idle').setHunger(80).setAge(10).setWax(10)
        createBee(parent, 'idle').setHunger(100).setAge(6).setWax(10)
        createBee(parent, 'idle').setHunger(100).setAge(5).setWax(10)
        createBee(parent, 'idle').setHunger(100).setAge(0).setWax(10)

        replaceHex([4, 4], 'wax', 'activate')
        replaceHex([4, 5], 'wax', 'activate')
        replaceHex([5, 4], 'honey', 'activate').setHoney(30)
        replaceHex([3, 4], 'honey', 'activate').setHoney(30)
        replaceHex([4, 5], 'prepared', 'activate').instantlyPrepare()
        replaceHex([4, 3], 'prepared', 'activate').instantlyPrepare()
        return
      }

      if (m === 'die test') {
        createBee(parent, 'idle').setHunger(60).setAge(99.8)
        createBee(parent, 'idle').setHunger(60).setAge(99.7)
        createBee(parent, 'idle').setHunger(40).setAge(70 - 20)
        
        replaceHex([2, 2], 'wax', 'activate')
        replaceHex([2, 3], 'honey', 'activate').setHoney(30)
        return
      }

      if (m === 'stress') {
        seeds = 100

        for (let i = 0; i <100; i++) {
          createBee(parent, 'forager') //.setPollen(30)
        }
        for (let i = 0; i <100; i++) {
          createBee(parent, 'nurser')
        }
        for (let i = 0; i <100; i++) {
          createBee(parent, 'worker')
        }
        
        for (let x = 0; x < 5; x++) {
          for (let y = 0; y < 5; y++) {
            const type = ['pollen', 'honey', 'wax', 'brood', 'nectar'][Math.floor(Math.random()*5)]
            replaceHex([x, y], type, 'activate')
            // replaceSelectedHex(type)
            //activateAdjacent(x, y)  
          }
        }
        return
      }

      if (m === 'kill brood') {
        createBee(parent, 'nurser')
        createBee(parent, 'nurser')
        createBee(parent, 'nurser')
        
        replaceHex([1, 1], 'nectar', 'activate').setNectar(15)
        replaceHex([1, 2], 'pollen', 'activate').setPollen(120)
        
        replaceHex([2, 2], 'brood', 'activate')
        replaceHex([3, 2], 'brood', 'activate')
        replaceHex([4, 2], 'brood', 'activate')

        replaceHex([2, 4], 'brood', 'activate')
        replaceHex([3, 4], 'brood', 'activate')
        replaceHex([4, 4], 'brood', 'activate')
        return
      }

      if (m === 'playtest') {
        createBee(parent, 'nurser')
        createBee(parent, 'forager')
        createBee(parent, 'worker')

        replaceHex([0, 0], 'honey', 'activate')
        replaceHex([1, 0], 'pollen', 'activate')
        replaceHex([2, 0], 'nectar', 'activate')
        replaceHex([3, 0], 'brood', 'activate')
        return
      }

      if (m === 'deposit nectar sceanrio') {
        createBee(parent, 'forager').setNectar(18)
        createBee(parent, 'worker').setHunger(20)
        replaceHex([0, 1], 'nectar', 'activate')
        return
      }

      if (m === 'deposit honey sceanrio') {
        createBee(parent, 'worker').setHoney(20)
        replaceHex([0, 1], 'honey', 'activate')
        return
      }


      if (m === 'converter sceanrio') {
        createBee(parent, 'worker').setHunger(20)

        replaceHex([0, 1], 'honey', 'activate')
        replaceHex([0, 1], 'nectar', 'activate').setNectar(15)
        return
      }

      if (m === 'brooder scenario') {
        // Things are prepared with pollen so you can breed directly
        createBee(parent, 'nurser').setPollen(20)
        createBee(parent, 'forager').setPollen(20)
        
        replaceHex([0, 0], 'honey', 'activate')

        replaceHex([2, 0], 'pollen', 'activate').setPollen(hexGrid[2][0].POLLEN_HEX_CAPACITY)
        
        replaceHex([3, 0], 'pollen', 'activate').setPollen(hexGrid[3][0].POLLEN_HEX_CAPACITY)
        
        replaceHex([1, 2], 'brood', 'activate').setContents('egg')
        return
      }

      // Benchmarks
      if (m === 'brood benchmark') {
        createBee(parent, 'nurser').setHunger(100)
        
        replaceHex([5, 4], 'honey', 'activate').setHoney(30)
        replaceHex([3, 4], 'brood', 'activate')
        replaceHex([4, 4], 'pollen', 'activate').setPollen(100)
        return
      }

      if (m === 'honey benchmark close') {
        createBee(parent, 'forager').setHunger(100)
        createBee(parent, 'worker').setHunger(100)
        
        replaceHex([0, 7], 'honey', 'activate').setHoney(0)
        replaceHex([0, 8], 'honey', 'activate').setHoney(0)
        replaceHex([1, 7], 'pollen', 'activate').setPollen(0)
        replaceHex([0, 9], 'nectar', 'activate')
        return
      }

      if (m === 'honey benchmark far') {
        createBee(parent, 'forager').setHunger(100) //.setHoney(200).setNectar(200).setPollen(200).setWax(200)
        createBee(parent, 'worker').setHunger(100)
        
        replaceHex([9, 0], 'honey', 'activate').setHoney(0)
        replaceHex([11, 0], 'honey', 'activate').setHoney(0)
        replaceHex([10, 0], 'pollen', 'activate').setPollen(0)
        replaceHex([11, 1], 'nectar', 'activate')
        return
      }
    }
  }
]
