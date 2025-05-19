/**
 * File storage utilities
 */
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as IntentLauncher from 'expo-intent-launcher';

// Define app-specific directory
const APP_DIRECTORY = 'Typix';

/**
 * Save image to device file system
 * @param base64Data Base64 encoded image data
 * @param filename Optional filename (without extension)
 * @returns Promise resolving to the saved file URI
 */
export async function saveImageToDevice(
  base64Data: string,
  filename: string = 'typix_drawing'
): Promise<string> {
  try {
    console.log('Saving image to file system...');
    
    // Extract just the base64 data without the MIME prefix if present
    const base64Content = base64Data.includes('base64,') 
      ? base64Data.split('base64,')[1] 
      : base64Data;
    
    // Determine file extension based on MIME type
    const isWebP = base64Data.includes('image/webp');
    const extension = isWebP ? 'webp' : 'png';
    
    // Create a timestamped filename to avoid conflicts
    const timestamp = new Date().getTime();
    const fullFilename = `${filename}_${timestamp}.${extension}`;
    
    // Handle based on platform
    if (Platform.OS === 'web') {
      // For web, download the file directly (no change needed)
      const fileUri = `data:image/${extension};base64,${base64Content}`;
      const link = document.createElement('a');
      link.href = fileUri;
      link.download = fullFilename;
      link.click();
      return fileUri;
    } else {
      // For native platforms, save to document directory
      
      // Ensure app directory exists in documents directory
      const documentsDir = FileSystem.documentDirectory;
      const appDir = `${documentsDir}${APP_DIRECTORY}`;
      
      // Check if our app directory exists, create it if it doesn't
      const dirInfo = await FileSystem.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
        console.log(`Created app directory at ${appDir}`);
      }
      
      // Create the file path in the app's document directory
      const filePath = `${appDir}/${fullFilename}`;
      
      // Write the image to the file using createDownloadResumable for reliability
      await FileSystem.writeAsStringAsync(filePath, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log(`Image saved to file system: ${filePath}`);
      
      // Share or open the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: `image/${extension}`,
          dialogTitle: 'Image Saved',
          UTI: extension === 'webp' ? 'public.webp' : 'public.png'
        });
        return filePath;
      } else if (Platform.OS === 'android') {
        // On Android, we can use IntentLauncher to open the file
        try {
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: filePath,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: `image/${extension}`
          });
        } catch (intentError) {
          console.log('Could not open file with intent:', intentError);
          // Show path to user if we can't open it
          Alert.alert('File Saved', `File saved to: ${filePath}`);
        }
      }
      
      return filePath;
    }
  } catch (error) {
    console.error('Failed to save image to file system:', error);
    throw new Error('Failed to save image to file system');
  }
}

/**
 * List all saved images in the app directory
 * @returns Promise resolving to array of file URIs
 */
export async function listSavedImages(): Promise<string[]> {
  try {
    if (Platform.OS === 'web') {
      // Web doesn't have access to file system in the same way
      return [];
    }
    
    const documentsDir = FileSystem.documentDirectory;
    const appDir = `${documentsDir}${APP_DIRECTORY}`;
    
    // Check if our directory exists
    const dirInfo = await FileSystem.getInfoAsync(appDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      return [];
    }
    
    // List all files in the directory
    const files = await FileSystem.readDirectoryAsync(appDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => 
      file.endsWith('.png') || file.endsWith('.webp')
    );
    
    // Return full paths
    return imageFiles.map(file => `${appDir}/${file}`);
  } catch (error) {
    console.error('Failed to list saved images:', error);
    return [];
  }
}

/**
 * Get app's save directory path
 * @returns Promise resolving to save directory path
 */
export function getSaveDirectory(): string {
  if (Platform.OS === 'web') {
    // Web doesn't have a storage directory concept
    return '';
  }
  
  // For native platforms, use app-specific directory
  return `${FileSystem.documentDirectory}${APP_DIRECTORY}`;
} 