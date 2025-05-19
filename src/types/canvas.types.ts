/**
 * Canvas-related type definitions
 */

import { Point, RGBColor } from './app.types';

export type StrokeStyle = {
  color: RGBColor;
  width: number;
  opacity?: number;
};

export type DrawCommand = {
  id: string;
  type: 'stroke' | 'erase' | 'clear';
  points?: Point[];
  style?: StrokeStyle;
};

export type CanvasState = {
  commands: DrawCommand[];
  currentCommand?: DrawCommand;
  scale: number;
  offset: { x: number; y: number };
  dimensions: { width: number; height: number };
};

export type CanvasAction = 
  | { type: 'START_STROKE'; payload: { id: string; point: Point; style: StrokeStyle } }
  | { type: 'ADD_POINT'; payload: { point: Point } }
  | { type: 'END_STROKE' }
  | { type: 'CLEAR_CANVAS' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_SCALE'; payload: { scale: number } }
  | { type: 'SET_OFFSET'; payload: { x: number; y: number } }
  | { type: 'SET_DIMENSIONS'; payload: { width: number; height: number } };