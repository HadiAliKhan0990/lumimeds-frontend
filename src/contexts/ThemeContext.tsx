'use client';

import { createContext, useContext, useState, PropsWithChildren, useMemo } from 'react';

type Theme = 'default' | 'light' | 'dark' | 'thanksgiving' | 'black-friday-sale' | 'christmas';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<PropsWithChildren>) {
  const [theme, setTheme] = useState<Theme>('default');

  const values = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
