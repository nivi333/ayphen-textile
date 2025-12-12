import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, theme as antdTheme, ThemeConfig, Spin } from 'antd';

export type AppTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggle: () => void;
  isThemeSwitching: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const DOC_PRIMARY = '#7b5fc9';
const DOC_SUCCESS = '#52c41a';
const DOC_ERROR = '#ff4d4f';
const DOC_WARNING = '#faad14';

function getInitialTheme(): AppTheme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);
  const [isThemeSwitching, setIsThemeSwitching] = useState(false);

  const setTheme = (newTheme: AppTheme) => {
    if (newTheme === theme) return;
    setIsThemeSwitching(true);
    // Small delay to show the loader before theme change
    setTimeout(() => {
      setThemeState(newTheme);
      // Keep loader visible during transition
      setTimeout(() => {
        setIsThemeSwitching(false);
      }, 400);
    }, 100);
  };

  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const antdConfig: ThemeConfig = useMemo(() => ({
    algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: DOC_PRIMARY,
      colorSuccess: DOC_SUCCESS,
      colorError: DOC_ERROR,
      colorWarning: DOC_WARNING,
      borderRadius: 10,
      fontFamily: 'Inter, ui-sans-serif, system-ui',
    },
  }), [theme]);

  const ctx: ThemeContextValue = useMemo(() => ({ theme, setTheme, toggle, isThemeSwitching }), [theme, isThemeSwitching]);

  return (
    <ThemeContext.Provider value={ctx}>
      <ConfigProvider theme={antdConfig}>
        {children}
        {/* Theme switching overlay with blur effect */}
        {isThemeSwitching && (
          <div className="theme-switching-overlay">
            <Spin size="large" />
          </div>
        )}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
