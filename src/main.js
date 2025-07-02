import './style.css'
import Phaser from 'phaser'
import GameScene from './scenes/GameScene'
import MenuScene from './scenes/MenuScene'

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1d1d1d',
  scene: [MenuScene, GameScene]
}

new Phaser.Game(config)