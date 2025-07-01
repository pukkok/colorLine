import './style.css'
import Phaser from 'phaser'

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#1d1d1d',
  scene: {
    create() {
      this.add.text(200, 300, 'Hello Phaser!', {
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5)
    }
  }
}

new Phaser.Game(config)