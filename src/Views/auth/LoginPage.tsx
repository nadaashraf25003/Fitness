import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import { FormInput } from '../../Components/ui/FormInput';
import { Button } from '../../Components/ui/Button';
import { Logo } from '../../Components/ui/Logo';
import { ThemeToggle } from '../../Components/ui/ThemeToggle';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { PATHS } from '../../Routing/routePaths';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('admin@gym.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || PATHS.DASHBOARD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await login({ email, pass: password });
    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid login credentials. Please try again.');
    }
  };

  const handleQuickRoleSelect = (role: 'admin' | 'staff' | 'reception') => {
    if (role === 'admin') {
      setEmail('admin@gym.com');
      setPassword('admin123');
    } else if (role === 'staff') {
      setEmail('staff@gym.com');
      setPassword('staff123');
    } else {
      setEmail('employee@example.com');
      setPassword('password123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow aura background */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-brand-secondary/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Top right theme toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle size="sm" />
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" className="mb-3" />
          <h2 className="text-xl font-bold font-heading text-text-main mt-1">
            Portal Access & Login
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Access staff operations & administrative controls
          </p>
        </div>

        {/* Quick Demo Role Selector */}
        <div className="mb-6 p-3 rounded-xl bg-surface-card border border-border-subtle">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-2 text-center">
            Demo 1-Click Role Switcher:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('admin')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                email.includes('admin')
                  ? 'bg-brand-primary/15 text-brand-primary border-brand-primary/40'
                  : 'bg-surface-elevated text-text-muted border-border-subtle hover:text-text-main'
              }`}
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickRoleSelect('staff')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                email.includes('staff')
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/40'
                  : 'bg-surface-elevated text-text-muted border-border-subtle hover:text-text-main'
              }`}
            >
              ⚡ Staff
            </button>
            {/* <button
              type="button"
              onClick={() => handleQuickRoleSelect('reception')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                email.includes('employee')
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                  : 'bg-surface-elevated text-text-muted border-border-subtle hover:text-text-main'
              }`}
            >
              🏢 Reception
            </button> */}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gym.com"
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-subtle text-center text-xs text-text-muted">
          <Link to="/" className="text-brand-primary hover:underline">
            ← Back to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

