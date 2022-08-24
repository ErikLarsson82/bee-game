
window.addEventListener('keydown', e => {
  if (scene !== 'game') return;

  //Space
  if (e.keyCode === 32) {
    paused = !paused
  }

  //T, for gameTick
  // if (e.keyCode === 84) {
  //   gameloop(16.66, true)
  // }

  // // 1
  // if (e.keyCode === 49) {
  //   gameSpeed = 1
  //   paused = false
  // }

  // // 2
  // if (e.keyCode === 50) {
  //   gameSpeed = 4
  //   paused = false
  // }

  // // 2
  // if (e.keyCode === 51) {
  //   gameSpeed = 8
  //   paused = false
  // }

  // // 3
  // if (e.keyCode === 52) {
  //   gameSpeed = 64
  //   paused = false
  // }

  /*
  // enter
  if (e.keyCode === 13) {
    for (let i = 0; i < 100; i++) {
      createBee(beeContainer, 'idle').setHunger(0.01).setPollen(60)
    }
  }

  // a
  if (e.keyCode === 65) {
    createBee(beeContainer, 'idle').setHunger(0.01).setPollen(60)
  }
  */
})
