import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded transition-all ${
          theme === 'light'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modo claro"
        aria-label="Modo claro"
      >
        <Sun size={18} />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded transition-all ${
          theme === 'dark'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Modo oscuro"
        aria-label="Modo oscuro"
      >
        <Moon size={18} />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded transition-all ${
          theme === 'system'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        title="Tema del sistema"
        aria-label="Tema del sistema"
      >
        <Monitor size={18} />
      </button>
    </div>
  );
}
