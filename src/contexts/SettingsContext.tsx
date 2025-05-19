import React, { createContext, useContext, useState, ReactNode } from 'react';

// App settings type
type AppSettings = {
  darkMode: boolean;
  autoSave: boolean;
  webpQuality: number; // 0-100
};

// Initial settings
const initialSettings: AppSettings = {
  darkMode: false,
  autoSave: true,
  webpQuality: 90,
};

// Create context
type SettingsContextType = {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  toggleDarkMode: () => void;
  toggleAutoSave: () => void;
  setWebpQuality: (quality: number) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  // Function to update settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Helper functions for common operations
  const toggleDarkMode = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      darkMode: !prevSettings.darkMode,
    }));
  };

  const toggleAutoSave = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      autoSave: !prevSettings.autoSave,
    }));
  };

  const setWebpQuality = (quality: number) => {
    // Ensure quality is between 0-100
    const validQuality = Math.max(0, Math.min(100, quality));
    setSettings(prevSettings => ({
      ...prevSettings,
      webpQuality: validQuality,
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleDarkMode,
        toggleAutoSave,
        setWebpQuality,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook for using settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}