import 'regenerator-runtime/runtime'
import 'phaser'

import * as scenes from './scenes/index'
const scene = Object.values(scenes)

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  scene
}

export default new Phaser.Game(config)
