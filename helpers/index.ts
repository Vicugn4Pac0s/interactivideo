/**
 * 指定されたIDとデータ配列からデータを検索します。
 *
 * @param {string} id - 検索するID
 * @param {Array} data - データ配列
 * @returns {any} - 検索されたデータ
 */
export const findData = <T extends { id: string }>(id = '', data: T[] = []): T | undefined => {
  const d = data.find((element) => element.id === id)
  return d
}

/**
 * FPSをミリ秒単位に変換します。
 *
 * @param {number} fps - FPS値
 * @returns {number} - ミリ秒単位の値
 */
export const fpsToMs = (fps: number) => {
  const ms = 1e3 / fps
  return ms
}

/**
 * 指定された値を最小値と最大値の範囲で正規化します。
 *
 * @param {number} value - 正規化する値
 * @param {number} minValue - 最小値
 * @param {number} maxValue - 最大値
 * @returns {number} - 正規化された値
 */
export const normalize = (value: number, minValue: number, maxValue: number) => {
  if (minValue === maxValue) {
    return 0
  }
  return (value - minValue) / (maxValue - minValue)
}

/**
 * 指定された数字を指定された桁数になるようにゼロパディングします。
 *
 * @param {number} number - ゼロパディングする数字
 * @param {number} length - 桁数
 * @returns {string} - ゼロパディングされた文字列
 */
export const zeroPadding = (number: number, length: number) => {
  let str = String(number)

  if (str.length >= length) {
    return str
  } else {
    const diff = length - str.length
    for (let i = 0; i < diff; i++) {
      str = '0' + str
    }
    return str
  }
}