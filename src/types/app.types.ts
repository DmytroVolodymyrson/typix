/**
 * Application-wide type definitions
 */

export type RGBColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export type Point = {
  x: number;
  y: number;
  pressure?: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};