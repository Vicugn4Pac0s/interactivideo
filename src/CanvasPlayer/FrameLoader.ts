import { CanvasPlayerFrame } from '../type'
import { normalize, zeroPadding } from '../helpers'
import Semaphore from '../helpers/Semaphore'

// TODO; コンストラクタでディレクトリの設定を
// TODO: {id}-{拡張子}-{フレーム数}の形式にし、不要なオプションを削除する
// TODO: フレームのロードを非同期にする
// TODO: インスタンスは一つで完結するようにする
export class FrameLoader {
  id: string
  imgDir: string
  imgExt: string
  imgCount: number
  rate: number

  frameData: CanvasPlayerFrame[] = []
  #semaphore = new Semaphore()

  constructor(options: {
    id: string
    imgDir: string
    imgExt: string
    imgCount: number
  }) {
    this.id = options.id
    this.imgDir = options.imgDir
    this.imgExt = options.imgExt
    this.imgCount = options.imgCount
    this.rate = normalize(1, 0, this.imgCount) * 100
  }

  load(callback?: () => void) {
    for (let i = 0; i < this.imgCount; i++) {
      this.#loadImg(i, callback)
    }
    return {
      id: this.id,
      totalFrames: this.imgCount,
      frameData: this.frameData,
    }
  }

  async #loadImg(i: number, callback?: () => void) {
    const release = await this.#semaphore.enter()

    const id = zeroPadding(i, 4)
    const imgPath = this.imgDir + id + '.' + this.imgExt
    const frame = {
      id,
      img: new Image(),
      complete: false
    }
    frame.img.src = imgPath
    frame.img.onload = () => {
      frame.complete = true
      release()
      if (this.#getLoadProgress() === 1) {
        callback?.();
      }
    }
    this.frameData.push(frame)
  }

  #getLoadProgress() {
    let count = 0
    this.frameData.forEach((data) => {
      if (data.complete) {
        count++
      }
    })
    return normalize(count, 0, this.imgCount)
  }
}
