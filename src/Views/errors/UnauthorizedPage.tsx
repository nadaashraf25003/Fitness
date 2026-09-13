import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../Routing/routePaths';
export const UnauthorizedPage: React.FC = () => <main className="min-h-screen bg-bg flex items-center justify-center p-4 text-center"><div><h1 className="text-3xl font-extrabold text-text-main">Access denied</h1><p className="mt-3 text-text-muted">You do not have permission to open this page.</p><Link className="mt-5 inline-block text-brand-primary" to={PATHS.PUBLIC_HOME}>Go home</Link></div></main>;
