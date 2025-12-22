import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ConfigProvider, Spin } from 'antd';
import { ThemeProvider as AyphenThemeProvider, useGlobalTheme } from '@ayphen-web/theme';

export type AppTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggle: () => void;
  isThemeSwitching: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

import { lightColorTokens, extraColorTokensLight } from '../../theme/src/lib/color-tokens/light';
import { darkColorTokens, extraColorTokensDark } from '../../theme/src/lib/color-tokens/dark';

// Helper to convert camelCase to kebab-case for CSS variables
const toKebabCase = (str: string) =>
  str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();

// Inner component that uses the Ayphen theme
function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const { isDarkMode, toggleTheme, antTheme } = useGlobalTheme();
  const [isThemeSwitching, setIsThemeSwitching] = useState(false);

  const theme: AppTheme = isDarkMode ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Inject CSS variables
    const tokens =
      theme === 'dark'
        ? { ...darkColorTokens, ...extraColorTokensDark }
        : { ...lightColorTokens, ...extraColorTokensLight };

    Object.entries(tokens).forEach(([key, value]) => {
      // Handle gradients or simple color strings
      if (typeof value === 'string') {
        const cssVarName = `--${toKebabCase(key)}`;
        root.style.setProperty(cssVarName, value);
      }
    });
  }, [theme]);

  const setTheme = (newTheme: AppTheme) => {
    const shouldBeDark = newTheme === 'dark';
    if (shouldBeDark === isDarkMode) return;

    // Show blur and loader immediately on click
    setIsThemeSwitching(true);
    // Use requestAnimationFrame to ensure the overlay is rendered before theme change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toggleTheme();
        // Keep loader visible during transition
        setTimeout(() => {
          setIsThemeSwitching(false);
        }, 500);
      });
    });
  };

  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const ctx: ThemeContextValue = useMemo(
    () => ({ theme, setTheme, toggle, isThemeSwitching }),
    [theme, isThemeSwitching]
  );

  return (
    <ThemeContext.Provider value={ctx}>
      <ConfigProvider theme={antTheme}>
        {children}
        {/* Theme switching overlay with blur effect */}
        {isThemeSwitching && (
          <div className='theme-switching-overlay'>
            <Spin size='large' />
          </div>
        )}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

// Main ThemeProvider that wraps with Ayphen ThemeProvider
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <AyphenThemeProvider>
      <ThemeProviderInner>{children}</ThemeProviderInner>
    </AyphenThemeProvider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Re-export Ayphen theme hook for components that need theme tokens
export { useGlobalTheme } from '@ayphen-web/theme';
