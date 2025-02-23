interface FrameOptions {
  reverse?: boolean;
  loop?: boolean;
}

export class FrameController {
  #lastFrameTime = performance.now();
  #fpsState = {
    fps: 15,
    frameInterval: 1e3 / 15
  }
  #frameState = {
    current: -1,
    target: 0,
    total: 0
  };
  #frameOptions: FrameOptions = {
    reverse: false,
    loop: false,
  };

  set lastFrameTime(time: number) {
    this.#lastFrameTime = time;
  }

  get lastFrameTime() {
    return this.#lastFrameTime;
  }

  get frameInterval() {
    return this.#fpsState.frameInterval;
  }

  set currentFrame(frame: number) {
    this.#frameState.current = frame;
  }

  get currentFrame() {
    return this.#frameState.current;
  }

  set targetFrame(frame: number) {
    this.#frameState.target = frame;
  }

  get targetFrame() {
    return this.#frameState.target;
  }

  setFPS(fps: number) {
    this.#fpsState.fps = fps;
    this.#fpsState.frameInterval = 1e3 / fps;
  }

  setFrame(frames: number) {
    this.#frameState = {
      current: -1,
      target: 0,
      total: frames
    };
  }

  setFrameOptions(options: FrameOptions) {
    this.#frameOptions = { 
      reverse: false,
      loop: false,
      ...options };
  }

  getNextFrame = () => {
    const { current, target } = this.#frameState
    let nextFrame = target
    const diff = nextFrame - current
    if (diff > 1) {
      nextFrame = current + 1
    } else if (diff < -1) {
      nextFrame = current - 1
    }
    return nextFrame
  }

  changeFrame() {
    const { reverse, loop } = this.#frameOptions;
    const [firstIndex, lastIndex] = reverse
      ? [this.#frameState.total - 1, 0]
      : [0, this.#frameState.total - 1];
    const isLastFrame = this.#frameState.current === lastIndex;

    if (isLastFrame) {
      if (!loop) {
        return false;
      }
      this.#frameState.current = firstIndex;
      this.#frameState.target = firstIndex;
    }

    if (lastIndex > this.#frameState.target) {
      this.#nextFrame();
    } else {
      this.#prevFrame();
    }
    return true;
  }

  /**
   * 次のフレームに進みます。
   */
  #nextFrame() {
    if (this.#frameState.target >= this.#frameState.total) return;
    this.#frameState.target++;
  }

  /**
   * 前のフレームに戻ります。
   */
  #prevFrame() {
    if (this.#frameState.target < 0) return;
    this.#frameState.target--;
  }
}