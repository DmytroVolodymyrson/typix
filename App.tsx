import React, { useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Modal, Alert, SafeAreaView, Dimensions, Platform, ToastAndroid } from 'react-native';
import { CanvasProvider } from './src/contexts/CanvasContext';
import { ToolProvider } from './src/contexts/ToolContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import Canvas from './src/components/Canvas';
import ToolBar from './src/components/ToolBar';
import ColorPicker from './src/components/ColorPicker';
import BrushSizeSlider from './src/components/BrushSizeSlider';
import { captureCanvasAsPng, saveToGallery, copyCanvasToClipboard } from './src/modules/image/galleryUtils';
import { useSettings } from './src/contexts/SettingsContext';

// Get screen dimensions - memoized to prevent unnecessary re-calculations
const windowDimensions = Dimensions.get('window');
const { width, height } = windowDimensions;

export default function App() {
  // Wrap the app content with providers
  return (
    <SettingsProvider>
      <ToolProvider>
        <CanvasProvider>
          <AppContent />
        </CanvasProvider>
      </ToolProvider>
    </SettingsProvider>
  );
}

// Helper function to show minimal feedback based on platform
const showMinimalFeedback = (message: string) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else if (Platform.OS === 'ios') {
    // On iOS, we could use a toast library, but for simplicity
    // we'll use a short-lived alert
    Alert.alert('', message);
    // Auto-dismiss is not available in the React Native Alert API
    // We'll rely on the user to dismiss instead
  } else {
    // For web, console log is sufficient
    console.log(message);
  }
};

// Main app content
function AppContent() {
  const { settings } = useSettings();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Canvas dimensions (slightly smaller than screen) - memoized values
  const canvasWidth = React.useMemo(() => width, [width]);
  const canvasHeight = React.useMemo(() => height - 120, [height]); // Account for toolbar and status bar

  // Handle save to gallery
  const handleSavePress = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Verify that the reference exists and is valid
      if (!canvasRef || !canvasRef.current) {
        throw new Error('Canvas reference not available');
      }
      
      // Capture canvas as PNG with transparency
      const pngUri = await captureCanvasAsPng(canvasRef);
      
      if (!pngUri) {
        throw new Error('Failed to capture canvas');
      }
      
      // Save directly to gallery
      const success = await saveToGallery(pngUri);
      
      if (success) {
        showMinimalFeedback('Saved to gallery');
      } else {
        throw new Error('Failed to save to gallery');
      }
    } catch (error) {
      console.error('Save error:', error);
      showMinimalFeedback('Could not save image');
    } finally {
      setIsProcessing(false);
    }
  }, [canvasRef, isProcessing]);

  // Handle copy to clipboard
  const handleCopyToClipboardPress = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Verify that the reference exists and is valid
      if (!canvasRef || !canvasRef.current) {
        throw new Error('Canvas reference not available');
      }
      
      // Copy canvas to clipboard
      const success = await copyCanvasToClipboard(canvasRef);
      
      if (success) {
        showMinimalFeedback('Copied to clipboard');
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      showMinimalFeedback('Could not copy to clipboard');
    } finally {
      setIsProcessing(false);
    }
  }, [canvasRef, isProcessing]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.canvasContainer}>
        <Canvas 
          width={canvasWidth} 
          height={canvasHeight}
          ref={canvasRef}
        />
      </View>
      
      <ToolBar
        onColorPickerPress={() => setShowColorPicker(true)}
        onSizePickerPress={() => setShowSizePicker(true)}
        onSavePress={handleSavePress}
        onCopyToClipboardPress={handleCopyToClipboardPress}
        isProcessing={isProcessing}
      />
      
      {/* Color Picker Modal */}
      <Modal
        visible={showColorPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ColorPicker onClose={() => setShowColorPicker(false)} />
          </View>
        </View>
      </Modal>
      
      {/* Brush Size Picker Modal */}
      <Modal
        visible={showSizePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSizePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <BrushSizeSlider onClose={() => setShowSizePicker(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
});