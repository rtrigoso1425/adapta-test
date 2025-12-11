import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'app_theme_preference'; // 'light' | 'dark' | 'system'

/**
 * Hook para manejar el tema de la aplicación de forma centralizada
 * Sincroniza cambios entre todos los componentes que lo usan
 * @returns {Object} { theme, setTheme }
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'system';
    return localStorage.getItem(THEME_KEY) || 'system';
  });

  const applyTheme = useCallback((pref) => {
    if (typeof window === 'undefined') return;

    if (pref === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (pref === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // system
      document.documentElement.classList.remove('dark');
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.classList.add('dark');
    }
  }, []);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
    
    // Disparar evento personalizado para sincronizar otras pestañas
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: newTheme } }));
  }, [applyTheme]);

  // Aplicar tema inicial
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Escuchar cambios de tema desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === THEME_KEY && e.newValue) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };

    // Escuchar evento personalizado (mismo componente/ventana)
    const handleThemeChange = (e) => {
      setThemeState(e.detail.theme);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, [applyTheme]);

  return { theme, setTheme };
};
