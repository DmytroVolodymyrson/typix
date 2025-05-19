/**
 * Image processing utilities
 */
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { Platform } from 'react-native';

/**
 * Converts canvas to base64 data URL
 * Note: This is a placeholder implementation. In a real app, we would
 * use a native module for WebP encoding or a WebP library.
 * 
 * @param canvasRef Reference to canvas element
 * @param quality WebP quality (0-100)
 * @returns Promise resolving to base64 data URL
 */
export async function canvasToWebP(
  canvasRef: any,
  quality: number = 90
): Promise<string | null> {
  try {
    console.log('Starting canvas to WebP conversion');

    // For web platform
    if (typeof HTMLCanvasElement !== 'undefined' && 
        ((canvasRef && canvasRef instanceof HTMLCanvasElement) || 
        (canvasRef && canvasRef.current instanceof HTMLCanvasElement))) {
      const canvas = canvasRef instanceof HTMLCanvasElement ? canvasRef : canvasRef.current;
      return canvas.toDataURL('image/webp', quality / 100);
    }
    
    // For React Native
    if (canvasRef) {
      console.log('Canvas ref type:', typeof canvasRef);
      
      // Get the actual ref - could be a direct ref or a React ref object
      const viewRef = canvasRef.current ? canvasRef.current : canvasRef;
      
      if (!viewRef) {
        console.error('View reference is null or undefined');
        throw new Error('Canvas reference not available');
      }
      
      console.log('Using ViewShot to capture canvas');
      
      try {
        // Use ViewShot to capture the canvas as an image
        const uri = await captureRef(viewRef, {
          format: 'png',  // Initially capture as PNG
          quality: quality / 100,
          result: 'data-uri'
        });
        
        console.log('ViewShot capture successful:', uri ? 'URI received' : 'No URI received');
        
        if (!uri) {
          throw new Error('ViewShot returned empty URI');
        }
        
        // Now convert to WebP if on supported platform
        // First save PNG to temporary file
        const tempPngPath = `${FileSystem.cacheDirectory}temp_canvas_image.png`;
        
        // Convert data URI to base64 only
        const base64Data = uri.split(',')[1];
        await FileSystem.writeAsStringAsync(tempPngPath, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Create a path for the WebP file
        const tempWebpPath = `${FileSystem.cacheDirectory}temp_canvas_image.webp`;
        
        if (Platform.OS === 'web') {
          // For web, return the PNG as WebP is not always supported
          console.log('On web platform, returning PNG instead of WebP');
          return uri.replace('data:image/png', 'data:image/webp');
        } else {
          // For native platforms
          // In a real implementation, you would use a native module to convert PNG to WebP here
          // For example, a library like react-native-image-manipulator or expo-image-manipulator
          
          // For this demo, we'll simulate WebP conversion by just changing the mime type
          console.log('Converting image to WebP format (simulated)');
          
          // Read the PNG file back as base64
          const base64Image = await FileSystem.readAsStringAsync(tempPngPath, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Return with WebP mime type (in a real app, we'd actually convert the image)
          return `data:image/webp;base64,${base64Image}`;
        }
      } catch (captureError) {
        console.error('Error capturing canvas view:', captureError);
        throw captureError;
      }
    }
    
    console.error('Canvas reference validation failed');
    throw new Error('Canvas reference not available');
  } catch (error) {
    console.error('Error converting canvas to WebP:', error);
    return null;
  }
}

/**
 * Process image in background
 * This simulates a background processing operation
 * In a real app, this would use a web worker or native thread
 * 
 * @param imageData Raw image data
 * @param quality Quality setting (0-100)
 * @returns Promise resolving to processed image data
 */
export function processImageInBackground(
  imageData: string,
  quality: number = 90
): Promise<string> {
  return new Promise((resolve) => {
    // Simulate background processing with timeout
    setTimeout(() => {
      // In a real implementation, this would do actual WebP compression
      console.log(`Processing image with quality: ${quality}`);
      resolve(imageData);
    }, 500);
  });
}

/**
 * Calculate optimal image dimensions based on canvas size
 * Useful for large canvases to reduce memory usage
 * 
 * @param width Original width
 * @param height Original height
 * @param maxDimension Maximum dimension (width or height)
 * @returns Optimized dimensions
 */
export function calculateOptimalDimensions(
  width: number,
  height: number,
  maxDimension: number = 2048
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  
  if (width > height) {
    const ratio = height / width;
    return {
      width: maxDimension,
      height: Math.round(maxDimension * ratio),
    };
  } else {
    const ratio = width / height;
    return {
      width: Math.round(maxDimension * ratio),
      height: maxDimension,
    };
  }
}