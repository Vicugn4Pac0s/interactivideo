
/**
 * 指定されたフレームを描画します。
 * @param {CanvasRenderingContext2D} ctx - キャンバスの2Dコンテキスト
 * @param {CanvasPlayerFrame} targetFrameData - 描画するフレームデータ
 */
export const drawFrame = (ctx: CanvasRenderingContext2D | null, image: HTMLImageElement) => {
  if (!ctx) return;
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  ctx.drawImage(image, 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
};

/**
 * 現在のフレームとターゲットフレームに基づいて次に移動するフレームを計算します。
 * 現在のフレームとターゲットフレームの差が1より大きい場合は、現在のフレームを1増やします。
 * 差が-1より小さい場合は、現在のフレームを1減らします。それ以外の場合は、ターゲットフレームを返します。
 *
 * @param currentFrame - 現在のフレーム番号。
 * @param targetFrame - ターゲットフレーム番号。
 * @returns 次に移動するフレーム番号。
 */
export const getNextFrame = (currentFrame: number, targetFrame: number) => {
  let nextFrame = targetFrame
  const diff = nextFrame - currentFrame
  if (diff > 1) {
    nextFrame = currentFrame + 1
  } else if (diff < -1) {
    nextFrame = currentFrame - 1
  }
  return nextFrame
}