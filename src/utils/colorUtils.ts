/**
 * Utility functions for color manipulation
 */
import { RGBColor } from '../types/app.types';

/**
 * Converts RGB color to hexadecimal string
 */
export function rgbToHex(color: RGBColor): string {
  const { r, g, b } = color;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Converts hexadecimal string to RGB color
 */
export function hexToRgb(hex: string): RGBColor {
  // Remove # if present
  const sanitizedHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;

  // Parse the hex values
  const r = parseInt(sanitizedHex.substring(0, 2), 16);
  const g = parseInt(sanitizedHex.substring(2, 4), 16);
  const b = parseInt(sanitizedHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Converts RGB color to string format for React Native
 */
export function rgbToString(color: RGBColor): string {
  const { r, g, b, a = 1 } = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}