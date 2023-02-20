
function gameloop(delta, manualTick) {
  const newTickers = tickers.filter(ticker => ticker.remove === false)
  if (tickers.length > newTickers.length) {
    tickers = tickers.filter(ticker => ticker.remove === false)
  }

  tickers.filter(isUI).forEach(ticker => ticker.func())

  if (selected && selected.panelContent) {
    const { x, y } = selected.panelPosition && selected.panelPosition() || { x: 350, y: 100 }
    panel.position.x = x
    panel.position.y = y
  }

  const aliveBees = bees.filter(bee => !bee.isDead() && bee.type !== 'bookie')

  gameover = isGameOver(currentCycleIndex, aliveBees)

  if (gameover) {
    paused = true
  }

  if (paused && !manualTick) return
  
  tickers.filter(isGameStuff).forEach(ticker => ticker.func())

  {
    // Time management
    hour += transferTo(24).inMinutes(5)

    if (hour > 24) {
      hour = 0
      day++
      currentCycle--
      if (currentCycle === 0) {
        currentCycleIndex++
        currentCycle = cycles[currentCycleIndex]
        currentSeasonLength = currentCycle
        previousSeasonLength = cycles[currentCycleIndex-1]
        season = season === 'summer' ? 'winter' : 'summer'
        sun.mouseup()
        if (season === 'summer') {
          backgroundScene.texture = Texture.fromImage('images/scene/background-summer.png')        
          year++
          day = 1
          createFlowers()
          sun.winterSun.visible = false
          sun.summerSun.visible = true
        } else {
          backgroundScene.texture = Texture.fromImage('images/scene/background-winter.png')
          killFlowers()
          killBroodlings()
          sun.winterSun.visible = true
          sun.summerSun.visible = false
        }
      }
    }
  }
}
