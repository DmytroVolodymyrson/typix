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
 * Sets clipboard content
 * @param content Text content to set in clipboard
 * @returns Promise resolving when clipboard is set
 */
export async function setClipboardContent(content: string): Promise<void> {
  try {
    await Clipboard.setStringAsync(content);
  } catch (error) {
    console.error('Failed to set clipboard content:', error);
    throw new Error('Failed to set clipboard content');
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
    console.log('Copying image to clipboard...');
    
    // Web platform - use Clipboard API with proper error handling
    if (Platform.OS === 'web') {
      // Make sure we have the base64 data and it's properly formatted
      if (!base64Data || !base64Data.includes('base64')) {
        throw new Error('Invalid image data format');
      }
      
      // Extract the MIME type and actual base64 data
      const [mimeTypeHeader, base64Content] = base64Data.split(',');
      const mimeType = mimeTypeHeader.match(/:(.*?);/)?.[1] || 'image/webp';
      
      // Convert base64 to blob - safely handling potential errors
      try {
        const byteCharacters = atob(base64Content);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const byteArray = new Uint8Array(byteArrays);
        const blob = new Blob([byteArray], { type: mimeType });
      
        // Use ClipboardItem API (modern browsers only)
        if (typeof ClipboardItem !== 'undefined') {
          const clipboardContent = new ClipboardItem({
            [mimeType]: blob
          });
          
          await navigator.clipboard.write([clipboardContent]);
          console.log('Image copied to clipboard using Clipboard API');
          return true;
        } else {
          // Fallback for browsers without ClipboardItem support
          console.warn('ClipboardItem API not available, using fallback');
          
          // Create a temporary image element and trigger copy
          const img = document.createElement('img');
          img.src = base64Data;
          document.body.appendChild(img);
          
          try {
            // Select the image
            const range = document.createRange();
            range.selectNode(img);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            
            // Execute copy command
            const success = document.execCommand('copy');
            window.getSelection()?.removeAllRanges();
            document.body.removeChild(img);
            
            if (success) {
              console.log('Image copied using execCommand fallback');
              return true;
            } else {
              throw new Error('execCommand copy failed');
            }
          } catch (execError) {
            document.body.removeChild(img);
            console.error('execCommand clipboard fallback failed:', execError);
            
            // Last resort: copy as string
            await Clipboard.setStringAsync(base64Data);
            console.log('Copied base64 string as fallback');
        return true;
          }
        }
      } catch (conversionError) {
        console.error('Error converting base64 to blob:', conversionError);
        // Fallback to string clipboard
        await Clipboard.setStringAsync(base64Data);
        return true;
      }
    } 
    // Native platforms (iOS, Android)
    else {
      // On iOS and Android, the best approach is to save to a temporary file
      // and then use the sharing API (which includes clipboard options)
      
      // Create a temporary file path with proper extension
      const tempFilePath = `${FileSystem.cacheDirectory}temp_clipboard_image.png`;
      
      // Extract just the base64 data without the MIME prefix if present
      const base64Content = base64Data.includes('base64,') 
        ? base64Data.split('base64,')[1] 
        : base64Data;
      
      // Write the image to a temporary file
      await FileSystem.writeAsStringAsync(tempFilePath, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        // This will open the sharing menu which includes "Copy" option on most devices
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'image/png',
          dialogTitle: 'Copy Image to Clipboard',
        });
        console.log('Image shared via sharing menu (includes clipboard option)');
        return true;
    } else {
        // If sharing isn't available, fall back to basic clipboard (text)
        console.warn('Sharing API not available, falling back to text clipboard');
      await Clipboard.setStringAsync(base64Data);
      return true;
      }
    }
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    
    // Even if image clipboard fails, try to copy as text as a last resort
    try {
      await Clipboard.setStringAsync(base64Data);
      console.log('Copied base64 string as ultimate fallback');
      return true;
    } catch (fallbackError) {
      console.error('Even fallback clipboard failed:', fallbackError);
    return false;
    }
  }
}