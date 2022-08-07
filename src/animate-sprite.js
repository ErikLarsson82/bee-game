
function animateSprite(sprite, name, amount) {
	const frame = Sprite.fromImage(`images/animation-test/${name}/1.png`)
	frame.position.x = 20

	let delay = 0
    let pause = false
	const frameDurationModifier = 0.1
	const FPS = 60 // assume this
	const MOD = FPS * frameDurationModifier

    addTicker('game-stuff', () => {
        if (pause) return
    	delay += gameSpeed
    	if (delay >= MOD * amount) delay = 0
    	const currentFrame = Math.max(1, Math.ceil(delay / MOD))
    	frame.texture = Texture.fromImage(`images/animation-test/${name}/${currentFrame}.png`)
    })

    sprite.addChild(frame)

    const obj = {
        sprite: frame,
        restart: () => {
            delay = 0
            return obj
        },
        start: () => {
            pause = false
            return obj
        },
        pause: () => {
            pause = true
            return obj
        }
    }
    return obj
}