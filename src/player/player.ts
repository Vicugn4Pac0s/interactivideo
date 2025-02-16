import Observer from "../helpers/Observer"
import { getNextFrame, getTimeFrameArr } from "./player-utils"

interface PlayerEvents {
  player: Player
}

/**
 * このクラスはビデオプレーヤーの制御を行うクラスです。
 */
export class Player {
  player: HTMLVideoElement
  #fps = 15
  #timeFrameArr: number[] = []
  #totalFrame = 0
  #targetFrame = 0
  #currentFrame = -1

  #isVideoLoad = false
  #isSeeking = false
  #observer = new Observer<PlayerEvents>()

  /**
   * クラスのコンストラクタです。
   * @param {string} id - ビデオ要素のID名
   */
  constructor(id: string) {
    this.player = document.getElementById(id) as HTMLVideoElement
    if (!this.player || this.player.tagName !== 'VIDEO') {
      console.error(`The element with the ID "${id}" is not a video element.`)
      return
    }
    this.#fps = Number(this.player.dataset.fps) || this.#fps
    this.#playerEvents()
  }

  /**
   * 指定されたイベント名のイベントリスナーを登録します。
   *
   * @param {string} eventName - リッスンするイベントの名前。現在は"playing"のみサポートされています。
   * @param {function} callback - イベントがトリガーされたときに呼び出される関数。コールバックは`PlayerEvents`オブジェクトを引数として受け取ります。
   *
   * @example
   * ```typescript
   * player.on('playing', (data) => {
   *   console.log('プレーヤーが再生中です:', data);
   * });
   * ```
   *
   * @throws サポートされていないイベント名の場合はエラーをスローします。
   */
  on(eventName: string, callback: (data: PlayerEvents) => void) {
    switch (eventName) {
      case 'playing':
        this.#observer.on(eventName, callback)
        break

      default:
        console.error(
          `This event name "${eventName}" can't be used. Supported event name is "playing".`
        )
        break
    }
  }

  /**
   * 指定されたソースURLからビデオを読み込み、プレーヤーのソースとして設定します。
   * 
   * @param src - 読み込むビデオのURL。
   * 
   * このメソッドは、XMLHttpRequestを使用してビデオをblobとして取得し、
   * そのblobからオブジェクトURLを作成してビデオプレーヤーのソースとして設定します。
   */
  load(src: string) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', src, true)
    xhr.responseType = 'blob'
    xhr.onload = (e) => {
      const target = e.currentTarget as XMLHttpRequest;
      if (target.status === 200) {
        const myBlob = target.response
        const vid = (window.webkitURL || window.URL).createObjectURL(myBlob)
        this.player.src = vid
      }
    }
    xhr.send()
  }

  /**
   * 進捗率（0～1に正規化された値）に基づいてプレーヤーを再生します。
   * @param {number} progress - 進捗率
   */
  playWithProgress(progress: number) {
    if (!this.#isVideoLoad) return
    this.#targetFrame = Math.floor(progress * this.#totalFrame)
  }

  /**
   * プレーヤー関連のイベントリスナーを設定します。
   */
  #playerEvents() {
    this.player.addEventListener('seeking', () => {
      this.#isSeeking = true
    })
    this.player.addEventListener('seeked', () => {
      this.#isSeeking = false
    })
    this.player.addEventListener('loadedmetadata', () => {
      this.#isVideoLoad = true

      this.#totalFrame = Math.floor(this.player.duration * this.#fps)
      this.#timeFrameArr = getTimeFrameArr(this.#totalFrame, this.#fps);
      this.#render()
    })
  }

  /**
   * プレーヤーのレンダリングを行います。
   */
  #render() {
    requestAnimationFrame(this.#render.bind(this))

    if (this.#isSeeking) return
    if (this.#currentFrame === this.#targetFrame) return

    const nextFrame = getNextFrame(this.#currentFrame, this.#targetFrame);
    if (!this.#timeFrameArr[nextFrame]) return

    this.player.currentTime = this.#timeFrameArr[nextFrame]
    this.player.pause()
    this.#currentFrame = nextFrame

    this.#observer.trigger('playing', {
      player: this
    })
  }
}
