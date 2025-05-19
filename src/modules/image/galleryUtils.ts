/**
 * Gallery utilities for saving images directly to device gallery
 */
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { captureRef, CaptureOptions } from 'react-native-view-shot';
import { copyImageToClipboard } from '../clipboard/clipboardUtils';

/**
 * Captures the text preview as a transparent PNG
 * @param viewRef Reference to the view to capture
 * @returns Promise resolving to the captured image URI
 */
export async function captureCanvasAsPng(viewRef: any): Promise<string | null> {
  try {
    if (!viewRef) {
      throw new Error('Invalid view reference');
    }

    // Get the actual ref - could be a direct ref or a React ref object
    const ref = viewRef.current ? viewRef.current : viewRef;
    
    console.log('Starting capture process with view:', ref);
    
    // For web platform - use HTML API
    if (Platform.OS === 'web' && typeof HTMLCanvasElement !== 'undefined' && 
        ((ref instanceof HTMLCanvasElement) || 
         (viewRef.current && viewRef.current instanceof HTMLCanvasElement))) {
      const canvas = ref instanceof HTMLCanvasElement ? ref : viewRef.current;
      console.log('Using HTML Canvas capture method for web');
      return canvas.toDataURL('image/png');
    }
    
    // For React Native, ensure the view is rendered before capturing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Different capture strategies per platform
    const captureOptions: CaptureOptions = {
      format: 'png', // PNG format supports transparency
      quality: 1,     // Highest quality
      result: 'data-uri',
      // The following settings ensure transparency is preserved
      // (no explicit 'transparent' property, as it's not in the type)
      // Use platform-specific options
      ...(Platform.OS === 'ios' ? {
        // Better for text rendering on iOS
        useRenderInContext: true,
      } : {}),
      ...(Platform.OS === 'android' ? {
        // Better for Android specific views
        handleGLSurfaceViewOnAndroid: true,
      } : {})
    };
    
    console.log(`Capturing view with options: ${JSON.stringify(captureOptions)}`);
    
    // Perform the capture
    try {
      const uri = await captureRef(ref, captureOptions);
      console.log(`Capture successful, URI length: ${uri?.length ?? 0}`);
      return uri;
    } catch (captureError) {
      console.error('First capture attempt failed:', captureError);
      
      // If the first attempt fails, try with different options
      console.log('Trying alternative capture method...');
      
      // Try with more basic options, PNG format ensures transparency support
      const fallbackOptions: CaptureOptions = {
        format: 'png',
        quality: 1, 
        result: 'data-uri'
      };
      
      const fallbackUri = await captureRef(ref, fallbackOptions);
      console.log(`Fallback capture successful, URI length: ${fallbackUri?.length ?? 0}`);
      return fallbackUri;
    }
  } catch (error) {
    console.error('Error capturing view as PNG:', error);
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
    
    // Save to media library with proper MIME type to preserve transparency
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
    
    console.log('Successfully captured image with transparency, now copying to clipboard');
    
    // Copy the image to clipboard
    const success = await copyImageToClipboard(pngUri);
    return success;
  } catch (error) {
    console.error('Error copying canvas to clipboard:', error);
    return false;
  }
} 