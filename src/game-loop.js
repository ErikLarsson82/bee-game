
function gameloop(delta, manualTick) {
  const newTickers = tickers.filter(ticker => ticker.remove === false)
  if (tickers.length > newTickers.length) {
    newTickers.filter(ticker => ticker.remove).forEach(ticker => {
      delete ticker
    })
    tickers = tickers.filter(ticker => ticker.remove === false)
  }

  tickers.filter(isUI).forEach(ticker => ticker.func());

  if (selected && selected.panelContent) {
    const { x, y } = selected.panelPosition && selected.panelPosition() || { x: 350, y: 100 }
    panel.position.x = x
    panel.position.y = y
  }

  if (paused && !manualTick) return
  
  tickers.filter(isGameStuff).forEach(ticker => ticker.func());

  {
    // Time management
    hour += transferTo(24).inMinutes(5)

    if (hour > 24) {
      hour = 0
      day++
      cycles[0]--
      if (cycles[0] === 0) {
        cycles = cycles.slice(1)
        season = season === 'summer' ? 'winter' : 'summer'
        if (season === 'summer') {
          backgroundScene.texture = Texture.fromImage('images/scene/background-summer.png')        
          year++
          day = 1
          createFlowers()
        } else {
          backgroundScene.texture = Texture.fromImage('images/scene/background-winter.png')
          killFlowers()
          killBroodlings()
        }
      }
    }
  }
}
