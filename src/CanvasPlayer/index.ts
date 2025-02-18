import { CanvasPlayerData, LoaderOptions } from '../type';
import { findData, normalize, createDefaultId } from '../helpers';
import Observer from '../helpers/Observer';
import { CanvasManager } from './CanvasManager';
import { FrameLoader } from './FrameLoader';
import { FrameController } from './FrameController';

interface CanvasPlayerEvents {}

export class CanvasPlayer {
  playState = false;
  #data: CanvasPlayerData[] = [];
  #currentData: CanvasPlayerData | null = null;
  #canvasManager: CanvasManager;
  #frameController = new FrameController();
  #observer = new Observer<CanvasPlayerEvents>();

  constructor(id: string) {
    this.#canvasManager = new CanvasManager(id);
    if (!this.#canvasManager.ctx) return;

    this.#canvasManager.onResize(() => {
      const currentFrameData = this.#currentData?.frameData[this.#frameController.frameState.current];
      if (!currentFrameData || !currentFrameData.complete) return;
      this.#canvasManager.drawFrame(currentFrameData.img);
    });
  }

  getVideoIds() {
    return this.#data.map((e) => e.id);
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

  load(options: LoaderOptions = {}) {
    const id = options.id || createDefaultId();
    if (findData(id, this.#data)) return;

    let imgDir = options.imgDir || this.#canvasManager.canvasDOM.dataset.img_dir || '';
    const imgExt = options.imgExt || this.#canvasManager.canvasDOM.dataset.img_ext || 'jpg';
    const imgCount =
      options.imgCount || Number(this.#canvasManager.canvasDOM.dataset.img_count) || 0;
    const fps = options.fps || Number(this.#canvasManager.canvasDOM.dataset.fps) || 30;

    const opts = {
      id,
      imgDir,
      imgExt,
      imgCount,
      fps,
    };
    const loader = new FrameLoader(opts);
    loader.load(() => {
      this.#observer.trigger('loaded', {
        videoId: opts.id,
      });
    });

    const data = loader.get();
    this.#data.push(data);

    if (this.#currentData === null) {
      this.changeCurrentData(opts.id);
      this.#render();
    }
  }

  playWithProgress(progress: number) {
    if (this.playState || this.#currentData === null) return;
    this.#frameController.frameState.target = Math.floor((progress / this.#currentData.rate) * 100);
  }

  changeCurrentData(id: string) {
    const currentData = findData(id, this.#data);
    if (!currentData) return;

    this.#currentData = currentData;
    this.#frameController.set(currentData.imgCount);

    this.pause();
  }

  play(options = {}) {
    if (this.playState) return;
    this.playState = true;
    this.#frameController.setFrameOptions(options);
    this.#moveFrame();
  }

  pause() {
    this.playState = false;
  }

  seekTo(frameNumber = 0) {
    if (!this.#currentData || !this.#currentData.frameData[frameNumber]) return;
    this.#frameController.frameState.current = frameNumber;
    this.#frameController.frameState.target = frameNumber;
    this.#canvasManager.drawFrame(this.#currentData.frameData[frameNumber].img);
  }

  #moveFrame() {
    if (!this.#currentData) return;
    if (!this.playState) return;
    this.playState = this.#frameController.changeFrame();
    requestAnimationFrame(this.#moveFrame.bind(this));
  }

  #render() {
    requestAnimationFrame(this.#render.bind(this));

    if (!this.#currentData) return;
    if (this.#frameController.frameState.current === this.#frameController.frameState.target) return;

    const nextFrame = this.#frameController.getNextFrame();
    const nextFrameData = this.#currentData.frameData[nextFrame];

    if (!nextFrameData || !nextFrameData.complete) return;

    this.#canvasManager.drawFrame(nextFrameData.img);

    this.#frameController.frameState.current = nextFrame;

    this.#observer.trigger('playing', {
      videoId: this.#currentData.id,
      playProgress: normalize(
        this.#frameController.frameState.current,
        0,
        this.#currentData.imgCount - 1
      ),
    });
  }
}