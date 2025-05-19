import React, { useRef, useEffect, forwardRef } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useCanvas } from '../contexts/CanvasContext';
import { useTool } from '../contexts/ToolContext';
import { rgbToString } from '../utils/colorUtils';
import { createSmoothPath, simplifyPath } from '../modules/canvas/bezierUtils';
import { DrawCommand } from '../types/canvas.types';

interface CanvasProps {
  width: number;
  height: number;
}

// Create Canvas component with forwardRef
const Canvas = forwardRef<View, CanvasProps>((props, ref) => {
  const { width, height } = props;
  const { state, startStroke, continueStroke, endStroke, setCanvasDimensions } = useCanvas();
  const { state: toolState } = useTool();
  
  // Use the forwarded ref or create our own if not provided
  const internalRef = useRef<View>(null);
  // We're using the external ref passed from the parent component
  // This allows the parent to access this view (important for ViewShot)

  // Update canvas dimensions when props change
  useEffect(() => {
    // This effect should only run when width or height actually changes
    setCanvasDimensions(width, height);
  }, [width, height, setCanvasDimensions]);

  // Set up pan responder for touch handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      const { color, size } = toolState;
      
      // Start drawing on touch
      startStroke(locationX, locationY, color, size);
    },
    
    onPanResponderMove: (event: GestureResponderEvent) => {
      const { locationX, locationY } = event.nativeEvent;
      
      // Continue drawing as touch moves
      continueStroke(locationX, locationY);
    },
    
    onPanResponderRelease: () => {
      // End drawing when touch ends
      endStroke();
    },
    
    onPanResponderTerminate: () => {
      // End drawing if touch is cancelled
      endStroke();
    },
  });

  // Render path for a draw command
  const renderPath = (command: DrawCommand) => {
    if (!command.points || command.points.length < 2 || !command.style) {
      return null;
    }

    // Simplify path for better performance
    const simplifiedPoints = simplifyPath(command.points);
    
    // Create SVG path data
    const pathData = createSmoothPath(simplifiedPoints);
    
    // Convert color to string format
    const strokeColor = rgbToString(command.style.color);
    
    return (
      <Path
        key={command.id}
        d={pathData}
        stroke={strokeColor}
        strokeWidth={command.style.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  };

  // Render current path being drawn
  const renderCurrentPath = () => {
    if (!state.currentCommand || 
        !state.currentCommand.points || 
        state.currentCommand.points.length < 2 || 
        !state.currentCommand.style) {
      return null;
    }

    // Simplify current path
    const simplifiedPoints = simplifyPath(state.currentCommand.points);
    
    // Create SVG path data
    const pathData = createSmoothPath(simplifiedPoints);
    
    // Convert color to string format
    const strokeColor = rgbToString(state.currentCommand.style.color);
    
    return (
      <Path
        d={pathData}
        stroke={strokeColor}
        strokeWidth={state.currentCommand.style.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    );
  };

  return (
    <View
      style={[styles.container, { width, height }]}
      {...panResponder.panHandlers}
      ref={ref || internalRef}
    >
      <Svg width="100%" height="100%">
        <G>
          {/* Render all completed paths */}
          {state.commands.map(renderPath)}
          
          {/* Render current path being drawn */}
          {renderCurrentPath()}
        </G>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
});

// Important to add a displayName for debugging and dev tools
Canvas.displayName = 'Canvas';

export default Canvas;