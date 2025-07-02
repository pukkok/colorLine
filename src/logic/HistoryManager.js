export class HistoryManager {
  constructor() {
    this.undoStack = []
    this.redoStack = []
    this.ui = null // 버튼들 주입
  }

  setUI({ undoButton, redoButton }) {
    this.ui = { undoButton, redoButton }
    this.updateUI()
  }

  push(fromIndex, toIndex, block) {
    this.undoStack.push({ fromIndex, toIndex, block })
    this.redoStack = [] // 새로 쌓이면 redo 초기화
    this.updateUI()
  }

  undo(tubes) {
    if (!this.canUndo()) return false
    const { fromIndex, toIndex, block } = this.undoStack.pop()

    const toTube = tubes[toIndex]
    const fromTube = tubes[fromIndex]
    if (toTube.blocks.at(-1)?.color === block.color) {
      toTube.blocks.pop()
      fromTube.blocks.push(block)
      this.redoStack.push({ fromIndex, toIndex, block })
    }

    this.updateUI()
    return true
  }

  redo(tubes) {
    if (!this.canRedo()) return false
    const { fromIndex, toIndex, block } = this.redoStack.pop()

    const fromTube = tubes[fromIndex]
    const toTube = tubes[toIndex]
    if (fromTube.blocks.at(-1)?.color === block.color) {
      fromTube.blocks.pop()
      toTube.blocks.push(block)
      this.undoStack.push({ fromIndex, toIndex, block })
    }

    this.updateUI()
    return true
  }

  canUndo() {
    return this.undoStack.length > 0
  }

  canRedo() {
    return this.redoStack.length > 0
  }

  updateUI() {
    if (this.ui) {
      this.ui.undoButton.setAlpha(this.canUndo() ? 1 : 0.3)
      this.ui.redoButton.setAlpha(this.canRedo() ? 1 : 0.3)
    }
  }

  reset() {
    this.undoStack = []
    this.redoStack = []
    this.updateUI()
  }
}
