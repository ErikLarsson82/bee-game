
function animateSprite(sprite, resource, amount, w, h, _loop, callback, _timelocked) {
	const frame = new Sprite()

    const spritesheet = new PIXI.BaseTexture.from(resources[resource].url)
	const frames = []

    for (let i = 0; i < amount; i++) {
        frames.push(
            new PIXI.Texture(spritesheet, new PIXI.Rectangle(i * w, 0, w, h))
        )
    }

	let delay = 0
    let pause = false
    const loop = _loop === undefined ? true : _loop
    const timelocked = _timelocked === undefined ? false : _timelocked
	const frameDurationModifier = 0.1
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
        },
        isRunning: () => {
            return !pause
        }
    }

    addTicker('game-stuff', () => {
        if (pause) return
    	delay += timelocked ? 1 : gameSpeed
    	if (delay >= MOD * amount) {
            if (loop) {
                delay = 0
            } else {
                handler.pause()
                callback && callback()
            }
        }
    	const currentFrame = Math.min(Math.max(0, Math.floor(delay / MOD)), amount)
        frame.texture = frames[currentFrame]
    })

    sprite.addChild(frame)
    return handler
}