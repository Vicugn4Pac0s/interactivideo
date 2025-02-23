export interface CanvasPlayerData {
  id: string;
  frameData: FrameData[];
  totalFrames: number;
}

export interface CanvasPlayerOptions {
  dir?: string;
  fps?: number;
}

export interface CanvasPlayerLoaderOptions {
  id: string;
  extension?: 'jpg' | 'png' | 'webp';
  totalFrames: number,
}

export interface CanvasPlayerEvents {
  
}

export interface FrameData {
  id: string;
  img: HTMLImageElement;
  complete: boolean;
}

export interface FrameLoaderOptions {
  id: string
  extension: 'jpg' | 'png' | 'webp';
  totalFrames: number,
  callback?: () => void
}

export interface FrameControllerOptions {
  reverse?: boolean;
  loop?: boolean;
}