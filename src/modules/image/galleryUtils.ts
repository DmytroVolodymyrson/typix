/**
 * Gallery utilities for saving images directly to device gallery
 */
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { copyImageToClipboard } from '../clipboard/clipboardUtils';

/**
 * Captures the canvas view as a transparent PNG
 * @param canvasRef Reference to the canvas view
 * @returns Promise resolving to the captured image URI
 */
export async function captureCanvasAsPng(canvasRef: any): Promise<string | null> {
  try {
    if (!canvasRef) {
      throw new Error('Invalid canvas reference');
    }

    // Get the actual ref - could be a direct ref or a React ref object
    const viewRef = canvasRef.current ? canvasRef.current : canvasRef;
    
    // For web platform - HTMLCanvasElement
    if (Platform.OS === 'web' && typeof HTMLCanvasElement !== 'undefined' && 
        ((viewRef instanceof HTMLCanvasElement) || 
         (canvasRef.current && canvasRef.current instanceof HTMLCanvasElement))) {
      const canvas = viewRef instanceof HTMLCanvasElement ? viewRef : canvasRef.current;
      return canvas.toDataURL('image/png');
    }
    
    // For React Native - use ViewShot
    // The transparent background is achieved by setting the Canvas
    // component's background to 'transparent' in its styles
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'data-uri'
    });
    
    return uri;
  } catch (error) {
    console.error('Error capturing canvas as PNG:', error);
    return null;
  }
}

/**
 * Saves an image directly to the device gallery
 * @param imageUri URI of the image to save
 * @returns Promise resolving to success state
 */
export async function saveToGallery(imageUri: string): Promise<boolean> {
  try {
    // For web platform, download the file directly
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = imageUri;
      link.download = `typix_drawing_${new Date().getTime()}.png`;
      link.click();
      return true;
    }

    // For native platforms, save to media library
    // First request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Gallery permission not granted');
    }
    
    // Convert data URI to local file URI if needed
    let fileUri = imageUri;
    if (imageUri.startsWith('data:')) {
      // Extract base64 data
      const base64Data = imageUri.split(',')[1];
      
      // Save base64 to file using Expo FileSystem
      fileUri = `${FileSystem.cacheDirectory}temp_typix_${new Date().getTime()}.png`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }
    
    // Save to media library
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    
    // Create Typix album if it doesn't exist
    const albums = await MediaLibrary.getAlbumsAsync();
    const typixAlbum = albums.find(album => album.title === 'Typix');
    
    if (typixAlbum) {
      await MediaLibrary.addAssetsToAlbumAsync([asset], typixAlbum, false);
    } else {
      await MediaLibrary.createAlbumAsync('Typix', asset, false);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to gallery:', error);
    return false;
  }
}

/**
 * Copies the canvas content to the clipboard as a PNG with transparency
 * @param canvasRef Reference to the canvas view
 * @returns Promise resolving to success state
 */
export async function copyCanvasToClipboard(canvasRef: any): Promise<boolean> {
  try {
    // Capture the canvas as PNG with transparency
    const pngUri = await captureCanvasAsPng(canvasRef);
    
    if (!pngUri) {
      throw new Error('Failed to capture canvas');
    }
    
    // Copy the image to clipboard
    const success = await copyImageToClipboard(pngUri);
    return success;
  } catch (error) {
    console.error('Error copying canvas to clipboard:', error);
    return false;
  }
} 