import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadSettings, saveSettings, defaultSettings } from '../utils/settingsStorage';
import { getColors, darkColors } from '../utils/constants';

const ThemeContext = createContext({
  isDark: defaultSettings.darkMode,
  colors: darkColors,
  isLoading: false,
  toggleTheme: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  console.log('useTheme: context values', { isLoading: context?.isLoading, isDark: context?.isDark });
  // Add extra safety check
  if (!context || !context.colors) {
    console.warn('Theme context not available, using fallback');
    return {
      isDark: defaultSettings.darkMode,
      colors: darkColors,
      isLoading: false,
      toggleTheme: () => {},
    };
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(defaultSettings.darkMode);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('ThemeProvider: starting loadTheme');
    let isMounted = true;
    
    const loadTheme = async () => {
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('ThemeProvider: loadTheme timeout - setting isLoading to false');
          setIsLoading(false);
        }
      }, 5000);

      try {
        const settings = await loadSettings();
        console.log('ThemeProvider: loaded settings', settings);
        if (isMounted) {
          setIsDark(settings.darkMode);
        }
      } catch (error) {
        console.error('ThemeProvider: error loading theme:', error);
        if (isMounted) {
          setIsDark(defaultSettings.darkMode);
        }
      } finally {
        if (isMounted) {
          console.log('ThemeProvider: setting isLoading to false');
          setIsLoading(false);
        }
        clearTimeout(timeoutId);
      }
    };
    loadTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      const currentSettings = await loadSettings();
      await saveSettings({ ...currentSettings, darkMode: newIsDark });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const colors = getColors(isDark);

  const value = {
    isDark,
    colors,
    isLoading,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
