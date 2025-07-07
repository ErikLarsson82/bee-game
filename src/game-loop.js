import { Texture } from 'pixi.js'
import { isGameOver, transferTo, killBroodlings, freezeNectar } from './exported-help-functions'
import {
  selected,
  bees,
  gameover,
  setGameover,
  paused,
  setPaused,
  hour,
  setHour,
  day,
  setDay,
  year,
  setYear,
  season,
  setSeason,
  currentCycle,
  setCurrentCycle,
  currentCycleIndex,
  setCurrentCycleIndex,
  cycles,
  setCurrentSeasonLength,
  setPreviousSeasonLength,
  setGameSpeed,
  tickers,
  setTickers,
  statisticsNectarCollected,
  setStatisticsNectarCollected,
  statisticsHoneyProduced,
  setStatisticsHoneyProduced,
} from './game/game-state'
import { panel, backgroundScene, sun } from './game/pixi-elements'
import { createFlowers, resolveWinterFlowers } from './single-function-files/create-flowers'

function isUI (ticker) {
  return ticker.type === 'ui'
}

function isGameStuff (ticker) {
  return ticker.type === 'game-stuff'
}

export function gameloop (delta, manualTick) {
  const newTickers = tickers.filter(ticker => ticker.remove === false)
  if (tickers.length > newTickers.length) {
    setTickers(tickers.filter(ticker => ticker.remove === false))
  }

  tickers.filter(isUI).forEach(ticker => ticker.func())

  if (selected && selected.panelContent) {
    const { x, y } = (selected.panelPosition && selected.panelPosition()) || { x: 350, y: 100 }
    panel.position.x = x
    panel.position.y = y
  }

  const aliveBees = bees.filter(bee => !bee.isDead() && bee.type !== 'bookie')

  setGameover(isGameOver(aliveBees))

  if (gameover) {
    setPaused(true)
  }

  if (paused && !manualTick) return

  tickers.filter(isGameStuff).forEach(ticker => ticker.func())

  // eslint-disable-next-line no-lone-blocks
  {
    // Time management
    setHour(hour + transferTo(24).inMinutes(5))

    if (hour > 24) {
      setHour(0)
      setDay(day + 1)
      setCurrentCycle(currentCycle - 1)
      if (currentCycle === 0) {
        setCurrentCycleIndex(currentCycleIndex + 1)
        setCurrentCycle(cycles[currentCycleIndex])
        setCurrentSeasonLength(currentCycle)
        setPreviousSeasonLength(cycles[currentCycleIndex - 1])
        setSeason(season === 'summer' ? 'winter' : 'summer')
        if (season === 'summer') {
          setGameSpeed(1)
          backgroundScene.texture = Texture.fromImage('background-summer.png')
          setYear(year + 1)
          setDay(1)
          createFlowers()
          sun.winterSun.visible = false
          sun.summerSun.visible = true
        } else {
          console.log(`Honey produced ${statisticsHoneyProduced.toFixed(0)} - Nectar collected ${statisticsNectarCollected.toFixed(0)}`)
          setStatisticsNectarCollected(0)
          setStatisticsHoneyProduced(0)
          backgroundScene.texture = Texture.fromImage('background-winter.png')
          resolveWinterFlowers()
          killBroodlings()
          freezeNectar()
          sun.winterSun.visible = true
          sun.summerSun.visible = false
        }
      }
    }
  }
}
