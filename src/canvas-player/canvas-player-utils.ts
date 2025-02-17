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