import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTool } from '../contexts/ToolContext';
import { rgbToString } from '../utils/colorUtils';
import { RGBColor } from '../types/app.types';

interface ColorPickerProps {
  onClose: () => void;
}

// Predefined color palette
const colorPalette: RGBColor[] = [
  { r: 0, g: 0, b: 0 },           // Black
  { r: 255, g: 255, b: 255 },     // White
  { r: 255, g: 0, b: 0 },         // Red
  { r: 0, g: 255, b: 0 },         // Green
  { r: 0, g: 0, b: 255 },         // Blue
  { r: 255, g: 255, b: 0 },       // Yellow
  { r: 255, g: 0, b: 255 },       // Magenta
  { r: 0, g: 255, b: 255 },       // Cyan
  { r: 255, g: 165, b: 0 },       // Orange
  { r: 128, g: 0, b: 128 },       // Purple
  { r: 165, g: 42, b: 42 },       // Brown
  { r: 128, g: 128, b: 128 },     // Gray
];

// Recent colors history (would be persisted in a real app)
const recentColors: RGBColor[] = [
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 0, g: 255, b: 0 },
];

const ColorPicker: React.FC<ColorPickerProps> = ({ onClose }) => {
  const { state, setColor } = useTool();
  const [selectedColor, setSelectedColor] = useState<RGBColor>(state.color);

  // Handle color selection
  const handleColorSelect = (color: RGBColor) => {
    setSelectedColor(color);
    setColor(color.r, color.g, color.b, color.a);
  };

  // Apply color and close
  const handleApply = () => {
    // In a real app, we'd also update recent colors here
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Color Picker</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectedColorContainer}>
        <View
          style={[
            styles.selectedColorPreview,
            { backgroundColor: rgbToString(selectedColor) },
          ]}
        />
        <Text style={styles.selectedColorText}>
          RGB: {selectedColor.r}, {selectedColor.g}, {selectedColor.b}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Colors</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.colorRow}>
            {recentColors.map((color, index) => (
              <TouchableOpacity
                key={`recent-${index}`}
                style={[
                  styles.colorButton,
                  {
                    backgroundColor: rgbToString(color),
                    borderColor:
                      selectedColor.r === color.r &&
                      selectedColor.g === color.g &&
                      selectedColor.b === color.b
                        ? '#007AFF'
                        : '#cccccc',
                  },
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color Palette</Text>
        <View style={styles.paletteContainer}>
          {colorPalette.map((color, index) => (
            <TouchableOpacity
              key={`palette-${index}`}
              style={[
                styles.colorButton,
                {
                  backgroundColor: rgbToString(color),
                  borderColor:
                    selectedColor.r === color.r &&
                    selectedColor.g === color.g &&
                    selectedColor.b === color.b
                      ? '#007AFF'
                      : '#cccccc',
                },
              ]}
              onPress={() => handleColorSelect(color)}
            />
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
    maxHeight: 400,
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
  selectedColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cccccc',
    marginRight: 10,
  },
  selectedColorText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  paletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
    borderWidth: 2,
  },
  applyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ColorPicker;