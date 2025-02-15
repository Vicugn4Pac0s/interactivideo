/**
 * イベントを監視する Observer クラスです。
 * ジェネリクスを使用して、イベント引数の型を指定できるようにしています。
 */
export default class Observer<T = any> {
  private listeners: { [event: string]: Array<(args: T) => void> };

  constructor() {
    this.listeners = {};
  }

  /**
   * イベントに対してコールバック関数を登録します。
   *
   * @param event - イベント名
   * @param func - コールバック関数
   */
  on(event: string, func: (args: T) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(func);
  }

  /**
   * イベントの監視を解除します。
   *
   * @param event - イベント名
   * @param func - コールバック関数
   */
  off(event: string, func: (args: T) => void): void {
    if (!this.listeners[event]) {
      return;
    }
    const index = this.listeners[event].indexOf(func);
    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  /**
   * 登録されたイベントのコールバック関数を呼び出します。
   *
   * @param event - イベント名
   * @param args - 引数オブジェクト
   */
  trigger(event: string, args: T): void {
    if (!this.listeners[event]) {
      return;
    }
    // 登録された全てのリスナーを呼び出す
    this.listeners[event].forEach((listener) => listener(args));
  }
}