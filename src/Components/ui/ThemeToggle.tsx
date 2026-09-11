import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-border-subtle bg-surface-card hover:bg-surface-elevated text-text-muted hover:text-brand-primary transition-all shadow-sm cursor-pointer ${className}`}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className={size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5 text-amber-300'} />
      ) : (
        <Moon className={size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5 text-indigo-500'} />
      )}
    </button>
  );
};
