import { darkPastelColors } from '../objects/pastelColors.js'
import { createTube, createBlock } from '../objects/tube.js'
import { difficultySettings } from '../objects/gameSetting.js'

// 역산 셔플 함수
const reverseShuffle = (tubes, steps = 1500) => {
  for (let i = 0; i < steps; i++) {
    const nonEmptyTubes = tubes.filter(t => t.blocks.length > 0)
    const fromTube = nonEmptyTubes[Math.floor(Math.random() * nonEmptyTubes.length)]
    if (!fromTube.blocks.length) continue

    const block = fromTube.blocks.pop()
    const candidates = tubes.filter(t => t.blocks.length < t.capacity)
    const toTube = candidates[Math.floor(Math.random() * candidates.length)]

    toTube.blocks.push(block)
  }
  return tubes
}

// 완성 상태 생성 후 역산 셔플 방식으로 튜브 생성
export const initTubes = (difficultyKey) => {
  const settings = difficultySettings[difficultyKey]
  const { tubeCapacity, colorCount, emptyTubeCount } = settings

  // 색상 선택
  const allColors = Object.values(darkPastelColors)
  const selectedColors = allColors.slice(0, colorCount)

  // 완성 튜브 생성
  const tubes = selectedColors.map(color => {
    const tube = createTube(tubeCapacity)
    tube.blocks = Array(tubeCapacity).fill(null).map(() => createBlock(color))
    return tube
  })

  // 빈 튜브 추가
  for (let i = 0; i < emptyTubeCount; i++) {
    tubes.push(createTube(tubeCapacity))
  }

  // 역산 셔플
  return reverseShuffle(tubes, 3000)
  // return reverseShuffle(tubes, 5) // dev 테스트용
}


export const getTubeHeight = (tubeCapacity, blockHeight = 40, blockSpacing = 4, padding = 8) => {
  // blockHeight: 블록 높이 (px)
  // blockSpacing: 블록 간 간격 (px)
  // padding: 튜브 위아래 여백 (px)
  return tubeCapacity * (blockHeight + blockSpacing) - blockSpacing + padding * 2
}

export const canDropBlock = (tube, block) => {
  if (tube.blocks.length === 0) return true
  if (tube.blocks.length >= tube.capacity) return false
  return tube.blocks[tube.blocks.length - 1].color === block.color
}

export const checkWin = (tubes) => tubes.every(tube => {
  if (tube.blocks.length === 0) return true
  if (tube.blocks.length !== tube.capacity) return false
  const firstColor = tube.blocks[0].color
  return tube.blocks.every(b => b.color === firstColor)
})