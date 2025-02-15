import { Player } from './player'
import { CanvasPlayer } from './canvas-player'
import { normalize } from './helpers'

export const player = Player;
export const canvasPlayer = CanvasPlayer;
export const utils = {
  normalize
}

export const interactivideo = {
  Player,
  CanvasPlayer,
  utils
}