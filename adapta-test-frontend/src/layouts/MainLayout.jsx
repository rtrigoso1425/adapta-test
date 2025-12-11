import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

export function MainLayout({ children }) {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      {/* Header/Navbar */}
      <header className="border-b border-slate-200 dark:border-zinc-700 sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* ... existing header content ... */}

          {/* Theme Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (theme === 'light') setTheme('dark');
                else if (theme === 'dark') setTheme('system');
                else setTheme('light');
              }}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={`Tema actual: ${theme}`}
              aria-label="Cambiar tema"
            >
              {theme === 'light' && <Sun size={20} className="text-amber-500" />}
              {theme === 'dark' && <Moon size={20} className="text-blue-400" />}
              {theme === 'system' && <Monitor size={20} className="text-slate-600 dark:text-slate-300" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* ...existing footer... */}
    </div>
  );
}