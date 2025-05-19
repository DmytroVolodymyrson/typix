/**
 * Platform-specific utilities
 */
import { Platform } from 'react-native';

/**
 * Checks if the app is running on web
 */
export const isWeb = () => Platform.OS === 'web';

/**
 * Checks if the app is running on iOS
 */
export const isIOS = () => Platform.OS === 'ios';

/**
 * Checks if the app is running on Android
 */
export const isAndroid = () => Platform.OS === 'android';

/**
 * Get platform-specific style value
 */
export const selectPlatformValue = <T>(specifics: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T => {
  if (isIOS() && specifics.ios !== undefined) return specifics.ios;
  if (isAndroid() && specifics.android !== undefined) return specifics.android;
  if (isWeb() && specifics.web !== undefined) return specifics.web;
  return specifics.default;
};