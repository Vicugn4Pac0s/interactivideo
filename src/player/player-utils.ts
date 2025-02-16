/**
 * 現在のフレームとターゲットフレームに基づいて次に移動するフレームを計算します。
 *
 * @param currentFrame - 現在のフレーム番号。
 * @param targetFrame - ターゲットフレーム番号。
 * @returns 次に移動するフレーム番号。
 */
export const getNextFrame = (currentFrame: number, targetFrame: number) => {
  let nextFrame = targetFrame
  const diff = nextFrame - currentFrame
  if (diff > 1) {
    if (diff > 10) {
      nextFrame = currentFrame + 2
    } else {
      nextFrame = currentFrame + 1
    }
  } else if (diff < -1) {
    if (diff < -10) {
      nextFrame = currentFrame - 2
    } else {
      nextFrame = currentFrame - 1
    }
  }
  return nextFrame
}

/**
 * 指定されたタイムフレーム間隔と総フレーム数に基づいてタイムフレームの配列を生成します。
 *
 * @param {number} totalFrame - 生成する総フレーム数。
 * @param {number} timeFrame - 各タイムフレーム間の間隔。
 * @returns {number[]} タイムフレームの配列。
 */
export const getTimeFrameArr = (totalFrame: number, timeFrame: number,) => {
  const timeFrameArr = []
  for (let i = 0; i < totalFrame; i++) {
    timeFrameArr.push(timeFrame * i)
  }
  return timeFrameArr
}