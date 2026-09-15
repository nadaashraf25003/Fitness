import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../Views/public/LandingPage';
import { MeasurementsPage } from '../Views/measurements/MeasurementsPage';
import { PaymentsPage } from '../Views/payments/PaymentsPage';
import { PATHS } from './routePaths';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path={PATHS.PUBLIC_HOME} element={<LandingPage />} />
      <Route path={PATHS.MEASUREMENTS} element={<MeasurementsPage />} />
      <Route path={PATHS.PAYMENTS} element={<PaymentsPage />} />
      <Route path="*" element={<Navigate to={PATHS.PUBLIC_HOME} replace />} />
    </Routes>
  );
};
