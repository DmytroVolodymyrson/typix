import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CanvasState, CanvasAction } from '../types/canvas.types';
import { generateId } from '../utils/idUtils';

// Initial state for canvas
const initialCanvasState: CanvasState = {
  commands: [],
  scale: 1,
  offset: { x: 0, y: 0 },
  dimensions: { width: 0, height: 0 },
};

// Canvas reducer function
function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'START_STROKE':
      return {
        ...state,
        currentCommand: {
          id: action.payload.id,
          type: 'stroke',
          points: [action.payload.point],
          style: action.payload.style,
        },
      };
    
    case 'ADD_POINT':
      if (!state.currentCommand) return state;
      
      return {
        ...state,
        currentCommand: {
          ...state.currentCommand,
          points: [...(state.currentCommand.points || []), action.payload.point],
        },
      };
    
    case 'END_STROKE':
      if (!state.currentCommand) return state;
      
      return {
        ...state,
        commands: [...state.commands, state.currentCommand],
        currentCommand: undefined,
      };
    
    case 'CLEAR_CANVAS':
      return {
        ...state,
        commands: [],
        currentCommand: undefined,
      };
    
    case 'UNDO':
      // Simple undo - remove last command
      if (state.commands.length === 0) return state;
      
      return {
        ...state,
        commands: state.commands.slice(0, -1),
      };
    
    case 'SET_SCALE':
      return {
        ...state,
        scale: action.payload.scale,
      };
    
    case 'SET_OFFSET':
      return {
        ...state,
        offset: {
          x: action.payload.x,
          y: action.payload.y,
        },
      };
    
    case 'SET_DIMENSIONS':
      return {
        ...state,
        dimensions: {
          width: action.payload.width,
          height: action.payload.height,
        },
      };
    
    default:
      return state;
  }
}

// Create context
type CanvasContextType = {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  startStroke: (x: number, y: number, color: { r: number; g: number; b: number }, width: number) => void;
  continueStroke: (x: number, y: number) => void;
  endStroke: () => void;
  clearCanvas: () => void;
  undo: () => void;
  setCanvasDimensions: (width: number, height: number) => void;
};

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// Provider component
export function CanvasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);

  // Helper functions for common operations
  const startStroke = (x: number, y: number, color: { r: number; g: number; b: number }, width: number) => {
    dispatch({
      type: 'START_STROKE',
      payload: {
        id: generateId(),
        point: { x, y },
        style: { color, width },
      },
    });
  };

  const continueStroke = (x: number, y: number) => {
    dispatch({
      type: 'ADD_POINT',
      payload: {
        point: { x, y },
      },
    });
  };

  const endStroke = () => {
    dispatch({ type: 'END_STROKE' });
  };

  const clearCanvas = () => {
    dispatch({ type: 'CLEAR_CANVAS' });
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const setCanvasDimensions = (width: number, height: number) => {
    // Only update dimensions if they've actually changed
    if (width !== state.dimensions.width || height !== state.dimensions.height) {
      dispatch({
        type: 'SET_DIMENSIONS',
        payload: { width, height },
      });
    }
  };

  return (
    <CanvasContext.Provider
      value={{
        state,
        dispatch,
        startStroke,
        continueStroke,
        endStroke,
        clearCanvas,
        undo,
        setCanvasDimensions,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

// Hook for using canvas context
export function useCanvas() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}