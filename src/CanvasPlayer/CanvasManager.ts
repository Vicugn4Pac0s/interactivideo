export class CanvasManager {
  canvasDOM: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvasDOM = canvasElement;
    this.ctx = this.canvasDOM.getContext('2d');
    if (!this.ctx) {
      console.error('Failed to get 2D context.');
      return;
    }
  }

  setSize() {
    if (!this.ctx) return;
    this.canvasDOM.height = this.ctx.canvas.clientHeight;
    this.canvasDOM.width = this.ctx.canvas.clientWidth;
  }

  onResize(callback: () => void) {
    let resizeTimer: number | null = null;
    let previousWidth = window.innerWidth;
    this.setSize();
    window.addEventListener('resize', () => {
      if (window.innerWidth !== previousWidth) {
        this.canvasDOM.style.opacity = '0';
        resizeTimer = setTimeout(() => {
          if (resizeTimer) {
            clearTimeout(resizeTimer);
          }
          this.setSize();
          callback();
          this.canvasDOM.style.opacity = '1';
        }, 500);
      }
      previousWidth = window.innerWidth;
    });
  }

  drawFrame = (image: HTMLImageElement) => {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
    ctx.drawImage(image, 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  };
}