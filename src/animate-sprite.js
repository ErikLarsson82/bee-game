
function animateSprite(sprite, name, amount) {
	const frame = Sprite.fromImage(`images/animation-test/${name}/1.png`)
	frame.position.x = 20

	let delay = 0
	const frameDurationModifier = 0.1
	const FPS = 60 // assume this
	const MOD = FPS * frameDurationModifier

    addTicker('game-stuff', () => {
    	delay += gameSpeed
    	if (delay >= MOD * amount) delay = 0
    	const currentFrame = Math.max(1, Math.ceil(delay / MOD))
    	frame.texture = Texture.fromImage(`images/animation-test/${name}/${currentFrame}.png`)
    	// console.log(delay)
    })

    sprite.addChild(frame)
}