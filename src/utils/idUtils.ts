/**
 * Utility functions for generating unique IDs
 */

/**
 * Generates a random ID for canvas elements
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}