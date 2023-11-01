let loadingDone = false

function setupDebugMenu() {
  scene = 'menu'
  document.body.style['background-color'] = '#fff6c5'
  
  let loading = true
  let hasClickedIdx = -1
  let hasClickedMap = null

  const container = new Container()
  container.scale.x = 2
  container.scale.y = 2
  app.stage.addChild(container)

  const splashscreen = new Graphics()
  splashscreen.beginFill(0xffd601)
  splashscreen.drawRect(0, 0, WIDTH, HEIGHT)
  container.addChild(splashscreen)

  const scaler = new Container()
  scaler.scale.x = 2
  scaler.scale.y = 2
  container.addChild(scaler)

  const versionLabel = new PIXI.Text(version, { ...fontConfig, ...smallFont, fill: 'black' })
  versionLabel.position.x = 375
  versionLabel.position.y = 310
  container.addChild(versionLabel)

  const loadingSecondLabel = new PIXI.Text('Loading', { fontFamily: 'verdana', fill: 'black', fontSize: 10 })
  loadingSecondLabel.position.x = 170
  loadingSecondLabel.position.y = 160
  loadingSecondLabel.alpha = 0
  container.addChild(loadingSecondLabel)

  const startGame = () => {
    loadMapParameters(hasClickedMap, hasClickedIdx)
    app.stage.removeChild(container)
    setupGame()
  }

  MAP_CONFIGURATIONS = MAP_CONFIGURATIONS.map((map, idx) => {
    const callback = () => {
      scaler.alpha = 0
      hasClickedIdx = idx
      hasClickedMap = map
      if (loading && !loadingDone) {
        loadingSecondLabel.alpha = 1
        return
      }
      startGame()
    }
    const button = Button(Math.round(WIDTH/2/2/2)-50, 10 + (idx * 14), map.name, callback, null, null, 'huge')
    scaler.addChild(button)

    return {
      callback,
      ...map,
    }
  })
  
  if (window.debugMap !== undefined)
    MAP_CONFIGURATIONS[0].callback()


  loader.on('progress', function(e) {
    loadingSecondLabel.text = `Loading ${e.progress.toFixed(0)} %`
  })
  loader.on('complete', function(e) {
    loading = false
    loadingDone = true
    if (hasClickedIdx !== -1) {
      startGame()
    }
  })

  if (loadingDone) {
    // We've already been here once, so don't load more assets
    return
  }
  // preload in game assets
  loader.add('images/hex/bread/cell-bee-bread.png')
  loader.add('images/hex/experiment/experiment1.png')
  loader.add('images/ui/button-jobs/button-plus.png')
  loader.add('images/ui/button-jobs/button-active-plus.png')
  loader.add('images/ui/button-jobs/button-hover-plus.png')
  loader.add('images/ui/button-jobs/button-minus.png')
  loader.add('images/ui/button-jobs/button-active-minus.png')
  loader.add('images/ui/button-jobs/button-hover-minus.png')
  loader.add('images/ui/button-standard/button-standard-standard.png')
  loader.add('images/ui/button-large/button-large-standard.png')
  loader.add('images/ui/button-large/button-large-hover.png')
  loader.add('images/ui/button-large/button-large-click.png')
  loader.add('images/ui/button-large/button-large-content-delete.png')
  loader.add('images/ui/bonus-plus.png')
  loader.add('images/ui/bonus-minus.png')
  loader.add('images/scene/summer-sun.png')
  loader.add('images/scene/winter-sun.png')
  loader.add('images/scene/background-summer.png')
  loader.add('images/scene/background-summer-cold.png')
  loader.add('images/scene/background-desert.png')
  loader.add('images/scene/background-hurricane.png')
  loader.add('images/scene/background-unknown.png')
  loader.add('images/scene/sun-bubble.png')
  loader.add('images/drops/pixel-honey.png')
  loader.add('images/drops/pixel-nectar.png')
  loader.add('images/drops/pixel-wax.png')
  loader.add('images/drops/pixel-pollen.png')
  loader.add('images/bee/shadow.png')
  loader.add('images/buckets/honey.png')
  loader.add('images/buckets/nectar.png')
  loader.add('images/buckets/wax.png')
  loader.add('images/buckets/pollen.png')
  loader.add('images/bee/bee-drone-hand.png')
  loader.add('images/bee/bee-drone-legs.png')
  loader.add('images/exclamations/exclamation-warning-severe.png')
  loader.add('images/bee/bee-drone-body-idle.png')
  loader.add('images/bee/bee-drone-body-worker.png')
  loader.add('images/bee/bee-drone-body-nurser.png')
  loader.add('images/bee/bee-drone-body-forager.png')
  loader.add('images/ui/content-boilerplate.png')
  loader.add('images/bee/bee-drone-dead.png')
  loader.add('images/bee/bee-drone-wings.png')
  loader.add('images/bee/bee-drone-wings-flapped.png')
  loader.add('images/bee/bee-drone-legs-jerk.png')
  loader.add('images/bee/angel.png')
  loader.add('images/hex/states/cell-disabled.png')
  loader.add('images/hex/states/cell-blocked.png')
  loader.add('images/hex/states/cell-empty-background.png')
  loader.add('images/hex/states/cell-empty.png')
  loader.add('images/ui/button-large/button-large-content-prepare.png')
  loader.add('images/hex/states/cell-background.png')
  loader.add('images/ui/button-large/button-large-content-honey.png')
  loader.add('images/ui/button-large/button-large-content-brood.png')
  loader.add('images/ui/button-large/button-large-content-pollen.png')
  loader.add('images/ui/button-large/button-large-content-nectar.png')
  loader.add('images/ui/content-prepared.png')
  loader.add('images/ui/content-prepared-help.png')
  loader.add('images/hex/prepared/cell-prepared-complete.png')
  loader.add('images/hex/prepared/cell-prepared-partial1.png')
  loader.add('images/hex/prepared/cell-prepared-partial2.png')
  loader.add('images/hex/prepared/cell-prepared-partial3.png')
  loader.add('images/hex/prepared/cell-prepared-partial4.png')
  loader.add('images/hex/prepared/cell-prepared-partial5.png')
  loader.add('images/hex/prepared/cell-prepared-partial6.png')
  loader.add('images/hex/prepared/cell-prepared-partial7.png')
  loader.add('images/hex/prepared/cell-prepared-partial8.png')
  loader.add('images/hex/honey/cell-honey-empty.png')
  loader.add('images/hex/honey/cell-honey-full.png')
  loader.add('images/hex/honey/cell-honey-a.png')
  loader.add('images/hex/honey/cell-honey-b.png')
  loader.add('images/hex/honey/cell-honey-c.png')
  loader.add('images/hex/honey/cell-honey-d.png')
  loader.add('images/hex/honey/cell-honey-e.png')
  loader.add('images/ui/content-honey.png')
  loader.add('images/ui/content-honey-fill.png')
  loader.add('images/ui/content-wax-fill.png')
  loader.add('images/ui/content-nectar-fill.png')
  loader.add('images/ui/content-pollen-fill.png')
  loader.add('images/ui/content-brood-fill.png')
  loader.add('images/ui/content-brood-dead-fill.png')
  loader.add('images/ui/button-large/button-large-content-wax.png')
  loader.add('images/hex/wax/cell-wax-full.png')
  loader.add('images/hex/wax/cell-wax-a.png')
  loader.add('images/hex/wax/cell-wax-b.png')
  loader.add('images/hex/wax/cell-wax-c.png')
  loader.add('images/hex/wax/cell-wax-d.png')
  loader.add('images/hex/wax/cell-wax-e.png')
  loader.add('images/hex/wax/cell-wax-f.png')
  loader.add('images/hex/wax/cell-wax-empty.png')
  loader.add('images/ui/content-wax.png')
  loader.add('images/ui/content-nectar.png')
  loader.add('images/ui/button-large/button-large-content-upgrade-a.png')
  loader.add('images/hex/nectar/cell-nectar-ice.png')
  loader.add('images/hex/nectar/cell-nectar-full.png')
  loader.add('images/hex/nectar/cell-nectar-a.png')
  loader.add('images/hex/nectar/cell-nectar-b.png')
  loader.add('images/hex/nectar/cell-nectar-c.png')
  loader.add('images/hex/nectar/cell-nectar-d.png')
  loader.add('images/hex/nectar/cell-nectar-e.png')
  loader.add('images/hex/nectar/cell-nectar-empty.png')
  loader.add('images/hex/brood/cell-brood-empty.png')
  loader.add('images/hex/brood/cell-brood-egg.png')
  loader.add('images/hex/brood/cell-brood-disabled.png')
  loader.add(`images/hex/brood/cell-brood-larvae-fat.png`)
  loader.add(`images/hex/brood/cell-brood-larvae-medium.png`)
  loader.add(`images/hex/brood/cell-brood-larvae-starving.png`)
  loader.add(`images/hex/brood/cell-brood-larvae.png`)
  loader.add(`images/hex/brood/cell-brood-puppa.png`)
  loader.add('images/hex/brood/cell-brood-dead.png')
  loader.add('images/ui/content-brood-empty.png')
  loader.add('images/ui/content-brood-egg.png')
  loader.add('images/ui/content-brood-dead.png')
  loader.add('images/ui/content-brood-larva.png')
  loader.add('images/ui/content-brood-puppa.png')
  loader.add('images/ui/button-large/button-large-content-toggle.png')
  loader.add('images/hex/pollen/cell-pollen-empty.png')
  loader.add('images/hex/pollen/cell-pollen-full.png')
  loader.add('images/hex/pollen/cell-pollen-a.png')
  loader.add('images/hex/pollen/cell-pollen-b.png')
  loader.add('images/hex/pollen/cell-pollen-c.png')
  loader.add('images/hex/pollen/cell-pollen-d.png')
  loader.add('images/hex/pollen/cell-pollen-e.png')
  loader.add('images/ui/content-pollen.png')
  loader.add('images/ui/button-large/button-large-content-upgrade-b.png')
  loader.add('images/ui/button-large/button-large-content-forager-resting-place.png')
  loader.add('images/hex/forager-resting-place.png')
  loader.add('images/ui/season-tracker/background.png')
  loader.add('images/ui/season-tracker/bar-summer.png')
  loader.add('images/ui/season-tracker/bar-winter.png')
  loader.add('images/queen/dialogue.png')
  loader.add('images/scene/flower.png')
  loader.add('images/exclamations/exclamation-warning-mild.png')
  loader.add('images/ui/content-flower.png')
  loader.add('images/scene/flower-pollinated.png')
  loader.add('images/scene/background-winter.png')
  loader.add('images/ui/game-over-background-failed.png')
  loader.add('images/ui/game-over-background-success.png')
  loader.add('images/queen/bee-queen.png')
  loader.add('images/queen/bee-queen-wings-flapped.png')
  loader.add('images/queen/bee-queen-legs-jerk.png')
  loader.add('images/ui/white-description-line.png')
  loader.add('images/ui/content-queen.png')
  loader.add('images/ui/gamespeed0.png')
  loader.add('images/ui/gamespeed1.png')
  loader.add('images/ui/gamespeed4.png')
  loader.add('images/ui/gamespeed8.png')
  loader.add('images/ui/gamespeed64.png')
  loader.add('images/ui/ui-jobs-panel.png')
  loader.add('images/ui/button-jobs/button-alt.png')
  loader.add('images/ui/selection-cell.png')
  loader.add('images/ui/selection-circle.png')
  loader.add('images/ui/hover-cell.png')
  loader.add('images/scene/hive-hole.png')
  loader.add('images/ui/have-winter-food-progress-background.png')
  loader.add('images/bee/bee-drone-flap.png')
  loader.add('images/bee/bee-drone-flop.png')
  loader.add('images/bee/bee-drone-reference.png')
  loader.add('images/world-map-2/desertmap.png')
  loader.add('images/world-map-3/shitcoin.png')
  loader.add('images/world-map-3/coin-dim.png')
  loader.add('images/world-map-3/coin.png')
  loader.add('images/world-map-3/coin-hover.png')
  loader.add('images/world-map-3/coin-click.png')
  loader.add('images/world-map-3/checkmark.png')
  loader.add('images/world-map-3/shitcoin-dim.png')
  loader.add('images/world-map/spritesheet-worldmap.png')
  loader.add('images/ui/spot-claimed.png')
  loader.add('images/ui/progress-bar/progress-bg.png')
  loader.add('images/ui/progress-bar/progress-build.png')
  loader.add('images/ui/progress-bar/progress-flower.png')
  loader.add('images/ui/progress-bar/progress-hunger.png')
  loader.add('images/ui/progress-bar/progress-honey.png')
  loader.add('images/ui/progress-bar/progress-nectar.png')
  loader.add('images/ui/progress-bar/progress-wax.png')
  loader.add('images/ui/progress-bar/progress-pollen.png')
  loader.add('images/ui/progress-bar/progress-age.png')
  loader.load()
}
