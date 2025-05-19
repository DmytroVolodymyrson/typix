/**
 * Tool-related type definitions
 */

import { RGBColor } from './app.types';

export type ToolType = 'pen' | 'eraser' | 'selector';

export type ToolSettings = {
  type: ToolType;
  color: RGBColor;
  size: number;
  opacity: number;
};

export type ToolAction =
  | { type: 'SET_TOOL'; payload: { tool: ToolType } }
  | { type: 'SET_COLOR'; payload: { color: RGBColor } }
  | { type: 'SET_SIZE'; payload: { size: number } }
  | { type: 'SET_OPACITY'; payload: { opacity: number } };