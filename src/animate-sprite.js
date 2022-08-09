
function animateSprite(sprite, res, amount, w, h, _loop, callback) {
	const frame = new Sprite()

    const spritesheet = new PIXI.BaseTexture.from(resources[res].url)
	const frames = []

    for (let i = 0; i < amount; i++) {
        frames.push(
            new PIXI.Texture(spritesheet, new PIXI.Rectangle(i * w, 0, w, h))
        )
    }

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
    	const currentFrame = Math.min(Math.max(0, Math.floor(delay / MOD)), amount)
        frame.texture = frames[currentFrame]
    })

    sprite.addChild(frame)
    return handler
}