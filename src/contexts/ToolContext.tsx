import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ToolSettings, ToolAction, ToolType } from '../types/tools.types';

// Initial tool settings
const initialToolSettings: ToolSettings = {
  type: 'pen',
  color: { r: 0, g: 0, b: 0, a: 1 },
  size: 5,
  opacity: 1,
};

// Tool reducer function
function toolReducer(state: ToolSettings, action: ToolAction): ToolSettings {
  switch (action.type) {
    case 'SET_TOOL':
      return {
        ...state,
        type: action.payload.tool,
      };
    
    case 'SET_COLOR':
      return {
        ...state,
        color: action.payload.color,
      };
    
    case 'SET_SIZE':
      return {
        ...state,
        size: action.payload.size,
      };
    
    case 'SET_OPACITY':
      return {
        ...state,
        opacity: action.payload.opacity,
      };
    
    default:
      return state;
  }
}

// Create context
type ToolContextType = {
  state: ToolSettings;
  dispatch: React.Dispatch<ToolAction>;
  setTool: (tool: ToolType) => void;
  setColor: (r: number, g: number, b: number, a?: number) => void;
  setSize: (size: number) => void;
  setOpacity: (opacity: number) => void;
};

const ToolContext = createContext<ToolContextType | undefined>(undefined);

// Provider component
export function ToolProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toolReducer, initialToolSettings);

  // Helper functions for common operations
  const setTool = (tool: ToolType) => {
    dispatch({ type: 'SET_TOOL', payload: { tool } });
  };

  const setColor = (r: number, g: number, b: number, a = 1) => {
    dispatch({ type: 'SET_COLOR', payload: { color: { r, g, b, a } } });
  };

  const setSize = (size: number) => {
    dispatch({ type: 'SET_SIZE', payload: { size } });
  };

  const setOpacity = (opacity: number) => {
    dispatch({ type: 'SET_OPACITY', payload: { opacity } });
  };

  return (
    <ToolContext.Provider
      value={{
        state,
        dispatch,
        setTool,
        setColor,
        setSize,
        setOpacity,
      }}
    >
      {children}
    </ToolContext.Provider>
  );
}

// Hook for using tool context
export function useTool() {
  const context = useContext(ToolContext);
  if (context === undefined) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
}