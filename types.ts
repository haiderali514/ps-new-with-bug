
export interface CanvasOptions {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface Layer {
  id: string;
  name: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  opacity: number;
  blendingMode: string;
}

export enum Tool {
    Move,
    GenerativeFill,
    RemoveBackground,
}