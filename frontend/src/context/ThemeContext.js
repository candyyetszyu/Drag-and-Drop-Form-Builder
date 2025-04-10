import React, { createContext, useContext, useState } from 'react';

const themes = {
  default: {
    primaryColor: '#3b82f6',
    secondaryColor: '#6b7280',
    backgroundColor: '#ffffff',
    cardBackground: '#f9fafb',
    textColor: '#111827'
  },
  corporate: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    cardBackground: '#e0f2fe',
    textColor: '#0f172a'
  },
  pastel: {
    primaryColor: '#a78bfa',
    secondaryColor: '#a8a29e',
    backgroundColor: '#ffffff',
    cardBackground: '#f5f3ff',
    textColor: '#1f2937'
  },
  nature: {
    primaryColor: '#059669',
    secondaryColor: '#4b5563',
    backgroundColor: '#ffffff',
    cardBackground: '#ecfdf5',
    textColor: '#064e3b'
  },
  // New themes
  sunset: {
    primaryColor: '#f97316',
    secondaryColor: '#78350f',
    backgroundColor: '#ffffff',
    cardBackground: '#fff7ed',
    textColor: '#431407'
  },
  ruby: {
    primaryColor: '#dc2626',
    secondaryColor: '#7f1d1d',
    backgroundColor: '#ffffff',
    cardBackground: '#fef2f2',
    textColor: '#450a0a'
  },
  ocean: {
    primaryColor: '#0284c7',
    secondaryColor: '#0c4a6e',
    backgroundColor: '#ffffff',
    cardBackground: '#f0f9ff',
    textColor: '#0c4a6e'
  },
  sunshine: {
    primaryColor: '#eab308',
    secondaryColor: '#854d0e',
    backgroundColor: '#ffffff',
    cardBackground: '#fefce8',
    textColor: '#713f12'
  },
  slate: {
    primaryColor: '#64748b',
    secondaryColor: '#475569',
    backgroundColor: '#ffffff',
    cardBackground: '#f8fafc',
    textColor: '#0f172a'
  },
  // Dark theme moved to the end
  dark: {
    primaryColor: '#1f2937',
    secondaryColor: '#4b5563',
    backgroundColor: '#111827',
    cardBackground: '#1f2937',
    textColor: '#f9fafb',
    borderColor: '#374151',
    inputBackground: '#374151',
    inputBorderColor: '#4b5563',
    inputTextColor: '#f9fafb',
    buttonTextColor: '#f9fafb'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  
  const setTheme = (themeId) => {
    if (themes[themeId]) {
      setCurrentTheme(themeId);
      
      // Apply theme colors to CSS variables
      document.documentElement.style.setProperty('--primary-color', themes[themeId].primaryColor);
      document.documentElement.style.setProperty('--secondary-color', themes[themeId].secondaryColor);
      document.documentElement.style.setProperty('--background-color', themes[themeId].backgroundColor);
      document.documentElement.style.setProperty('--card-background', themes[themeId].cardBackground);
      document.documentElement.style.setProperty('--text-color', themes[themeId].textColor);
      document.documentElement.style.setProperty('--border-color', themes[themeId].borderColor || '#e5e7eb');
      document.documentElement.style.setProperty('--input-background', themes[themeId].inputBackground || '#ffffff');
      document.documentElement.style.setProperty('--input-border-color', themes[themeId].inputBorderColor || '#d1d5db');
      document.documentElement.style.setProperty('--input-text-color', themes[themeId].inputTextColor || '#111827');
      document.documentElement.style.setProperty('--button-text-color', themes[themeId].buttonTextColor || '#ffffff');
      
      // Apply dark mode to the body element if dark theme is selected
      if (themeId === 'dark') {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  };
  
  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeColors: themes[currentTheme] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
