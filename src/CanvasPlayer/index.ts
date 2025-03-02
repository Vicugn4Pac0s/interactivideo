import { findData, normalize } from '../helpers';
import Observer from '../helpers/Observer';
import { CanvasManager } from './CanvasManager';
import { FrameLoader } from './FrameLoader';
import { FrameController } from './FrameController';

export interface FrameData {
  id: string;
  img: HTMLImageElement;
  complete: boolean;
}

interface CanvasPlayerData {
  id: string;
  frameData: FrameData[];
  totalFrames: number;
}

interface CanvasPlayerOptions {
  dir?: string;
  fps?: number;
}

interface CanvasPlayerEvents {
  player: CanvasPlayer;
}

interface CanvasPlayerLoaderOptions {
  id: string;
  extension?: 'jpg' | 'png' | 'webp';
  totalFrames: number,
}

export interface FrameControllerOptions {
  reverse?: boolean;
  loop?: boolean;
}

export class CanvasPlayer {
  #data: CanvasPlayerData[] = [];
  #currentData: CanvasPlayerData | null = null;
  #playState = false;
  #canvasManager: CanvasManager;
  #frameLoader: FrameLoader;
  #frameController = new FrameController();
  #observer = new Observer<CanvasPlayerEvents>();

  constructor(target: HTMLCanvasElement | string, options?: CanvasPlayerOptions) {
    const canvasElement = typeof target === 'string' 
      ? document.getElementById(target) as HTMLCanvasElement 
      : target;
    if (!canvasElement || canvasElement.tagName !== 'CANVAS') {
      throw new Error('The element is not a canvas element.');
    }
    this.#canvasManager = new CanvasManager(canvasElement);
    this.#frameLoader = new FrameLoader({ dir: options?.dir || '/frames/' });
    this.#frameController.setFPS(options?.fps || 30);
    if (!this.#canvasManager.ctx) return;

    this.#canvasManager.onResize(() => {
      const currentFrameData = this.#currentData?.frameData[this.#frameController.currentFrame];
      if (!currentFrameData || !currentFrameData.complete) return;
      this.#canvasManager.drawFrame(currentFrameData.img);
    });
  }

  get videoIds() {
    return this.#data.map((e) => e.id);
  }

  get currentData() {
    return this.#currentData;
  }

  get playerProgress() {
    if (!this.#currentData) return 0;
    return normalize(
      this.#frameController.currentFrame,
      0,
      this.#currentData.totalFrames - 1
    );
  }

  on(eventName: string, callback: () => void) {
    switch (eventName) {
      case 'loaded':
        this.#observer.on(eventName, callback);
        break;
      case 'playing':
        this.#observer.on(eventName, callback);
        break;
      default:
        console.error(
          `This event name "${eventName}" can't be used. Supported event name is "loading" or "playing".`
        );
        break;
    }
  }

  load(options: CanvasPlayerLoaderOptions) {
    if (findData(options.id, this.#data)) return;

    const data = this.#frameLoader.load({
      id: options.id,
      extension: options.extension || 'webp',
      totalFrames: options.totalFrames,
      callback: () => {
        this.#observer.trigger('loaded', {
          player: this,
        });
      }
    });

    this.#data.push(data);

    if (this.#currentData === null) {
      this.changeCurrentData(options.id);
      this.#refreshFrame();
    }
  }

  playWithProgress(progress: number) {
    if (this.#playState || this.#currentData === null) return;
    const targetFrame = Math.floor(progress * this.#currentData.totalFrames);
    this.#frameController.targetFrame = targetFrame;
  }

  changeCurrentData(id: string) {
    const currentData = findData(id, this.#data);
    if (!currentData) return;

    this.#currentData = currentData;
    this.#frameController.setFrame(currentData.totalFrames);

    this.pause();
  }

  play(options?: FrameControllerOptions) {
    if (this.#playState) return;
    this.#playState = true;
    this.#frameController.setFrameOptions(options || {});
    this.#progressFrame();
  }

  pause() {
    this.#playState = false;
  }

  seekTo(frameNumber = 0) {
    if (!this.#currentData || !this.#currentData.frameData[frameNumber]) return;
    this.#frameController.currentFrame = frameNumber;
    this.#frameController.targetFrame = frameNumber;
    this.#canvasManager.drawFrame(this.#currentData.frameData[frameNumber].img);
  }

  #progressFrame() {
    const now = performance.now();

    if (now - this.#frameController.lastFrameTime < this.#frameController.frameInterval) {
      requestAnimationFrame(this.#progressFrame.bind(this));
      return;
    }
    this.#frameController.lastFrameTime = now;

    if (!this.#playState || !this.#currentData) return;
    this.#playState = this.#frameController.changeFrame();
    requestAnimationFrame(this.#progressFrame.bind(this));
  }

  #refreshFrame() {
    requestAnimationFrame(this.#refreshFrame.bind(this));

    if (!this.#currentData) return;
    if (this.#frameController.currentFrame === this.#frameController.targetFrame) return;

    const nextFrame = this.#frameController.getNextFrame();
    const nextFrameData = this.#currentData.frameData[nextFrame];

    if (!nextFrameData || !nextFrameData.complete) return;

    this.#canvasManager.drawFrame(nextFrameData.img);

    this.#frameController.currentFrame = nextFrame;

    this.#observer.trigger('playing', {
      player: this,
    });
  }
}