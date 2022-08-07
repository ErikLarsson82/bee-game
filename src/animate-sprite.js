
function animateSprite(sprite, name, amount, _loop, callback) {
	const frame = Sprite.fromImage(`images/animation-test/${name}/1.png`)
	
	let delay = 0
    let pause = false
    const loop = _loop === undefined ? true : _loop
	const frameDurationModifier = 0.1
	const FPS = 60 // assume this
	const MOD = FPS * frameDurationModifier

    const handler = {
        sprite: frame,
        restart: () => {
            delay = 0
            return handler
        },
        start: () => {
            pause = false
            return handler
        },
        pause: () => {
            pause = true
            return handler
        }
    }

    addTicker('game-stuff', () => {
        if (pause) return
    	delay += gameSpeed
    	if (delay >= MOD * amount) {
            if (loop) {
                delay = 0
            } else {
                handler.pause()
                callback && callback()
            }
        }
    	const currentFrame = Math.min(Math.max(1, Math.ceil(delay / MOD)), amount)
        frame.texture = Texture.fromImage(`images/animation-test/${name}/${currentFrame}.png`)
    })

    sprite.addChild(frame)
    return handler
}