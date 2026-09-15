import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import { useBranch } from '../../Hooks/useBranch';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { PATHS } from '../../Routing/routePaths';
import { Menu, LogOut, Building2, MapPin } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { selectedBranch, setSelectedBranch } = useBranch();

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
        {/* Global Branch Selector */}
        <div className="relative flex items-center">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
            aria-label="Active Gym Branch"
            className="appearance-none bg-surface-card border border-border-subtle hover:border-brand-primary/60 text-text-main text-xs font-semibold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all cursor-pointer shadow-sm"
          >
            <option value={1}>Branch 1: Main (Khanqah)</option>
            <option value={2}>Branch 2: Downtown (City Center)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-primary">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle size="sm" />

        {/* User Pill Link to Profile */}
        <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border-subtle">
          {/* <Link
            to={PATHS.PROFILE}
            className="flex items-center gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-surface-elevated transition-colors cursor-pointer group"
            title="View My Profile"
          > */}
            <Avatar
              src={user?.avatarUrl}
              name={user?.name || 'Staff User'}
              size="sm"
              className="group-hover:ring-2 group-hover:ring-brand-primary transition-all"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-text-main leading-tight group-hover:text-brand-primary transition-colors">
                {user?.name || 'Gym Staff'}
              </div>
              <div className="text-[11px] text-brand-primary font-medium">
                {isAdmin ? 'Admin' : 'Staff'}
              </div>
            </div>
          {/* </Link> */}
          
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
