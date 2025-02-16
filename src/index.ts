import { Player } from './player/player'
import { CanvasPlayer } from './canvas-player/canvas-player'
import { normalize } from './helpers'

const utils = {
  normalize
}

const interactivideo = {
  Player,
  CanvasPlayer,
  utils
}
export default interactivideo;