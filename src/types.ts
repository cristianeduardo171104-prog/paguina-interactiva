export interface ShapeDefinition {
  id: string;
  name: string;
  description: string;
  iconName: string;
  generate: (count: number) => Float32Array;
}

export type GestureType = 
  | 'none'
  | 'open_hand'
  | 'fist'
  | 'pinch'
  | 'swipe_right'
  | 'swipe_left'
  | 'pointing'
  | 'one_finger'
  | 'peace_sign';

export interface GestureDetectionResult {
  gesture: GestureType;
  label: string;
  handDetected: boolean;
  handX: number; // Normalized 0 to 1
  handY: number; // Normalized 0 to 1
  pinchDistance: number;
  openness: number; // 0 (fist) to 1 (wide open)
  lastAction?: string;
}

export interface User {
  username: string;
  name?: string;
  registeredAt: string;
}

export type ActiveSection = 'shapes' | 'numbers' | 'animals';
