interface SemaphoreOptions {
  max?: number;
}

export default class Semaphore {
  private MAX_ROOMS: number;
  private rooms: Symbol[];
  // waitingList に格納する関数は、退室用のコールバックを引数にとるresolve関数です。
  private waitingList: Array<(release: () => void) => void>;

  constructor(options: SemaphoreOptions = {}) {
    this.MAX_ROOMS = options.max || 10;
    this.rooms = [];
    this.waitingList = [];
  }

  /**
   * ルームに入室します。
   *
   * @returns {Promise<() => void>} - 入室が許可された後、退室用の関数が解決されるPromise
   */
  enter(): Promise<() => void> {
    const promise = new Promise<() => void>((resolve) => {
      this.waitingList.push(resolve);
    });
    this.tryNext();
    return promise;
  }

  /**
   * ルームから退室します。
   *
   * @param {Symbol} room - 退室するルームの識別子
   */
  release(room: Symbol): void {
    this.rooms = this.rooms.filter((r) => r !== room);
    this.tryNext();
  }

  /**
   * 次の入室リクエストを処理します。
   */
  tryNext(): void {
    if (this.rooms.length >= this.MAX_ROOMS) return;
    const next = this.waitingList.shift();
    if (!next) return;

    const room = Symbol('');
    this.rooms.push(room);

    // 入室が許可された際、退室用の関数を返す
    next(() => {
      this.release(room);
    });
  }
}