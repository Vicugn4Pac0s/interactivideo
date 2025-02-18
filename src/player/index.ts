import Observer from "../helpers/Observer"
import { getNextFrame, getTimeFrameArr } from "./utils"

/**
 * フレームの状態を表すインターフェースです。
 */
interface FrameState {
  /**
   * 現在のフレーム番号。
   */
  current: number;

  /**
   * 目標のフレーム番号。
   */
  target: number;

  /**
   * フレームの総数。
   */
  total: number;

  /**
   * タイムフレームの配列。
   */
  timeFrames: number[];
}

interface PlayerState {
  /**
   * ビデオが読み込まれているかどうか。
   */
  isVideoLoad: boolean;

  /**
   * シーク中かどうか。
   */
  isSeeking: boolean;
}

interface PlayerEvents {
  player: Player
}

/**
 * このクラスはビデオプレーヤーの制御を行うクラスです。
 */
export class Player {
  player: HTMLVideoElement
  #fps = 15
  #frameState: FrameState = {
    current: -1,
    target: 0,
    total: 0,
    timeFrames: []
  };
  #playerState: PlayerState = {
    isVideoLoad: false,
    isSeeking: false
  }
  #observer = new Observer<PlayerEvents>()

  /**
   * プレーヤーのインスタンスを作成します。
   * 
   * @param id - HTMLビデオ要素のID。
   * @param params - プレーヤーのオプションパラメータ。
   * @param params.fps - プレーヤーのフレーム毎秒。
   * 
   * @remarks
   * 指定されたIDの要素がビデオ要素でない場合、コンソールにエラーが記録されます。
   * fpsの範囲は1から60の間である必要があります。デフォルトは15です。
   */
  constructor(id: string, params?: { fps: number }) {
    this.player = document.getElementById(id) as HTMLVideoElement
    if (!this.player || this.player.tagName !== 'VIDEO') {
      console.error(`The element with the ID "${id}" is not a video element.`)
      return
    }
    if (params?.fps && (params.fps < 1 || params.fps > 60)) {
      console.error(`The fps value "${params.fps}" is out of range. It must be between 1 and 60.`)
      return
    }
    this.#fps = params?.fps || this.#fps
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
    if (!this.#playerState.isVideoLoad) return
    this.#frameState.target = Math.floor(progress * this.#frameState.total)
  }

  /**
   * プレーヤー関連のイベントリスナーを設定します。
   */
  #playerEvents() {
    this.player.addEventListener('seeking', () => {
      this.#playerState.isSeeking = true
    })
    this.player.addEventListener('seeked', () => {
      this.#playerState.isSeeking = false
    })
    this.player.addEventListener('loadedmetadata', () => {
      this.#playerState.isVideoLoad = true

      this.#frameState.total = Math.floor(this.player.duration * this.#fps)
      this.#frameState.timeFrames = getTimeFrameArr(this.#frameState.total, this.#fps);
      this.#render()
    })
  }

  /**
   * プレーヤーのレンダリングを行います。
   */
  #render() {
    requestAnimationFrame(this.#render.bind(this))

    if (this.#playerState.isSeeking) return
    if (this.#frameState.current === this.#frameState.target) return

    const nextFrame = getNextFrame(this.#frameState.current, this.#frameState.target);
    if (!this.#frameState.timeFrames[nextFrame]) return

    this.player.currentTime = this.#frameState.timeFrames[nextFrame]
    this.player.pause()
    this.#frameState.current = nextFrame

    this.#observer.trigger('playing', {
      player: this
    })
  }
}
