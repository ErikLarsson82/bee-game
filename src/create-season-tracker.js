
function createSeasonTracker() {
  let storedCycles = null
  let lastStoredCycle = null
  let summerDayOffset = null

  const seasonTracker = Sprite.fromImage('images/ui/season-tracker/background.png')
  seasonTracker.position.x = 384
  seasonTracker.position.y = 3
  uiTopBar.addChild(seasonTracker)

  const seasonTrackerLabel = new PIXI.Text('Loading', { ...picoFontConfig, fontSize: 4 })
  seasonTrackerLabel.position.x = 378
  seasonTrackerLabel.position.y = 13
  uiTopBar.addChild(seasonTrackerLabel)

  const summerProgress = Sprite.fromImage('images/ui/season-tracker/bar-summer.png')
  const summerTexture = Texture.fromImage('images/ui/season-tracker/bar-summer.png')
  const winterTexture = Texture.fromImage('images/ui/season-tracker/bar-winter.png')
  summerProgress.position.x = 1
  summerProgress.position.y = 1
  seasonTracker.addChild(summerProgress)
  
  addTicker('ui', time => {
    const isSummer = season === 'summer'
    if (lastStoredCycle !== cycles.length) {
      summerDayOffset = isSummer ? 0 : storedCycles
      storedCycles = cycles[0]
      lastStoredCycle = cycles.length
    }
    const maxWidth = 65
    const dayFraction = (day-1-summerDayOffset) / storedCycles
    const hourFraction = hour / (storedCycles * 24)
    summerProgress.width = maxWidth - (maxWidth * (dayFraction + hourFraction))
    const seasonLabel = isSummer ? 'Summer' : 'Winter'
    seasonTrackerLabel.text = `${seasonLabel} - ${singularOrPluralDay(cycles[0])}` 
    summerProgress.texture = isSummer
      ? summerTexture
      : winterTexture
  })
}
