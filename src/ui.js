
function ProgressBar(x, y, type, tickerData, max) {
  const progressSprite = Sprite.fromImage('images/ui/progress-bar/progress-' + type + '.png')
  progressSprite.position.x = x
  progressSprite.position.y = y
  addTicker('ui', time => {
    const _max = max === undefined ? 100 : max
    progressSprite.width = cap(0, _max)((tickerData() / max) * 20)
  })
  return progressSprite
}

function Button(x, y, content, callback, hoverover, hoverout, _size) {
  const size = _size === undefined ? 'standard' : _size
  const buttonSprite = Sprite.fromImage(`images/ui/button-${size}/button-${size}-standard.png`)
  let swallow = false
  buttonSprite.position.x = x
  buttonSprite.position.y = y
  buttonSprite.interactive = true
  buttonSprite.buttonMode = true
  buttonSprite.mouseover = () => {
    hoverover && hoverover()
    buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-hover.png`)
  }
  buttonSprite.mouseout = () => {
    hoverout && hoverout()
    buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-standard.png`)
  }
  buttonSprite.mouseup = () => {
    if (swallow) return
    swallow = true
    buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-click.png`)
    setTimeout(() => {
      callback()
      swallow = false
      buttonSprite.texture = Texture.fromImage(`images/ui/button-${size}/button-${size}-hover.png`)
    }, 50)
  }

  if (typeof content === 'string') {
    const buttonText = new PIXI.Text(content, { ...picoFontConfig, ...smallFont })
    buttonText.position.x = 7
    buttonText.position.y = 3
    buttonSprite.addChild(buttonText)    
  } else if (content !== undefined && content !== null) {
    buttonSprite.addChild(content)    
  }

  return buttonSprite
}
