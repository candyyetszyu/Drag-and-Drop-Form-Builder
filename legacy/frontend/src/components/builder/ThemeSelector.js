import React from 'react';

const themes = [
  { 
    id: 'default', 
    name: 'Default Blue',
    primaryColor: '#3b82f6',
    icon: '🔵'
  },
  { 
    id: 'corporate', 
    name: 'Corporate Teal',
    primaryColor: '#0ea5e9',
    icon: '🔷'
  },
  { 
    id: 'pastel', 
    name: 'Pastel Purple',
    primaryColor: '#a78bfa',
    icon: '🟣'
  },
  { 
    id: 'nature', 
    name: 'Nature Green',
    primaryColor: '#059669',
    icon: '🟢'
  },
  { 
    id: 'sunset', 
    name: 'Sunset Orange',
    primaryColor: '#f97316',
    icon: '🟠'
  },
  { 
    id: 'ruby', 
    name: 'Ruby Red',
    primaryColor: '#dc2626',
    icon: '🔴'
  },
  { 
    id: 'ocean', 
    name: 'Ocean Blue',
    primaryColor: '#0284c7',
    icon: '🌊'
  },
  { 
    id: 'sunshine', 
    name: 'Sunshine Yellow',
    primaryColor: '#eab308',
    icon: '🟡'
  },
  { 
    id: 'slate', 
    name: 'Slate Grey',
    primaryColor: '#64748b',
    icon: '⚪'
  },
  { 
    id: 'dark', 
    name: 'Dark Mode',
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    buttonTextColor: '#f9fafb',
    icon: '⚫'
  }
];

const ThemeSelector = ({ onThemeSelect, currentTheme }) => (
  <div>
    <h2 style={{ 
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center'
    }}>
      Form Theme
      <span style={{ 
        fontSize: '0.75rem', 
        color: '#6b7280',
        fontStyle: 'italic',
        fontWeight: 'normal',
        marginLeft: '0.5rem'
      }}>
        (Click to Apply)
      </span>
    </h2>
    
    <div className="card">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {themes.map(theme => {
          const isDarkTheme = theme.id === 'dark';
          const buttonStyle = {
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            backgroundColor: theme.primaryColor,
            color: isDarkTheme ? theme.buttonTextColor : 'white',
            border: currentTheme === theme.id ? '2px solid white' : 'none',
            boxShadow: currentTheme === theme.id 
              ? isDarkTheme 
                ? '0 0 0 2px #4b5563' 
                : '0 0 0 2px #000' 
              : 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem',
          };
          
          return (
            <div
              key={theme.id}
              className="btn margin-responsive"
              onClick={() => onThemeSelect(theme.id)}
              style={buttonStyle}
            >
              <span>{theme.icon}</span>
              <span>{theme.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default ThemeSelector;
