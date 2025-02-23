# Interactivideo

Interactivideo は、インタラクティブな動画再生を提供するライブラリです。スクロールに連動して動画を再生することな等ができます。

## インストール

```sh
npm install interactivideo
```

## 使い方

### Intervactivideo.Plauerの使用例

```html
<video id="player"></video>
```

```js
import Interactivideo from 'interactivideo';

const player = new Interactivideo.Player('js-player', {
  fps: 30 // 動画のfpsを指定します。
});
player.load('./video.mp4');
```

### Intervactivideo.CanvasPlayerの使用例

```html
<canvas id="canvas-player" width="1920" height="1080"></canvas>
```

```js
import Interactivideo from 'interactivideo';

const canvasPlayer = new Interactivideo.CanvasPlayer('js-canvas-player', {
  dir: '/canvas-player-data/', // フレーム画像を格納するディレクトリを指定します。
  fps: 30 // 動画のfpsを指定します。
});
canvasPlayer.load({
  id: 'frames-1', // フレーム画像の識別子。ディレクトリ内のサブフォルダ名やキーとして利用されます。
  extension: 'png', // 動画フレーム画像の拡張子。'jpg'、'png'、'webp' から選択してください。デフォルトはwebpです。
  totalFrames: 100, // 全フレーム数。
  callback: ()=>{
    console.log('読み込みが完了しました。');
    canvasPlayer.play(); // 動画を再生。
  }
});
```

## ライセンス

Interactivideo は MIT ライセンスの下で提供されています。
詳細については [MIT License](https://opensource.org/license/MIT) をご覧ください。