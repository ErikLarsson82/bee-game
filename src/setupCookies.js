
let gameStorage = null

const COOKIE_NAME = 'bee-game-v1'
const cookieGet = Cookies.get(COOKIE_NAME)

if (cookieGet === undefined) {
	gameStorage = {
		progress: [],
		lastPlayedLevel: -1
	}
	persistCookie()
} else {
	gameStorage = JSON.parse(cookieGet)
}

function persistCookie() {
	Cookies.set(COOKIE_NAME, JSON.stringify(gameStorage))
}

function saveProgress(levelFinished, _year) {
	const existingProgress = gameStorage.progress.find(({ levelIdx }) => levelIdx === levelFinished)
	if (existingProgress && existingProgress.year > _year) return
	gameStorage.progress = gameStorage.progress.filter(({ levelIdx }) => levelIdx !== levelFinished)

	gameStorage.progress.push({
		levelIdx: levelFinished,
		year: _year
	})
	persistCookie()
}

function getLevelProgress(index) {
	const level = gameStorage.progress.find(({ levelIdx }) => levelIdx === index)

	if (!level) {
		return -1
	}
	return level.year
}

function setLastPlayedLevel(idx) {
	gameStorage.lastPlayedLevel = idx
	persistCookie()
}

function getLastPlayedLevel() {
	return gameStorage.lastPlayedLevel
}

function resetCookies() {
	Cookies.remove(COOKIE_NAME)
}