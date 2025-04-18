import React from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '../store/theme';
import { lightTheme, darkTheme } from '../constants/colors';

export const ThemeContext = React.createContext({
  theme: lightTheme,
  isDarkMode: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { isDarkMode } = useThemeStore();
  
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}