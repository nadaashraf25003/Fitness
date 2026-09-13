import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import { PATHS } from '../../Routing/routePaths';
import { Logo } from '../ui/Logo';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  ClipboardCheck,
  UserCheck,
  Activity,
  DollarSign,
  Inbox,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: PATHS.DASHBOARD,
      icon: LayoutDashboard,
      adminOnly: false,
    },
    {
      label: 'Attendance',
      path: PATHS.ATTENDANCE,
      icon: ClipboardCheck,
      adminOnly: false,
    },
    {
      label: 'Members & Plans',
      path: PATHS.SUBSCRIPTIONS,
      icon: Users,
      adminOnly: true,
    },
    {
      label: 'Requests Inbox',
      path: PATHS.SUBSCRIPTION_REQUESTS,
      icon: Inbox,
      adminOnly: true,
    },
    {
      label: 'Trainers',
      path: PATHS.TRAINERS,
      icon: UserCheck,
      adminOnly: false,
    },
    {
      label: 'Body Metrics',
      path: PATHS.MEASUREMENTS,
      icon: Activity,
      adminOnly: false,
    },
    {
      label: 'Payments & Billing',
      path: PATHS.PAYMENTS,
      icon: DollarSign,
      adminOnly: true,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-border-subtle flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Gym Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-border-subtle">
          <Logo size="sm" />
        </div>

        {/* User Role Badge in Sidebar */}
        <div className="px-5 py-3 mx-4 my-3 rounded-xl bg-surface-card border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Shield className="w-4 h-4 text-brand-primary flex-shrink-0" />
            <div className="truncate text-xs font-semibold text-text-main">
              {isAdmin ? 'Administrator' : 'Staff Member'}
            </div>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-brand-primary/15 text-brand-primary border border-brand-primary/30">
            {user?.role || 'Staff'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/25'
                      : 'text-text-muted hover:text-text-main hover:bg-surface-elevated'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Public Storefront Link */}
        <div className="p-4 border-t border-border-subtle">
          <a
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-surface-card hover:bg-surface-elevated text-xs font-medium text-text-muted hover:text-brand-primary transition-colors border border-border-subtle"
          >
            <span>View Public Storefront</span>
            <span className="text-brand-primary">↗</span>
          </a>
        </div>
      </aside>
    </>
  );
};
