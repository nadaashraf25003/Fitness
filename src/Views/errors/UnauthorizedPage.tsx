import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../Components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { PATHS } from '../../Routing/routePaths';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md bg-surface p-8 rounded-2xl border border-border-subtle shadow-xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-text-main">Access Restricted</h2>
        <p className="text-xs text-text-muted">
          Your current account role does not have administrative permissions to view this module.
        </p>
        <div className="pt-4">
          <Link to={PATHS.DASHBOARD}>
            <Button variant="primary">Back to Staff Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
