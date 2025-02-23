export interface CanvasPlayerData {
  id: string;
  frameData: CanvasPlayerFrame[];
  totalFrames: number;
}

export interface CanvasPlayerFrame {
  id: string;
  img: HTMLImageElement;
  complete: boolean;
}