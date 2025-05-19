import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTool } from '../contexts/ToolContext';
import { useCanvas } from '../contexts/CanvasContext';
import { ToolType } from '../types/tools.types';

interface ToolBarProps {
  onColorPickerPress: () => void;
  onSizePickerPress: () => void;
  onSavePress: () => void;
  onCopyToClipboardPress: () => void;
  isProcessing?: boolean;
}

const ToolBar: React.FC<ToolBarProps> = ({
  onColorPickerPress,
  onSizePickerPress,
  onSavePress,
  onCopyToClipboardPress,
  isProcessing = false,
}) => {
  const { state, setTool } = useTool();
  const { undo, clearCanvas } = useCanvas();

  // Tool selection handler
  const handleToolPress = (tool: ToolType) => {
    setTool(tool);
  };

  return (
    <View style={styles.container}>
      {/* Drawing tools */}
      <View style={styles.toolGroup}>
        <TouchableOpacity
          style={[
            styles.toolButton,
            state.type === 'pen' && styles.activeToolButton,
          ]}
          onPress={() => handleToolPress('pen')}
          disabled={isProcessing}
        >
          <Ionicons
            name="pencil"
            size={24}
            color={state.type === 'pen' ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            state.type === 'eraser' && styles.activeToolButton,
          ]}
          onPress={() => handleToolPress('eraser')}
          disabled={isProcessing}
        >
          <Ionicons
            name="trash-outline"
            size={24}
            color={state.type === 'eraser' ? '#ffffff' : '#000000'}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={onColorPickerPress}
          disabled={isProcessing}
        >
          <View
            style={[
              styles.colorPreview,
              {
                backgroundColor: `rgba(${state.color.r}, ${state.color.g}, ${state.color.b}, ${state.color.a || 1})`,
              },
            ]}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={onSizePickerPress}
          disabled={isProcessing}
        >
          <View style={styles.sizeButton}>
            <View
              style={[
                styles.sizePreview,
                { width: Math.min(state.size * 2, 20), height: Math.min(state.size * 2, 20) },
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Action buttons */}
      <View style={styles.toolGroup}>
        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={undo}
          disabled={isProcessing}
        >
          <Ionicons name="arrow-undo" size={24} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toolButton} 
          onPress={clearCanvas}
          disabled={isProcessing}
        >
          <Ionicons name="refresh-outline" size={24} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton,
            styles.clipboardButton,
            isProcessing && styles.processingButton
          ]}
          onPress={onCopyToClipboardPress}
          disabled={isProcessing}
        >
          <Ionicons name="copy-outline" size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toolButton, 
            styles.saveButton,
            isProcessing && styles.processingButton
          ]}
          onPress={onSavePress}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.saveText}>Processing...</Text>
            </>
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color="#ffffff" />
              <Text style={styles.saveText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginHorizontal: 5,
  },
  activeToolButton: {
    backgroundColor: '#007AFF',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  sizeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  sizePreview: {
    backgroundColor: '#000000',
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50', // Green color for save
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 15,
  },
  clipboardButton: {
    backgroundColor: '#007AFF', // Blue color for clipboard
  },
  processingButton: {
    backgroundColor: '#8eb4df', // Lighter blue to indicate processing
  },
  saveText: {
    color: '#ffffff',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default ToolBar;