import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PageWrapper } from '../Components/layout/PageWrapper';
import { LandingPage } from '../Views/public/LandingPage';
import { LoginPage } from '../Views/auth/LoginPage';
import { SubscriptionsPage } from '../Views/subscriptions/SubscriptionsPage';
import { SubscriptionRequestsInbox } from '../Views/subscriptions/SubscriptionRequestsInbox';
import { AttendancePage } from '../Views/attendance/AttendancePage';
import { TrainersPage } from '../Views/trainers/TrainersPage';
import { MeasurementsPage } from '../Views/measurements/MeasurementsPage';
import { PaymentsPage } from '../Views/payments/PaymentsPage';
import { ProfilePage } from '../Views/profile/ProfilePage';
import { NotFoundPage } from '../Views/errors/NotFoundPage';
import { UnauthorizedPage } from '../Views/errors/UnauthorizedPage';
import { PATHS } from './routePaths';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public & Member Routes */}
      <Route path={PATHS.PUBLIC_HOME} element={<LandingPage />} />
      <Route path={PATHS.PROFILE} element={<ProfilePage />} />
      <Route path={PATHS.LOGIN} element={<LoginPage />} />
      <Route path={PATHS.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* 2. Authenticated Staff & Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<PageWrapper />}>
          <Route path={PATHS.ATTENDANCE} element={<AttendancePage />} />
          <Route path={PATHS.TRAINERS} element={<TrainersPage />} />
          <Route path={PATHS.MEASUREMENTS} element={<MeasurementsPage />} />
        </Route>
      </Route>

      {/* 3. Strict Admin-Only Routes */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<PageWrapper />}>
          <Route path={PATHS.SUBSCRIPTIONS} element={<SubscriptionsPage />} />
          <Route path={PATHS.SUBSCRIPTION_REQUESTS} element={<SubscriptionRequestsInbox />} />
          <Route path={PATHS.PAYMENTS} element={<PaymentsPage />} />
        </Route>
      </Route>

      {/* 4. Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
