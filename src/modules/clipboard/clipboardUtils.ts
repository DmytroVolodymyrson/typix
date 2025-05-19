/**
 * Clipboard integration utilities
 */
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Checks if clipboard features are available on the device
 * @returns Promise resolving to boolean indicating clipboard availability
 */
export async function isClipboardAvailable(): Promise<boolean> {
  try {
    const hasStringAvailable = await Clipboard.hasStringAsync();
    // This is just to check if the API is accessible
    return true;
  } catch (error) {
    console.error('Clipboard API not available:', error);
    return false;
  }
}

/**
 * Gets clipboard content
 * @returns Promise resolving to clipboard content or null
 */
export async function getClipboardContent(): Promise<string | null> {
  try {
    // Check if Clipboard API is available
    if (!Clipboard.getStringAsync) {
      console.warn('Clipboard.getStringAsync is not available');
      return null;
    }
    
    const content = await Clipboard.getStringAsync();
    return content;
  } catch (error) {
    console.error('Failed to get clipboard content:', error);
    return null;
  }
}

/**
 * Sets clipboard content
 * @param content Text content to set in clipboard
 * @returns Promise resolving when clipboard is set
 */
export async function setClipboardContent(content: string): Promise<boolean> {
  try {
    if (!content) {
      console.warn('Attempted to set empty content to clipboard');
      return false;
    }
    
    await Clipboard.setStringAsync(content);
    return true;
  } catch (error) {
    console.error('Failed to set clipboard content:', error);
    return false;
  }
}

/**
 * Handles base64 image copy to clipboard
 * This function handles both web and native platforms differently
 * since clipboard image support varies by platform
 * 
 * @param base64Data Base64 encoded image data
 * @returns Promise resolving to boolean indicating success
 */
export async function copyImageToClipboard(base64Data: string): Promise<boolean> {
  try {
    console.log('Copying image to clipboard, data length:', base64Data?.length || 0);
    
    if (!base64Data) {
      throw new Error('No image data provided');
    }
    
    // Web platform - use Clipboard API with proper error handling
    if (Platform.OS === 'web') {
      console.log('Using web clipboard method');
      
      // For web, use simplified approach with fallbacks
      try {
        // Try using modern clipboard API first
        const response = await fetch(base64Data);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        console.log('Image copied to clipboard using Clipboard API');
        return true;
      } catch (modernError) {
        console.warn('Modern clipboard API failed:', modernError);
        
        // Fallback to string clipboard on web
        await Clipboard.setStringAsync(base64Data);
        console.log('Fallback: Copied as base64 string');
        return true;
      }
    }
    // Native platforms (iOS, Android)
    else {
      console.log('Using native clipboard method');
      
      // Create a temporary file path with proper extension
      const tempFilePath = `${FileSystem.cacheDirectory}temp_clipboard_image_${Date.now()}.png`;
      
      // Extract just the base64 data without the MIME prefix if present
      let base64Content = base64Data;
      if (base64Data.includes('base64,')) {
        base64Content = base64Data.split('base64,')[1];
      }
      
      console.log('Writing to temp file:', tempFilePath);
      
      // Write the image to a temporary file
      await FileSystem.writeAsStringAsync(tempFilePath, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('File written, checking if sharing is available');
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        console.log('Sharing is available, opening share dialog');
        // This will open the sharing menu which includes "Copy" option on most devices
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'image/png',
          dialogTitle: 'Copy Image to Clipboard',
        });
        console.log('Image shared via sharing menu');
        return true;
      } else {
        console.log('Sharing not available, falling back to text clipboard');
        // If sharing isn't available, fall back to basic text clipboard
        const success = await setClipboardContent(base64Data);
        return success;
      }
    }
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    
    // Try fallback as string
    try {
      console.log('Trying ultimate fallback - copying as text');
      if (base64Data) {
        await Clipboard.setStringAsync(base64Data);
        console.log('Copied as text fallback');
        return true;
      }
      return false;
    } catch (fallbackError) {
      console.error('Even fallback clipboard failed:', fallbackError);
      return false;
    }
  }
}