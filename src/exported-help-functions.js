export function addTicker (type, func) {
  const id = generateRandomId()
  const tickerObject = {
    id,
    type,
    func,
    remove: false
  }
  window.tickers.push(tickerObject)
  return tickerObject
}

export function cap (min, max) {
  return (value) => Math.max(Math.min(max, value), min)
}

function generateRandomId () {
  const chars = 'abcdefghijklmnopqrstuvx'
  let str = ''
  for (let i = 0; i < 20; i++) {
    str += chars[Math.floor(Math.random() * (chars.length - 1))]
  }
  return str + '_' + Math.random()
}
