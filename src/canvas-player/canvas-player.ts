import { findData, normalize } from '../helpers'
import Observer from '../helpers/Observer'
import { CanvasPlayerLoader } from './canvas-player-loader'
import { createDefaultId } from '../helpers'
import { CanvasPlayerData, LoaderOptions } from '../type'
import { drawFrame, getNextFrame } from './canvas-player-utils'
import { FrameController } from './frame-controller'

interface CanvasPlayerEvents {
}

// TODO: 外部関数化によるリファクタリング
// TODO: state管理のオブジェクト化
// TODO: イベントコールバック関数の調整
// TODO: data-srcからの取得ではなく、引数からの取得に
// TODO: DOM操作外部クラス化検討
export class CanvasPlayer {
  canvasDOM: HTMLCanvasElement
  ctx: CanvasRenderingContext2D | null = null

  #data: CanvasPlayerData[] = []
  #currentData: CanvasPlayerData | null = null

  #playState = 0

  #frameController = new FrameController();
  #observer = new Observer<CanvasPlayerEvents>()

  /**
   * クラスのコンストラクタです。
   * @param {string} id - canvas要素のID名
   */
  constructor(id: string) {
    this.canvasDOM = document.getElementById(id) as HTMLCanvasElement;
    if (!this.canvasDOM || this.canvasDOM.tagName !== 'CANVAS') {
      console.error(`The element with the ID "${id}" is not a canvas element.`)
      return
    }
    this.ctx = this.canvasDOM.getContext('2d')
    if (!this.ctx) {
      console.error('Failed to get 2D context.')
      return
    }

    this.#onResize()
  }

  /**
   * 再生状態を返します。
   * @returns {number}
   */
  getPlayState() {
    return this.#playState
  }

  /**
   * 現在の動画IDを返します。
   * @returns {string[]}
   */
  getVideoIds() {
    return this.#data.map((e) => e.id)
  }

  /**
   * イベントリスナーを登録します。
   * @param {string} eventName - イベント名。現在は"loading"と"playing"イベントのみをサポートしています。
   * @param {void} callback - コールバック関数
   */
  on(eventName: string, callback: ()=>void) {
    switch (eventName) {
      case 'loaded':
        this.#observer.on(eventName, callback)
        break

      case 'playing':
        this.#observer.on(eventName, callback)
        break

      default:
        console.error(
          `This event name "${eventName}" can't be used. Supported event name is "loading" or "playing".`
        )
        break
    }
  }

  /**
   *
   * @typedef {Object} loadAttr
   * @property {string} id - 登録する動画のID名
   * @property {string} imgDir - フレーム画像格納フォルダのパス
   * @property {string} imgExt - フレーム画像の拡張子
   * @property {number} imgCount - フレーム画像の数
   * @property {number} fps - フレームレート
   */
  /**
   * 動画データを読み込みます。
   * @param {loadAttr} options - {id, imgDir, imgExt, imgCount, fps}
   */
  load(options: LoaderOptions = {}) {
    const id = options.id || createDefaultId();
    if (findData(id, this.#data)) return

    let imgDir = options.imgDir || this.canvasDOM.dataset.img_dir || ''
    if (window.innerWidth < 768) {
      imgDir =
        options.imgDir ||
        this.canvasDOM.dataset.img_dir_sp ||
        this.canvasDOM.dataset.img_dir || ''
    }
    const imgExt = options.imgExt || this.canvasDOM.dataset.img_ext || 'jpg'
    const imgCount =
      options.imgCount || Number(this.canvasDOM.dataset.img_count) || 0
    const fps = options.fps || Number(this.canvasDOM.dataset.fps) || 30

    const opts = {
      id,
      imgDir,
      imgExt,
      imgCount,
      fps
    }
    const loader = new CanvasPlayerLoader(opts);
    loader.load(()=>{
      this.#observer.trigger('loaded', {
        videoId: opts.id
      })
    });

    const data = loader.get();
    this.#data.push(data)

    if (this.#currentData === null) {
      // 初回のみ
      this.changeCurrentData(opts.id)
      this.#render()
    }
  }

  /**
   * 進捗率（0～1に正規化された値）に基づいてプレーヤーを再生します。
   * @param {number} progress - 進捗率
   */
  playWithProgress(progress: number) {
    if (this.#playState || this.#currentData === null) return
    this.#frameController.frameState.target = Math.floor((progress / this.#currentData.rate) * 100)
  }

  /**
   * 現在の動画データを変更します。
   * @param {string} id - 登録した動画ID
   */
  changeCurrentData(id: string) {
    const currentData = findData(id, this.#data);
    if (!currentData) return

    this.#currentData = currentData
    this.#frameController.set(currentData.imgCount)

    this.pause()
  }

  /**
   *
   * @typedef {Object} playAttr
   * @property {boolean} reverse - 逆再生するか
   * @property {boolean} loop - 繰り返し再生するか
   */
  /**
   * 動画を再生します。
   * @param {playAttr} options
   */
  play(options = {}) {
    if (this.#playState === 1) return
    this.#playState = 1
    this.#frameController.setFrameOptions(options)
    this.#moveFrame()
  }

  /**
   * 動画を停止します。
   */
  pause() {
    this.#playState = 0
  }

  /**
   * 指定したフレームに移動します
   * @param {number} frameNumber
   */
  seekTo(frameNumber = 0) {
    if (!this.#currentData || !this.#currentData.frameData[frameNumber]) return
    this.#frameController.frameState.current = frameNumber
    this.#frameController.frameState.target = frameNumber
    drawFrame(this.ctx, this.#currentData.frameData[frameNumber].img)
  }

  #setSize() {
    if (!this.ctx) return
    this.canvasDOM.height = this.ctx.canvas.clientHeight
    this.canvasDOM.width = this.ctx.canvas.clientWidth
  }

  #onResize() {
    if (!this.canvasDOM) return
    let resizeTimer: number | null = null
    let previousWidth = window.innerWidth
    this.#setSize()
    window.addEventListener('resize', () => {
      if (!this.#currentData) return
      if (window.innerWidth !== previousWidth) {
        this.canvasDOM.style.opacity = '0'
        resizeTimer = setTimeout(() => {
          if (resizeTimer) {
            clearTimeout(resizeTimer)
          }
          this.#setSize()
          const currentFrameData =
            this.#currentData?.frameData[this.#frameController.frameState.current]
          if (!currentFrameData || !currentFrameData.complete) return
          drawFrame(this.ctx, currentFrameData.img)
          
          this.canvasDOM.style.opacity = '1'
        }, 500)
      }
      previousWidth = window.innerWidth
    })
  }

  #moveFrame() {
    if (!this.#currentData) return
    if (!this.#playState) return
    this.#playState = this.#frameController.changeFrame() ? 1: 0;
    requestAnimationFrame(this.#moveFrame.bind(this))
  }

  #render() {
    requestAnimationFrame(this.#render.bind(this))

    if (!this.#currentData) return
    if (this.#frameController.frameState.current === this.#frameController.frameState.target) return

    const nextFrame = getNextFrame(this.#frameController.frameState.current, this.#frameController.frameState.target)
    const nextFrameData = this.#currentData.frameData[nextFrame]

    if (!nextFrameData || !nextFrameData.complete) return

    drawFrame(this.ctx, nextFrameData.img)
    
    this.#frameController.frameState.current = nextFrame

    this.#observer.trigger('playing', {
      videoId: this.#currentData.id,
      playProgress: normalize(
        this.#frameController.frameState.current,
        0,
        this.#currentData.imgCount - 1
      )
    })
  }

}
