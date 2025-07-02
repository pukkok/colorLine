/**
 * 블록 객체 생성
 * @param {string} color 색상 문자열 (예: '#ff0000')
 * @returns {object} 블록 객체
 */
export const createBlock = (color) => ({ color })

/**
 * 튜브 객체 생성
 * @param {number} capacity 튜브 용량
 * @param {Array} blocks 초기 블록 배열 (기본 빈 배열)
 * @returns {object} 튜브 객체
 */
export const createTube = (capacity, blocks = []) => ({
  capacity,
  blocks: [...blocks],
})
