const emeraldColor = 0x10b981
const buttonFontStyle = {
  fontSize: '18px',
  color: '#fff',
  fontFamily: 'Nanum Gothic, Arial, sans-serif',
  padding: 2,
}

export const showGameWinModal = (scene, moveCount, elapsed) => {
  const centerX = scene.cameras.main.centerX
  const centerY = scene.cameras.main.centerY

  const overlay = scene.add.rectangle(centerX, centerY, scene.scale.width, scene.scale.height, 0x000000, 0.6).setDepth(1000)

  const modalBox = scene.add.rectangle(centerX, centerY, 320, 230, 0x222222).setStrokeStyle(2, 0x666666).setDepth(1001)

  scene.add.text(centerX, centerY - 60, '🎉 승리했습니다! 🎉', {
    fontSize: '22px', color: '#fff', fontFamily: 'Nanum Gothic, Arial, sans-serif',
  }).setOrigin(0.5).setDepth(1002)

  scene.add.text(centerX, centerY - 20, `이동 횟수: ${moveCount}`, buttonFontStyle).setOrigin(0.5).setDepth(1002)

  scene.add.text(centerX, centerY + 5, `소요 시간: ${elapsed}초`, buttonFontStyle).setOrigin(0.5).setDepth(1002)

  const spacing = 20

  // 텍스트 먼저 만들어서 너비 측정
  const restartText = scene.add.text(0, 0, '다시 시작', buttonFontStyle).setOrigin(0.5).setDepth(1002)
  const mainText = scene.add.text(0, 0, '메인으로', buttonFontStyle).setOrigin(0.5).setDepth(1002)

  const restartBox = scene.add.rectangle(0, 0, restartText.width + 20, restartText.height + 10)
    .setStrokeStyle(2, emeraldColor)
    .setInteractive()
    .setFillStyle(0x000000, 0)
    .setDepth(1001)

  const mainBox = scene.add.rectangle(0, 0, mainText.width + 20, mainText.height + 10)
    .setStrokeStyle(2, emeraldColor)
    .setInteractive()
    .setFillStyle(0x000000, 0)
    .setDepth(1001)

  const totalWidth = restartBox.width + mainBox.width + spacing
  const restartX = centerX - totalWidth / 2 + restartBox.width / 2
  const mainX = centerX + totalWidth / 2 - mainBox.width / 2
  const buttonY = centerY + 60

  restartBox.setPosition(restartX, buttonY)
  restartText.setPosition(restartX, buttonY)

  mainBox.setPosition(mainX, buttonY)
  mainText.setPosition(mainX, buttonY)

  restartBox.on('pointerdown', () => scene.scene.restart())
  mainBox.on('pointerdown', () => scene.scene.start('MenuScene'))

  // Hover 효과
  const setHover = (box) => {
    box.on('pointerover', () => box.setFillStyle(emeraldColor, 0.15))
    box.on('pointerout', () => box.setFillStyle(0x000000, 0))
  }
  setHover(restartBox)
  setHover(mainBox)
}
