import { Plan, SubscriptionRequest, RequestStatus } from '../types/subscription.types';
import { apiClient } from './apiClient';
import { getStoredItem, setStoredItem } from '../utils/storageUtils';
import { memberService } from './memberService';

const PLANS_KEY = 'gym_plans';
const REQUESTS_KEY = 'gym_subscription_requests';

const initialPlans: Plan[] = [
  {
    id: 'plan-basic',
    name: 'Basic Monthly',
    price: 29.99,
    durationMonths: 1,
    features: ['Access to Gym Floor', 'Locker Room Access', 'Free WiFi'],
    isPopular: false,
    isActive: true,
  },
  {
    id: 'plan-pro',
    name: 'Pro 3-Month',
    price: 79.99,
    durationMonths: 3,
    features: [
      'Gym Floor & Cardio',
      'All Group Classes',
      '1 Free Trainer Session',
      'Sauna & Steam',
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: 'plan-vip',
    name: 'VIP Annual',
    price: 249.99,
    durationMonths: 12,
    features: [
      '24/7 Unlimited Access',
      'Unlimited Classes',
      'Dedicated Personal Trainer',
      'Nutrition Consultation',
      'Free Merchandise',
    ],
    isPopular: false,
    isActive: true,
  },
];

const initialRequests: SubscriptionRequest[] = [
  {
    id: 'req-50',
    fullName: 'Sara Ahmed',
    email: 'sara.ahmed@example.com',
    phone: '01099999999',
    planId: 'plan-pro',
    planName: 'Pro 3-Month',
    requestedStartDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: 'Prefers evening group fitness sessions',
    createdAt: new Date().toISOString(),
    requestType: 'new',
    duration: 3,
    paidAmount: 79.99,
    paymentMethod: 'Credit Card',
    branchId: 1,
    memberCode: '50',
  },
  {
    id: 'req-101',
    fullName: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '01000000004',
    planId: 'plan-vip',
    planName: 'VIP Annual',
    requestedStartDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: 'Corporate executive gym perk enrollment',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    requestType: 'new',
    duration: 12,
    paidAmount: 249.99,
    paymentMethod: 'Transfer',
    branchId: 1,
    memberCode: '104',
  },
];

export const subscriptionService = {
  // ==========================================
  // PLANS API
  // ==========================================

  /**
   * Synchronous get for immediate render
   */
  getPlans(): Plan[] {
    const cached = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
    // Background fetch to keep storage fresh
    this.fetchPlans().catch(() => {});
    return cached;
  },

  /**
   * Async fetch plans directly from backend API
   */
  async fetchPlans(): Promise<Plan[]> {
    try {
      const response = await apiClient.get<Plan[]>('/fitness/plans');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setStoredItem(PLANS_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API /fitness/plans unavailable, using local cache:', error);
    }
    return getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
  },

  /**
   * Get single plan by ID
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    try {
      const response = await apiClient.get<Plan>(`/fitness/plans/${planId}`);
      return response.data;
    } catch (error) {
      const plans = this.getPlans();
      return plans.find((p) => p.id === planId) || null;
    }
  },

  /**
   * Create new membership plan
   */
  async createPlan(plan: Omit<Plan, 'id'>): Promise<Plan> {
    try {
      const response = await apiClient.post<Plan>('/fitness/plans', plan);
      if (response.data && response.data.id) {
        const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
        plans.push(response.data);
        setStoredItem(PLANS_KEY, plans);
        return response.data;
      }
    } catch (error) {
      console.warn('Backend API POST /fitness/plans failed, saving locally:', error);
    }

    const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
    const newPlan: Plan = {
      ...plan,
      id: `plan-${Date.now()}`,
    };
    plans.push(newPlan);
    setStoredItem(PLANS_KEY, plans);
    return newPlan;
  },

  /**
   * Update existing plan
   */
  async updatePlan(planId: string, updates: Partial<Plan>): Promise<Plan | null> {
    try {
      const response = await apiClient.put<Plan>(`/fitness/plans/${planId}`, updates);
      if (response.data) {
        const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
        const idx = plans.findIndex((p) => p.id === planId);
        if (idx !== -1) {
          plans[idx] = response.data;
          setStoredItem(PLANS_KEY, plans);
        }
        return response.data;
      }
    } catch (error) {
      console.warn(`Backend API PUT /fitness/plans/${planId} failed, updating locally:`, error);
    }

    const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
    const idx = plans.findIndex((p) => p.id === planId);
    if (idx === -1) return null;
    plans[idx] = { ...plans[idx], ...updates };
    setStoredItem(PLANS_KEY, plans);
    return plans[idx];
  },

  /**
   * Delete plan
   */
  async deletePlan(planId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/plans/${planId}`);
    } catch (error) {
      console.warn(`Backend API DELETE /fitness/plans/${planId} failed, removing locally:`, error);
    }

    const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
    const filtered = plans.filter((p) => p.id !== planId);
    setStoredItem(PLANS_KEY, filtered);
    return true;
  },

  // ==========================================
  // SUBSCRIPTION REQUESTS API
  // ==========================================

  /**
   * Synchronous get requests (keeps existing public modals working without any changes)
   */
  getRequests(): SubscriptionRequest[] {
    const cached = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
    this.fetchRequests().catch(() => {});
    return cached;
  },

  /**
   * Async fetch pending requests from backend
   */
  async fetchRequests(branchId: number = 1): Promise<SubscriptionRequest[]> {
    try {
      const response = await apiClient.get(`/fitness/admin/requests/${branchId}`);
      if (Array.isArray(response.data)) {
        const plans = this.getPlans();
        const mapped: SubscriptionRequest[] = response.data.map((item: any) => {
          const matchedPlan = plans.find(
            (p) =>
              (item.plan_id && p.id === item.plan_id) ||
              (item.plan_name && p.name.toLowerCase() === item.plan_name.toLowerCase()) ||
              p.durationMonths === item.duration
          );

          const planName =
            item.plan_name ||
            matchedPlan?.name ||
            (item.duration === 1
              ? 'Basic Monthly'
              : item.duration === 3
              ? 'Pro 3-Month'
              : item.duration === 12
              ? 'VIP Annual'
              : `${item.duration || 1}-Month Membership`);

          const planId = item.plan_id || matchedPlan?.id || `plan-${item.duration || 1}`;

          const idStr = String(
            item.request_id !== undefined && item.request_id !== null
              ? (String(item.request_id).startsWith('req-') ? item.request_id : `req-${item.request_id}`)
              : item.requestId !== undefined && item.requestId !== null
              ? (String(item.requestId).startsWith('req-') ? item.requestId : `req-${item.requestId}`)
              : `req-${item.member_code || Date.now()}`
          );

          return {
            id: idStr,
            fullName: item.member_name || item.memberName || item.full_name || 'Applicant',
            email: item.email || (item.member_code ? `member${item.member_code}@example.com` : 'applicant@example.com'),
            phone: item.phone || (item.member_code ? `0100000${item.member_code}` : '01000000000'),
            planId,
            planName,
            requestedStartDate:
              item.requested_start_date ||
              item.requestedStartDate ||
              item.start_date ||
              new Date().toISOString().split('T')[0],
            status: (item.status || 'pending') as RequestStatus,
            notes:
              item.notes !== undefined && item.notes !== null && item.notes !== ''
                ? item.notes
                : `Type: ${item.request_type || item.requestType || 'new'} • Paid: $${item.paid_amount ?? item.paidAmount ?? 0} via ${item.payment_method || item.paymentMethod || 'Credit Card'}`,
            createdAt: item.created_at || item.createdAt || new Date().toISOString(),
            requestType: item.request_type || item.requestType || 'new',
            paidAmount:
              item.paid_amount !== undefined && item.paid_amount !== null
                ? item.paid_amount
                : item.paidAmount !== undefined && item.paidAmount !== null
                ? item.paidAmount
                : matchedPlan?.price ?? 0,
            paymentMethod: item.payment_method || item.paymentMethod || 'Credit Card',
            duration: item.duration ?? matchedPlan?.durationMonths ?? 1,
            memberCode: item.member_code || item.memberCode,
          };
        });

        // Merge with locally stored requests (for any offline or freshly queued submissions)
        const localRequests = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
        const merged: SubscriptionRequest[] = [...mapped];

        for (const localReq of localRequests) {
          const cleanLocalId = localReq.id.replace('req-', '');
          const exists = merged.some(
            (m) =>
              m.id === localReq.id ||
              m.id.replace('req-', '') === cleanLocalId ||
              (m.phone === localReq.phone && m.planName === localReq.planName && m.status === localReq.status)
          );
          if (!exists) {
            merged.push(localReq);
          }
        }

        setStoredItem(REQUESTS_KEY, merged);
        return merged;
      }
    } catch (error) {
      console.warn('Backend API /fitness/admin/requests unavailable, using local cache:', error);
    }
    return getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
  },

  /**
   * Submit request (returns synchronously for public modal compatibility, calls backend async)
   */
  submitRequest(
    request: Omit<SubscriptionRequest, 'id' | 'status' | 'createdAt'>
  ): SubscriptionRequest {
    const requests = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
    const newRequest: SubscriptionRequest = {
      ...request,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.unshift(newRequest);
    setStoredItem(REQUESTS_KEY, requests);

    // Forward to backend API asynchronously with complete payload
    apiClient
      .post('/fitness/request', {
        request_type: request.requestType || 'new',
        branch_id: request.branchId || 1,
        member: {
          name: request.fullName,
          email: request.email,
          phone: request.phone,
          notes: request.notes,
        },
        subscription: {
          start_date: request.requestedStartDate || new Date().toISOString().split('T')[0],
          duration: request.duration || 1,
          price: request.paidAmount !== undefined ? request.paidAmount : 79.99,
          paid_amount: request.paidAmount !== undefined ? request.paidAmount : 79.99,
          payment_method: request.paymentMethod || 'Credit Card',
          plan_id: request.planId,
          plan_name: request.planName,
          notes: request.notes,
        },
      })
      .then((res) => {
        if (res.data && res.data.request_id) {
          const current = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
          const idx = current.findIndex((r) => r.id === newRequest.id);
          if (idx !== -1) {
            current[idx].id = `req-${res.data.request_id}`;
            setStoredItem(REQUESTS_KEY, current);
          }
        }
      })
      .catch((err) => {
        console.warn('Backend API POST /fitness/request background sync error:', err);
      });

    return newRequest;
  },

  /**
   * Approve a pending subscription request
   */
  async approveRequest(requestId: string): Promise<boolean> {
    const cleanId = requestId.replace('req-', '');
    try {
      await apiClient
        .post(`/fitness/admin/request/${requestId}/approve`)
        .catch(() => apiClient.post(`/fitness/admin/request/${cleanId}/approve`));
    } catch (error) {
      console.warn(`Backend API approve request failed for ${requestId}, executing local provision:`, error);
    }

    const requests = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
    const index = requests.findIndex(
      (r) => r.id === requestId || r.id === `req-${cleanId}` || r.id === cleanId
    );
    if (index !== -1) {
      requests[index].status = 'approved';
      setStoredItem(REQUESTS_KEY, requests);

      const req = requests[index];
      await memberService.create({
        fullName: req.fullName,
        email: req.email,
        phone: req.phone,
        gender: 'other',
        dateOfBirth: '1995-01-01',
        joinDate: req.requestedStartDate || new Date().toISOString().split('T')[0],
        subscriptionId: `sub-${req.planId || 'pro'}`,
        planName: req.planName || 'Pro 3-Month',
        status: 'active',
        note: req.notes,
      });
      return true;
    }
    return false;
  },

  /**
   * Reject a pending subscription request
   */
  async rejectRequest(requestId: string): Promise<boolean> {
    const cleanId = requestId.replace('req-', '');
    try {
      await apiClient
        .post(`/fitness/admin/request/${requestId}/reject`)
        .catch(() => apiClient.post(`/fitness/admin/request/${cleanId}/reject`));
    } catch (error) {
      console.warn(`Backend API reject request failed for ${requestId}, updating locally:`, error);
    }

    const requests = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
    const index = requests.findIndex(
      (r) => r.id === requestId || r.id === `req-${cleanId}` || r.id === cleanId
    );
    if (index !== -1) {
      requests[index].status = 'rejected';
      setStoredItem(REQUESTS_KEY, requests);
      return true;
    }
    return false;
  },

  /**
   * Update request status helper
   */
  updateRequestStatus(id: string, status: 'approved' | 'rejected'): SubscriptionRequest | null {
    const requests = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, initialRequests);
    const index = requests.findIndex((r) => r.id === id);
    if (index === -1) return null;

    requests[index].status = status;
    setStoredItem(REQUESTS_KEY, requests);

    if (status === 'approved') {
      this.approveRequest(id).catch(() => {});
    } else {
      this.rejectRequest(id).catch(() => {});
    }

    return requests[index];
  },
};

export default subscriptionService;
