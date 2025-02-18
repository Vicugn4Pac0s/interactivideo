/**
 * フレームレートに基づいて、各フレームの時間間隔（秒）を計算します。
 * @param {number} fps - フレームレート
 * @returns {number} - 各フレームの時間間隔（秒）
 */
const calculateTimeFrame = (fps: number) => {
  return Math.floor((1 / fps) * 10000) / 10000;
}

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
 * 総フレーム数とフレームレート（fps）に基づいて、時間フレームの配列を生成します。
 *
 * @param totalFrame - 総フレーム数。
 * @param fps - フレームレート。
 * @returns 各フレームの時間（秒）を表す配列。
 */
export const getTimeFrameArr = (totalFrame: number, fps: number) => {
  const timeFrame = calculateTimeFrame(fps);

  const timeFrameArr = []
  for (let i = 0; i < totalFrame; i++) {
    timeFrameArr.push(timeFrame * i)
  }
  return timeFrameArr
}