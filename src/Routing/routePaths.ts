export const PATHS = {
  PUBLIC_HOME: '/',
  PUBLIC_PRICING: '/#pricing',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTION_REQUESTS: '/admin/subscription-requests',
  ATTENDANCE: '/attendance',
  TRAINERS: '/trainers',
  MEASUREMENTS: '/measurements',
  PAYMENTS: '/payments',
  UNAUTHORIZED: '/unauthorized',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];
