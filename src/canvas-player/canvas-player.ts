import { findData, normalize } from '../helpers';
import Observer from '../helpers/Observer';
import { CanvasPlayerLoader } from './canvas-player-loader';
import { createDefaultId } from '../helpers';
import { CanvasPlayerData, LoaderOptions } from '../type';
import { FrameController } from './frame-controller';
import { CanvasManager } from './CanvasManager';

interface CanvasPlayerEvents {}

export class CanvasPlayer {
  #data: CanvasPlayerData[] = [];
  #currentData: CanvasPlayerData | null = null;
  #playState = 0;
  #frameController = new FrameController();
  #observer = new Observer<CanvasPlayerEvents>();
  #canvasManager: CanvasManager;

  constructor(id: string) {
    this.#canvasManager = new CanvasManager(id);
    if (!this.#canvasManager.ctx) return;

    this.#canvasManager.onResize(() => {
      if (!this.#currentData) return;
      const currentFrameData = this.#currentData?.frameData[this.#frameController.frameState.current];
      if (!currentFrameData || !currentFrameData.complete) return;
      this.#canvasManager.drawFrame(currentFrameData.img);
    });
  }

  getPlayState() {
    return this.#playState;
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
    if (window.innerWidth < 768) {
      imgDir =
        options.imgDir ||
        this.#canvasManager.canvasDOM.dataset.img_dir_sp ||
        this.#canvasManager.canvasDOM.dataset.img_dir || '';
    }
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
    const loader = new CanvasPlayerLoader(opts);
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
    if (this.#playState || this.#currentData === null) return;
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
    if (this.#playState === 1) return;
    this.#playState = 1;
    this.#frameController.setFrameOptions(options);
    this.#moveFrame();
  }

  pause() {
    this.#playState = 0;
  }

  seekTo(frameNumber = 0) {
    if (!this.#currentData || !this.#currentData.frameData[frameNumber]) return;
    this.#frameController.frameState.current = frameNumber;
    this.#frameController.frameState.target = frameNumber;
    this.#canvasManager.drawFrame(this.#currentData.frameData[frameNumber].img);
  }

  #moveFrame() {
    if (!this.#currentData) return;
    if (!this.#playState) return;
    this.#playState = this.#frameController.changeFrame() ? 1 : 0;
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