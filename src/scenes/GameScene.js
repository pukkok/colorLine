import Phaser from 'phaser'
import { HistoryManager } from '../logic/HistoryManager.js'
import { initTubes, getTubeHeight, canDropBlock, checkWin } from '../logic/gameLogic.js'
import { showGameWinModal } from '../ui/showGameWinModal.js'


export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
    this.draggedBlock = null
    this.draggedBlockSprite = null
    this.originTubeIndex = null
    this.originBlockX = null
    this.originBlockY = null
    this.tubePositions = []

    this.isAnimating = false
    this.isDragging = false

    this.historyManager = new HistoryManager()

    this.moveCount = 0
    this.startTime = null
    this.gameEnded = false

  }

  init(data) {
    this.difficulty = data.difficulty || 'easy'
  }

  create() {
    this.tubes = initTubes(this.difficulty)
    this.blockSprites = []
    this.tubePositions = []

    const tubeCapacity = this.tubes[0]?.capacity || 6
    const tubeWidth = 60
    const tubeHeight = getTubeHeight(tubeCapacity)
    const startX = this.cameras.main.centerX - (this.tubes.length - 1) * 50
    const baseY = this.cameras.main.centerY + tubeHeight / 2

    this.tubes.forEach((tube, i) => {
      const x = startX + i * 100
      const y = baseY
      this.tubePositions[i] = { x, y }

      // 튜브 배경
      this.add.rectangle(x, y - tubeHeight / 2, tubeWidth, tubeHeight, 0x222222)
        .setStrokeStyle(3, 0xffffff)

      // 인덱스 표시 (1부터 시작)
      this.add.text(x, y + 10, `${i + 1}`, {
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5, 0)  // 가운데 정렬
    })


    // 블록들만 업데이트
    this.updateBlocks()

    // 드래그 이벤트 등록 (pointermove, pointerup)
    this.input.on('pointermove', (pointer) => {
      if (!this.draggedBlockSprite) return
      this.draggedBlockSprite.x = pointer.x
      this.draggedBlockSprite.y = pointer.y
    })

    this.input.on('pointerup', (pointer) => {
      if (!this.draggedBlockSprite) return
      this.endDragBlock(pointer)
    })

    this.selectedTubes = []

    this.input.keyboard.on('keydown', (event) => {
      const num = parseInt(event.key, 10)
      if (isNaN(num) || num < 1 || num > this.tubes.length) return

      const index = num - 1

      // 같은 튜브 두 번 눌렀을 때 → 취소
      if (this.selectedTubes.length === 1 && this.selectedTubes[0] === index) {
        console.log('같은 튜브 선택 → 취소')
        this.selectedTubes = []
        return
      }

      this.selectedTubes.push(index)

      if (this.selectedTubes.length === 2) {
        const [from, to] = this.selectedTubes
        this.tryMoveBlock(from, to)
        this.selectedTubes = []
      }
    })

    const spacing = 30 // 버튼 사이 간격
    const buttonY = baseY + 100

    const undoText = '↩ 실행취소'
    const redoText = '↪ 되돌리기'

    const undoBtn = this.add.text(0, 0, undoText, {
      fontSize: '20px', color: '#ffffff', backgroundColor: '#000'
    }).setPadding(8).setInteractive().setOrigin(0.5)

    const redoBtn = this.add.text(0, 0, redoText, {
      fontSize: '20px', color: '#ffffff', backgroundColor: '#000'
    }).setPadding(8).setInteractive().setOrigin(0.5)

    this.time.delayedCall(0, () => {
      const totalWidth = undoBtn.width + redoBtn.width + spacing

      const centerX = this.cameras.main.centerX
      undoBtn.setPosition(centerX - totalWidth / 2 + undoBtn.width / 2, buttonY)
      redoBtn.setPosition(centerX + totalWidth / 2 - redoBtn.width / 2, buttonY)
    })

    undoBtn.on('pointerdown', () => {
      const success = this.historyManager.undo(this.tubes)
      if (success) {
        this.updateBlocks()
        this.moveCount++
        this.moveText.setText(`이동 횟수: ${this.moveCount}`)
      }
    })

    redoBtn.on('pointerdown', () => {
      const success = this.historyManager.redo(this.tubes)
      if (success) {
        this.updateBlocks()
        this.moveCount++
        this.moveText.setText(`이동 횟수: ${this.moveCount}`)
      }
    })

    this.historyManager.setUI({ undoButton: undoBtn, redoButton: redoBtn })

    this.moveCount = 0
    this.gameEnded = false
    this.startTime = performance.now()
    
    this.moveText = this.add.text(this.scale.width - 20, 20, '이동 횟수: 0', {
      fontSize: '18px', color: '#fff', padding: {x:8, y:4}
    }).setOrigin(1, 0).setDepth(1000)
    
    this.timeText = this.add.text(this.scale.width - 20, 50, '시간: 0.0초', {
      fontSize: '18px', color: '#fff', padding: {x:8, y:4}
    }).setOrigin(1, 0).setDepth(1000)

    const homeBtn = this.add.text(20, 20, '홈으로', {
      fontSize: '18px',
      color: '#fff',
      padding: { x: 10, y: 6 },
    })
      .setOrigin(0, 0)
      .setInteractive()
      .setDepth(1000)

    homeBtn.on('pointerdown', () => {
      this.scene.start('MenuScene')
    })
  }

  update(time) {
    if(this.gameEnded) return
    
    const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1)
    this.timeText.setText(`시간: ${elapsed}초`)
  }

  tryMoveBlock(fromIndex, toIndex) {
    const fromTube = this.tubes[fromIndex]
    const toTube = this.tubes[toIndex]

    const block = fromTube.blocks.at(-1)
    if (!block) return

    const canDrop = canDropBlock(toTube, block)

    if (canDrop) {
      fromTube.blocks.pop()
      toTube.blocks.push(block)
      this.updateBlocks()

      if (checkWin(this.tubes)) {
        this.handleWin()
      }

    } else {
      // 이동 불가: 아무 일도 안 함
      console.warn('이동 불가')
    }
  }

  startDragBlock(pointer, blockSprite) {
    // 둘 중 하나라도 true면 드래그 금지
    if (this.isAnimating || this.isDragging || this.draggedBlockSprite) return
    
    this.isDragging = true  // 드래그 중 플래그 켜기

    const tubeIndex = blockSprite.getData('tubeIndex')
    const block = blockSprite.getData('block')

    const removedBlock = this.tubes[tubeIndex].blocks.pop()
    if (!removedBlock) {
      this.isDragging = false  // 실패 시 다시 false
      return
    }

    this.draggedBlock = removedBlock
    this.originTubeIndex = tubeIndex
    this.originBlockX = blockSprite.x
    this.originBlockY = blockSprite.y

    blockSprite.destroy()
    this.draggedBlockSprite = this.add.rectangle(
      blockSprite.x,
      blockSprite.y,
      50,
      40,
      block.color
    ).setStrokeStyle(1, 0x000000).setDepth(1000)
  }

  endDragBlock(pointer) {
    if(this.isAnimating) return
    
    this.isAnimating = true
    const tubeWidth = 60
    const tubeHeight = getTubeHeight(this.tubes[0]?.capacity || 6)

    let targetTubeIndex = null

    this.tubePositions.forEach(({ x, y }, i) => {
      const left = x - tubeWidth / 2
      const right = x + tubeWidth / 2
      const top = y - tubeHeight
      const bottom = y

      if (
        pointer.x >= left &&
        pointer.x <= right &&
        pointer.y >= top &&
        pointer.y <= bottom
      ) {
        targetTubeIndex = i
      }
    })

    const clickDelay = () => {
      setTimeout(() => {
        const tube = this.tubes[this.originTubeIndex]
        if (tube) {
          tube.blocks.push(this.draggedBlock)
        } else {
          console.warn('너무 빠른 클릭 방지')
        }
      }, 50)
    }

    // 튜브 안에 안 들어갔을 경우
    if (targetTubeIndex === null) {
      // console.log('튜브 안에 안 들어갔을 경우')
      this.animateBlockToOrigin(this.draggedBlockSprite)
      clickDelay()
      return // INFO: 다음으로 넘어가지 못하게 막자(반복작업 방지)
    }

    const canDrop = canDropBlock(this.tubes[targetTubeIndex], this.draggedBlock)

    if (canDrop) {
      // console.log('정상적으로 놓은 경우')
      this.tubes[targetTubeIndex].blocks.push(this.draggedBlock)
      this.animateBlockToTube(this.draggedBlockSprite, targetTubeIndex)

      this.moveCount++
      this.moveText.setText(`이동 횟수: ${this.moveCount}`)
      this.historyManager.push(this.originTubeIndex, targetTubeIndex, { ...this.draggedBlock })
    } else {
      // console.log('잘못 놓은 경우')
      this.animateBlockToOrigin(this.draggedBlockSprite)
      clickDelay()
    }
  }

  animateBlockToTube(blockSprite, tubeIndex) {
    const { x, y } = this.tubePositions[tubeIndex]
    const tube = this.tubes[tubeIndex]
    const blockHeight = 40
    const blockSpacing = 4
    const tubePadding = 8
    const blockIndex = tube.blocks.length - 1
    const targetY = y - tubePadding - blockHeight / 2 - blockIndex * (blockHeight + blockSpacing)

    this.tweens.add({
      targets: blockSprite,
      x,
      y: targetY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        blockSprite.destroy()
        this.updateBlocks()
        this.resetDragState()

        if (checkWin(this.tubes)) {
          this.handleWin()
        }
      }
    })
  }

  animateBlockToOrigin(blockSprite) {
    this.tweens.add({
      targets: blockSprite,
      x: this.originBlockX,
      y: this.originBlockY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.updateBlocks()
        blockSprite.destroy()
        this.resetDragState()
      }
    })
  }

  updateBlocks() {
    if (this.blockSprites) {
      this.blockSprites.forEach(s => s.destroy())
    }
    this.blockSprites = []

    const tubeCapacity = this.tubes[0]?.capacity || 6
    const blockHeight = 40
    const blockSpacing = 4
    const tubePadding = 8
    const startX = this.cameras.main.centerX - (this.tubes.length - 1) * 50
    const baseY = this.cameras.main.centerY + getTubeHeight(tubeCapacity, blockHeight, blockSpacing, tubePadding) / 2

    this.tubes.forEach((tube, i) => {
      const x = startX + i * 100
      const y = baseY

      tube.blocks.forEach((block, j) => {
        const blockY = y - tubePadding - blockHeight / 2 - j * (blockHeight + blockSpacing)
        const rect = this.add.rectangle(x, blockY, 50, blockHeight, block.color).setStrokeStyle(1, 0x000000).setInteractive()
        rect.setData('tubeIndex', i)
        rect.setData('block', block)

        if (j === tube.blocks.length - 1) {
          rect.on('pointerdown', (pointer) => this.startDragBlock(pointer, rect))
        }
        this.blockSprites.push(rect)
      })
    })
  }

  resetDragState() {
    this.draggedBlockSprite = null
    this.draggedBlock = null
    this.originTubeIndex = null
    this.isAnimating = false
    this.isDragging = false
  }

  handleWin() {
    this.gameEnded = true
    this.historyManager.reset()
    const elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1)
    showGameWinModal(this, this.moveCount, elapsed)
  }

}
