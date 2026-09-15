import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../Components/ui/Button';
import { HelpCircle } from 'lucide-react';
import { PATHS } from '../../Routing/routePaths';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-surface-elevated text-brand-primary flex items-center justify-center mx-auto border border-border-subtle">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold font-heading text-text-main">404 — Page Not Found</h2>
        <p className="text-sm text-text-muted">
          The requested operational screen or page does not exist or has been moved.
        </p>
        <div className="pt-4">
          <Link to={PATHS.DASHBOARD}>
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
