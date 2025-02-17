interface FrameOptions {
  reverse?: boolean;
  loop?: boolean;
}

export class FrameController {
  frameState = {
    current: -1,
    target: 0,
    total: 0
  };
  #frameOptions: FrameOptions = {
    reverse: false,
    loop: false,
  };

  set(totalFrames: number) {
    this.frameState = {
      current: -1,
      target: 0,
      total: totalFrames
    };
  }

  setFrameOptions(options: FrameOptions) {
    this.#frameOptions = { 
      reverse: false,
      loop: false,
      ...options };
  }

  /**
   * 次のフレームに進みます。
   */
  #nextFrame() {
    if (this.frameState.target >= this.frameState.total) return;
    this.frameState.target++;
  }

  /**
   * 前のフレームに戻ります。
   */
  #prevFrame() {
    if (this.frameState.target < 0) return;
    this.frameState.target--;
  }

  changeFrame() {
    const { reverse, loop } = this.#frameOptions;
    const [firstIndex, lastIndex] = reverse
      ? [this.frameState.total - 1, 0]
      : [0, this.frameState.total - 1];
    const isLastFrame = this.frameState.current === lastIndex;

    if (isLastFrame) {
      if (!loop) {
        return false;
      }
      this.frameState.current = firstIndex;
      this.frameState.target = firstIndex;
    }

    if (lastIndex > this.frameState.target) {
      this.#nextFrame();
    } else {
      this.#prevFrame();
    }
    return true;
  }
}