/**
 * Bezier curve utilities for smooth drawing
 */
import { Point } from '../../types/app.types';

/**
 * Calculates control points for a quadratic bezier curve based on three points
 * @param p0 First point
 * @param p1 Middle point
 * @param p2 Last point
 * @returns Control points for a smooth curve
 */
export function getControlPoints(p0: Point, p1: Point, p2: Point): Point {
  const controlPoint: Point = {
    x: p1.x + (p2.x - p0.x) / 6,
    y: p1.y + (p2.y - p0.y) / 6
  };

  return controlPoint;
}

/**
 * Simplifies a path by removing points that are too close together
 * @param points Array of points to simplify
 * @param tolerance Distance threshold for considering points as duplicates
 * @returns Simplified array of points
 */
export function simplifyPath(points: Point[], tolerance: number = 2): Point[] {
  if (points.length <= 2) return points;

  const result: Point[] = [points[0]];
  let lastPoint = points[0];

  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    const distance = Math.sqrt(
      Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
    );

    if (distance >= tolerance) {
      result.push(point);
      lastPoint = point;
    }
  }

  // Always include the last point
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }

  return result;
}

/**
 * Creates SVG path data for a smoothed bezier curve through the given points
 * @param points Array of points to create a path through
 * @returns SVG path data string
 */
export function createSmoothPath(points: Point[]): string {
  if (points.length < 2) return '';
  
  // Start with the first point
  let path = `M ${points[0].x},${points[0].y}`;
  
  // If only two points, draw a line
  if (points.length === 2) {
    path += ` L ${points[1].x},${points[1].y}`;
    return path;
  }
  
  // For the first segment, use quadratic curve with the first point as control point
  path += ` Q ${points[0].x},${points[0].y} ${(points[0].x + points[1].x) / 2},${(points[0].y + points[1].y) / 2}`;
  
  // For the middle segments, use smooth cubic curves
  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const cp = getControlPoints(p0, p1, p2);
    
    path += ` Q ${cp.x},${cp.y} ${(p1.x + p2.x) / 2},${(p1.y + p2.y) / 2}`;
  }
  
  // For the last segment, use quadratic curve with the last point as endpoint
  const lastIndex = points.length - 1;
  const secondLastIndex = lastIndex - 1;
  path += ` L ${points[lastIndex].x},${points[lastIndex].y}`;
  
  return path;
}