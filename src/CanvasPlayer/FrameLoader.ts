import { normalize, zeroPadding } from '../helpers'
import Semaphore from '../helpers/Semaphore'
import { FrameData } from '.'

interface FrameLoaderOptions {
  id: string
  extension: 'jpg' | 'png' | 'webp';
  totalFrames: number,
  callback?: () => void
}

export class FrameLoader {
  dir: string

  #semaphore = new Semaphore()

  constructor(options: {
    dir: string
  }) {
    this.dir = options.dir
  }

  load(options: FrameLoaderOptions) {
    const frameData: FrameData[] = []
    for (let i = 0; i < options.totalFrames; i++) {
      this.#loadImg(i, frameData, options)
    }
    return {
      id: options.id,
      totalFrames: options.totalFrames,
      frameData: frameData,
    }
  }

  async #loadImg(i: number, frameData: FrameData[], options: FrameLoaderOptions) {
    const release = await this.#semaphore.enter()

    const id = zeroPadding(i, 4)
    const imgPath = `${this.dir}${options.id}/${id}.${options.extension}`
    const frame = {
      id,
      img: new Image(),
      complete: false
    }
    frame.img.src = imgPath
    frame.img.onload = () => {
      frame.complete = true
      const loadedFrameCount = frameData.filter(frame => frame.complete).length;
      const loadProgress = normalize(loadedFrameCount, 0 , options.totalFrames)
      if (loadProgress === 1) {
        options.callback?.();
      }
      release()
    }
    frame.img.onerror = () => {
      console.error(`Failed to load image: ${imgPath}`)
      release()
    }
    frameData.push(frame)
  }

}
