import { gameover, paused, setPaused, setGameSpeed } from './game/game-state'
import { gameloop } from './game-loop'

window.addEventListener('keydown', e => {
  if (gameover) return

  // Space
  if (e.keyCode === 32) {
    setPaused(!paused)
  }

  // T, for gameTick
  if (e.keyCode === 84) {
    gameloop(16.66, true)
  }

  // 1
  if (e.keyCode === 49) {
    setGameSpeed(1)
    setPaused(false)
  }

  // 2
  if (e.keyCode === 50) {
    setGameSpeed(4)
    setPaused(false)
  }

  // 2
  if (e.keyCode === 51) {
    setGameSpeed(8)
    setPaused(false)
  }

  // 3
  if (e.keyCode === 52) {
    setGameSpeed(64)
    setPaused(false)
  }

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
