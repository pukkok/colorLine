import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    // 타이틀은 화면 중앙보다 약간 위쪽 (centerY - 100)
    this.add.text(centerX, centerY - 100, '블럭 튜브 게임', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Nanum Gothic, Arial, sans-serif',
    }).setOrigin(0.5)

    const difficulties = [ 
      {label: '쉬움', difficulty: 'easy'}, 
      {label: '보통', difficulty: 'normal'}, 
      {label: '어려움', difficulty: 'hard'}, 
    ]
    const boxWidth = 100
    const boxHeight = 50
    const spacing = 130

    const startX = centerX - ((difficulties.length - 1) * spacing) / 2
    const startY = centerY + 20

    difficulties.forEach((diff, i) => {
      const x = startX + i * spacing

      const baseBorderColor = 0x10b981
      const hoverBackgroundColor = 0x10b981
      const baseBackgroundColor = 0x00000000 // 투명

      // 기본 박스 (투명 배경 + 에메랄드 테두리)
      const box = this.add.rectangle(x, startY, boxWidth, boxHeight)
        .setStrokeStyle(3, baseBorderColor) // 테두리 두께, 색상
        .setFillStyle(baseBackgroundColor)
        .setInteractive()

      this.add.text(x, startY, diff.label, {
        fontSize: '24px',
        color: '#fff',
        fontFamily: 'Nanum Gothic, Arial, sans-serif',
      }).setOrigin(0.5)

      box.on('pointerdown', () => {
        this.scene.start('GameScene', { difficulty: diff.difficulty })
      })

      box.on('pointerover', () => box.setFillStyle(hoverBackgroundColor, 0.2)) // 20% 투명도 배경
      box.on('pointerout', () => box.setFillStyle(baseBackgroundColor))
    })
  }
}
