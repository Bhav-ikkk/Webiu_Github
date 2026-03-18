'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Sync theme on mount
  useEffect(() => {
    setMounted(true);

    // Check localStorage first
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
      document.documentElement.className = stored;
      return;
    }

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setThemeState('light');
      document.documentElement.className = 'light';
    } else {
      setThemeState('dark');
      document.documentElement.className = 'dark';
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    document.documentElement.className = newTheme;
    localStorage.setItem('theme', newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Prevent flash by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'dark', setTheme: () => {}, toggleTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
