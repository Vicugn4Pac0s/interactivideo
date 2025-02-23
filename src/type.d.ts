export interface CanvasPlayerData {
  id: string;
  frameData: CanvasPlayerFrame[];
  imgCount: number;
  rate: number;
}

export interface CanvasPlayerFrame {
  id: string;
  img: HTMLImageElement;
  complete: boolean;
}

export interface LoaderOptions {
  id?: string;
  imgDir?: string;
  imgExt?: string;
  imgCount?: number;
}