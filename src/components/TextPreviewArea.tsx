import React, { forwardRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { useText } from '../contexts/TextContext';
import { useFont } from '../contexts/FontContext';
import { rgbToString } from '../utils/colorUtils';

interface TextPreviewAreaProps {
  width: number;
  height: number;
}

const TextPreviewArea = forwardRef<View, TextPreviewAreaProps>((props, ref) => {
  const { width, height } = props;
  const { state: textState } = useText();
  const { state: fontState, getSelectedFont } = useFont();
  const [fontLoaded, setFontLoaded] = useState<boolean>(false);
  
  // Get the selected font object directly using the utility function
  const selectedFont = getSelectedFont();
  
  // More aggressive font loading check
  useEffect(() => {
    const checkFontLoaded = async () => {
      if (textState.style.fontFamily === 'System') {
        setFontLoaded(true);
        return;
      }
      
      try {
        // If no selected font, we can't proceed
        if (!selectedFont) {
          setFontLoaded(false);
          return;
        }
        
        // Check if either the primary name or original name is loaded
        const isPrimaryLoaded = Font.isLoaded(selectedFont.name);
        const isOriginalLoaded = selectedFont.originalName 
          ? Font.isLoaded(selectedFont.originalName) 
          : false;
        
        // If either name is loaded or our state says it's loaded, consider it loaded
        if (isPrimaryLoaded || isOriginalLoaded || selectedFont.isLoaded) {
          setFontLoaded(true);
        } else {
          setFontLoaded(false);
          
          // If font isn't loaded but should be, try loading it again
          if (!selectedFont.isLoaded) {
            try {
              await Font.loadAsync({
                [selectedFont.name]: selectedFont.uri
              });
              
              if (selectedFont.originalName) {
                await Font.loadAsync({
                  [selectedFont.originalName]: selectedFont.uri
                });
              }
              
              setFontLoaded(true);
            } catch (error) {
              console.error('Error reloading font:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error checking font loaded status:', error);
        setFontLoaded(false);
      }
    };
    
    checkFontLoaded();
  }, [textState.style.fontFamily, selectedFont]);
  
  // Get text alignment style
  const getTextAlignStyle = () => {
    switch (textState.style.alignment) {
      case 'left':
        return { textAlign: 'left' as const };
      case 'right':
        return { textAlign: 'right' as const };
      case 'center':
      default:
        return { textAlign: 'center' as const };
    }
  };
  
  // Add a memo to prevent unnecessary recalculations
  const fontFamily = React.useMemo(() => {
    // If using system font, return undefined to use system default
    if (textState.style.fontFamily === 'System') {
      return undefined;
    }
    
    // If we have a selected font, prefer to use its registered name
    if (selectedFont) {
      return selectedFont.name;
    }
    
    // Fall back to the text state's font family if no font object is found
    return textState.style.fontFamily;
  }, [textState.style.fontFamily, selectedFont]);
  
  // This is the actual render content
  const hasContent = !!textState.content;
  const contentToRender = hasContent ? textState.content : 'Enter text and select a font to preview';
  const textColor = hasContent ? rgbToString(textState.style.color) : '#999999';
  
  // The outer container has UI decoration (borders, bg color) for display,
  // but the actual content container is completely transparent for capture
  return (
    <View
      style={[
        styles.outerContainer,
        { width, height }
      ]}
    >
      {/* The inner transparent view that will be captured */}
      <View
        ref={ref}
        collapsable={false}
        nativeID="text-preview-capture"
        style={[styles.captureContainer]}
      >
        <View 
          style={styles.textWrapper}
          collapsable={false}
        >
          <Text
            style={[
              styles.text,
              {
                fontFamily: fontFamily,
                fontSize: textState.style.fontSize || 24,
                color: textColor,
              },
              getTextAlignStyle(),
            ]}
          >
            {contentToRender}
          </Text>
        </View>
      </View>
      
      {/* Loading indicator */}
      {textState.style.fontFamily !== 'System' && !fontLoaded && hasContent && (
        <Text style={styles.fontLoadingText}>
          Loading font...
        </Text>
      )}
    </View>
  );
});

// Important to add a displayName for debugging and dev tools
TextPreviewArea.displayName = 'TextPreviewArea';

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginTop: 20,
    marginBottom: 40,
    overflow: 'hidden',
  },
  captureContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'transparent', // Critical for transparent PNG
  },
  textWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure wrapper is also transparent
  },
  text: {
    width: '100%',
    backgroundColor: 'transparent', // Ensure text background is transparent
  },
  fontLoadingText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default TextPreviewArea;