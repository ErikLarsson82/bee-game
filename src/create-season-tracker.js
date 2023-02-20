
function createSeasonTracker() {
  const seasonTracker = Sprite.fromImage('images/ui/season-tracker/background.png')
  seasonTracker.position.x = 244
  seasonTracker.position.y = 2
  uiTopBar.addChild(seasonTracker)

  const seasonProgressBar = Sprite.fromImage('images/ui/season-tracker/bar-summer.png')
  const summerTexture = Texture.fromImage('images/ui/season-tracker/bar-summer.png')
  const winterTexture = Texture.fromImage('images/ui/season-tracker/bar-winter.png')
  seasonProgressBar.position.x = 1
  seasonProgressBar.position.y = 2
  seasonProgressBar.anchor.set(0, 0)
  seasonTracker.addChild(seasonProgressBar)

  addTicker('ui', time => {
    const maxWidth = 66
    const isSummer = season === 'summer'
    const currentDay = isSummer ? day - 1 : day - 1 - previousSeasonLength
    const dayFraction = maxWidth / currentSeasonLength
    const dayWidth = dayFraction * (currentDay)
    const hourFraction = dayFraction / 24
    seasonProgressBar.width = dayWidth + (hourFraction * hour)
    seasonProgressBar.position.x = 0
    seasonProgressBar.texture = isSummer
      ? summerTexture
      : winterTexture
  })
}