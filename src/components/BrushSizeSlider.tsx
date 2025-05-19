import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTool } from '../contexts/ToolContext';
import Slider from '@react-native-community/slider';

interface BrushSizeSliderProps {
  onClose: () => void;
}

const BrushSizeSlider: React.FC<BrushSizeSliderProps> = ({ onClose }) => {
  const { state, setSize } = useTool();
  const [size, setSliderSize] = useState(state.size);

  // Handle size change
  const handleSizeChange = (value: number) => {
    // Round to nearest integer for simplicity
    const newSize = Math.round(value);
    setSliderSize(newSize);
  };

  // Apply size and close
  const handleApply = () => {
    setSize(size);
    onClose();
  };

  // Preset size options
  const presetSizes = [1, 3, 5, 10, 15, 20];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Brush Size</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sizePreviewContainer}>
        <View style={styles.sizePreviewWrapper}>
          <View
            style={[
              styles.sizePreview,
              {
                width: Math.min(size * 2, 80),
                height: Math.min(size * 2, 80),
              },
            ]}
          />
        </View>
        <Text style={styles.sizeText}>{size}px</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>1</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={30}
          value={size}
          onValueChange={handleSizeChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#cccccc"
          thumbTintColor="#007AFF"
        />
        <Text style={styles.sliderLabel}>30</Text>
      </View>

      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Presets</Text>
        <View style={styles.presetsRow}>
          {presetSizes.map((presetSize) => (
            <TouchableOpacity
              key={`preset-${presetSize}`}
              style={[
                styles.presetButton,
                size === presetSize && styles.selectedPreset,
              ]}
              onPress={() => setSliderSize(presetSize)}
            >
              <Text
                style={[
                  styles.presetText,
                  size === presetSize && styles.selectedPresetText,
                ]}
              >
                {presetSize}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sizePreviewContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sizePreviewWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  sizePreview: {
    backgroundColor: '#000000',
    borderRadius: 40,
  },
  sizeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderLabel: {
    width: 20,
    textAlign: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  presetsContainer: {
    marginBottom: 20,
  },
  presetsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  presetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPreset: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  presetText: {
    fontSize: 14,
  },
  selectedPresetText: {
    color: '#ffffff',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BrushSizeSlider;