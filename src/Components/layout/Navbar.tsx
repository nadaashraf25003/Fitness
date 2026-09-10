import React from 'react';
import { useAuth } from '../../Hooks/useAuth';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Menu, LogOut, Bell, Search, Sparkles } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-border-subtle flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-elevated lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle Button */}
        <ThemeToggle size="sm" />

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border-subtle">
          <Avatar
            src={user?.avatarUrl}
            name={user?.name || 'Staff User'}
            size="sm"
          />
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-text-main leading-tight">
              {user?.name || 'Gym Staff'}
            </div>
            <div className="text-[11px] text-brand-primary font-medium">
              {isAdmin ? 'Admin' : 'Staff'}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 p-2"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
