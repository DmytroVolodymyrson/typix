import React, { useState, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Modal, Alert, SafeAreaView, Dimensions, Platform, ToastAndroid, KeyboardAvoidingView } from 'react-native';
import { FontProvider } from './src/contexts/FontContext';
import { TextProvider } from './src/contexts/TextContext';
import { SettingsProvider, useSettings } from './src/contexts/SettingsContext';
import TextInputPanel from './src/components/TextInputPanel';
import FontSelectionPanel from './src/components/FontSelectionPanel';
import TextPreviewArea from './src/components/TextPreviewArea';
import ToolBar from './src/components/ToolBar';
import ColorPicker from './src/components/ColorPicker';
import { captureCanvasAsPng, copyCanvasToClipboard } from './src/modules/image/galleryUtils';
import { useText } from './src/contexts/TextContext';

// Get screen dimensions - memoized to prevent unnecessary re-calculations
const windowDimensions = Dimensions.get('window');
const { width, height } = windowDimensions;

export default function App() {
  // Wrap the app content with providers
  return (
    <SettingsProvider>
      <FontProvider>
        <TextProvider>
          <AppContent />
        </TextProvider>
      </FontProvider>
    </SettingsProvider>
  );
}

// Show minimal feedback to user about action completion
function showMinimalFeedback(message: string) {
  // Use platform-specific feedback mechanisms
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else if (Platform.OS === 'ios') {
    // Use an alert for iOS
    Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
  } else {
    // For web and other platforms, may have other feedback options
    console.log(`Feedback: ${message}`);
  }
}

// Main app content
function AppContent() {
  const { settings } = useSettings();
  const { state: textState } = useText();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const previewRef = useRef(null);
  
  // Panel expansion state
  const [expandedPanel, setExpandedPanel] = useState<string>('textInput');
  
  // Toggle panel expansion
  const togglePanel = (panelName: string) => {
    if (expandedPanel === panelName) {
      setExpandedPanel('');
    } else {
      setExpandedPanel(panelName);
    }
  };

  // Preview dimensions (slightly smaller than screen)
  const previewWidth = React.useMemo(() => width - 32, [width]);
  const previewHeight = React.useMemo(() => {
    // Calculate reasonable height for preview area
    return 200; // Fixed height to avoid layout issues
  }, []);

  // Handle copy to clipboard
  const handleCopyToClipboardPress = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    // Check if there's actual content to copy
    if (!textState.content) {
      showMinimalFeedback('No text to copy');
      return;
    }

    setIsProcessing(true);

    try {
      // Verify that the reference exists and is valid
      if (!previewRef || !previewRef.current) {
        throw new Error('Preview reference not available');
      }
      
      console.log('Starting transparent PNG capture...');
      
      // Add a small delay to ensure the view is fully rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Copy to clipboard - note that we specifically capture the inner view for transparency
      // The previewRef points to the capture container which has a transparent bg
      const success = await copyCanvasToClipboard(previewRef);
      
      if (success) {
        showMinimalFeedback('Copied transparent PNG to clipboard');
      } else {
        throw new Error('Failed to copy transparent image to clipboard');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      showMinimalFeedback('Could not copy to clipboard');
    } finally {
      setIsProcessing(false);
    }
  }, [previewRef, isProcessing, textState.content]);

  // Handle reset
  const handleResetPress = useCallback(() => {
    // Handlers in the tool bar will reset state
    showMinimalFeedback('All settings reset');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.contentContainer}>
          {/* Text Input Panel */}
          <TextInputPanel
            isExpanded={expandedPanel === 'textInput'}
            onToggleExpand={() => togglePanel('textInput')}
          />
          
          {/* Font Selection Panel */}
          <FontSelectionPanel
            isExpanded={expandedPanel === 'fontSelection'}
            onToggleExpand={() => togglePanel('fontSelection')}
          />
          
          {/* Text Preview Area - The transparent preview is inside this component */}
          <View style={styles.previewContainer}>
            <TextPreviewArea
              ref={previewRef}
              width={previewWidth}
              height={previewHeight}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Toolbar - fixed at bottom */}
      <View style={styles.toolbarContainer}>
        <ToolBar
          onCopyToClipboardPress={handleCopyToClipboardPress}
          onResetPress={handleResetPress}
          isProcessing={isProcessing}
        />
      </View>
      
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarContainer: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});