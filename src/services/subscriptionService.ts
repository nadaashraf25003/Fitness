import {
  Plan,
  SubscriptionRequest,
  RequestStatus,
} from "../types/subscription.types";
import { apiClient } from "./apiClient";
import { getStoredItem, setStoredItem } from "../utils/storageUtils";
import { memberService } from "./memberService";

const PLANS_KEY = "gym_plans";
const REQUESTS_KEY = "gym_subscription_requests";

const initialPlans: Plan[] = [
  {
    id: "plan-basic",
    name: "Basic Monthly",
    price: 29.99,
    durationMonths: 1,
    features: ["Access to Gym Floor", "Locker Room Access", "Free WiFi"],
    isPopular: false,
    isActive: true,
  },
  {
    id: "plan-pro",
    name: "Pro 3-Month",
    price: 79.99,
    durationMonths: 3,
    features: [
      "Gym Floor & Cardio",
      "All Group Classes",
      "1 Free Trainer Session",
      "Sauna & Steam",
    ],
    isPopular: true,
    isActive: true,
  },
  {
    id: "plan-vip",
    name: "VIP Annual",
    price: 249.99,
    durationMonths: 12,
    features: [
      "24/7 Unlimited Access",
      "Unlimited Classes",
      "Dedicated Personal Trainer",
      "Nutrition Consultation",
      "Free Merchandise",
    ],
    isPopular: false,
    isActive: true,
  },
];

const initialRequests: SubscriptionRequest[] = [];

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
      const response = await apiClient.get<Plan[]>("/fitness/plans");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setStoredItem(PLANS_KEY, response.data);
        return response.data;
      }
    } catch (error) {
      console.warn(
        "Backend API /fitness/plans unavailable, using local cache:",
        error,
      );
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
  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    try {
      const response = await apiClient.post<Plan>("/fitness/plans", plan);
      if (response.data && response.data.id) {
        const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
        plans.push(response.data);
        setStoredItem(PLANS_KEY, plans);
        return response.data;
      }
    } catch (error) {
      console.warn(
        "Backend API POST /fitness/plans failed, saving locally:",
        error,
      );
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
  async updatePlan(
    planId: string,
    updates: Partial<Plan>,
  ): Promise<Plan | null> {
    try {
      const response = await apiClient.put<Plan>(
        `/fitness/plans/${planId}`,
        updates,
      );
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
      console.warn(
        `Backend API PUT /fitness/plans/${planId} failed, updating locally:`,
        error,
      );
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
      console.warn(
        `Backend API DELETE /fitness/plans/${planId} failed, removing locally:`,
        error,
      );
    }

    const plans = getStoredItem<Plan[]>(PLANS_KEY, initialPlans);
    const filtered = plans.filter((p) => p.id !== planId);
    setStoredItem(PLANS_KEY, filtered);
    return true;
  },

  // ==========================================
  // SUBSCRIPTION REQUESTS API (DIRECT BACKEND)
  // ==========================================

  /**
   * Synchronous get requests from cache
   */
  getRequests(): SubscriptionRequest[] {
    return getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, []);
  },

  /**
   * Async fetch requests from backend database directly
   */
  async fetchRequests(
    branchId: number = 1,
    status?: string,
  ): Promise<SubscriptionRequest[]> {
    try {
      const response = await apiClient.get(
        `/fitness/admin/requests/${branchId}`,
        {
          params: status && status !== "all" ? { status } : undefined,
        },
      );
      if (Array.isArray(response.data)) {
        const plans = this.getPlans();
        const mapped: SubscriptionRequest[] = response.data.map((item: any) => {
          const matchedPlan = plans.find(
            (p) =>
              (item.plan_id && p.id === item.plan_id) ||
              (item.plan_name &&
                p.name.toLowerCase() === item.plan_name.toLowerCase()) ||
              p.durationMonths === item.duration,
          );

          const planName =
            item.plan_name ||
            matchedPlan?.name ||
            (item.duration === 1
              ? "Basic Monthly"
              : item.duration === 3
                ? "Pro 3-Month"
                : item.duration === 12
                  ? "VIP Annual"
                  : `${item.duration || 1}-Month Membership`);

          const planId =
            item.plan_id || matchedPlan?.id || `plan-${item.duration || 1}`;

          const idStr = String(
            item.request_id !== undefined && item.request_id !== null
              ? String(item.request_id).startsWith("req-")
                ? item.request_id
                : `req-${item.request_id}`
              : item.requestId !== undefined && item.requestId !== null
                ? String(item.requestId).startsWith("req-")
                  ? item.requestId
                  : `req-${item.requestId}`
                : `req-${item.member_code || Date.now()}`,
          );

          return {
            id: idStr,
            fullName:
              item.member_name ||
              item.memberName ||
              item.full_name ||
              "Applicant",
            email:
              item.email ||
              (item.member_code
                ? `member${item.member_code}@example.com`
                : "applicant@example.com"),
            phone:
              item.phone ||
              (item.member_code ? `0100000${item.member_code}` : "01000000000"),
            planId,
            planName,
            requestedStartDate:
              item.requested_start_date ||
              item.requestedStartDate ||
              item.start_date ||
              new Date().toISOString().split("T")[0],
            status: (item.status || "pending") as RequestStatus,
            notes:
              item.notes !== undefined &&
              item.notes !== null &&
              item.notes !== ""
                ? item.notes
                : `Type: ${item.request_type || item.requestType || "new"} • Paid: $${item.paid_amount ?? item.paidAmount ?? 0} via ${item.payment_method || item.paymentMethod || "Visa"}`,
            createdAt:
              item.created_at || item.createdAt || new Date().toISOString(),
            requestType: item.request_type || item.requestType || "new",
            paidAmount:
              item.paid_amount !== undefined && item.paid_amount !== null
                ? item.paid_amount
                : item.paidAmount !== undefined && item.paidAmount !== null
                  ? item.paidAmount
                  : (matchedPlan?.price ?? 0),
            paymentMethod: item.payment_method || item.paymentMethod || "Visa",
            duration: item.duration ?? matchedPlan?.durationMonths ?? 1,
            memberCode: item.member_code || item.memberCode,
            branchId: item.branch_id || branchId || 1,
          };
        });

        setStoredItem(REQUESTS_KEY, mapped);
        return mapped;
      }
    } catch (error) {
      console.warn("Backend API /fitness/admin/requests error:", error);
    }
    return getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, []);
  },

  /**
   * Submit request directly to backend API
   */
  async submitRequest(
    request: Omit<SubscriptionRequest, "id" | "status" | "createdAt">,
  ): Promise<SubscriptionRequest> {
    try {
      const res = await apiClient.post("/fitness/request", {
        request_type: request.requestType || "new",
        branch_id: request.branchId || 1,
        member: {
          name: request.fullName,
          email: request.email,
          phone: request.phone,
          notes: request.notes,
        },
        subscription: {
          start_date:
            request.requestedStartDate ||
            new Date().toISOString().split("T")[0],
          duration: request.duration || 1,
          price: request.paidAmount !== undefined ? request.paidAmount : 79.99,
          paid_amount:
            request.paidAmount !== undefined ? request.paidAmount : 79.99,
          payment_method: request.paymentMethod || "Visa",
          plan_id: request.planId,
          plan_name: request.planName,
          notes: request.notes,
        },
      });

      const newId =
        res.data && res.data.request_id
          ? String(res.data.request_id).startsWith("req-")
            ? String(res.data.request_id)
            : `req-${res.data.request_id}`
          : `req-${Date.now()}`;

      const newRequest: SubscriptionRequest = {
        ...request,
        id: newId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const current = getStoredItem<SubscriptionRequest[]>(REQUESTS_KEY, []);
      current.unshift(newRequest);
      setStoredItem(REQUESTS_KEY, current);

      return newRequest;
    } catch (err) {
      console.error("Backend API POST /fitness/request failed:", err);
      const fallbackRequest: SubscriptionRequest = {
        ...request,
        id: `req-${Date.now()}`,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      return fallbackRequest;
    }
  },

  /**
   * Approve a pending subscription request directly via backend API
   */
  async approveRequest(requestId: string): Promise<boolean> {
    const cleanId = requestId.replace("req-", "");
    try {
      await apiClient
        .post(`/fitness/admin/request/${requestId}/approve`)
        .catch(() =>
          apiClient.post(`/fitness/admin/request/${cleanId}/approve`),
        );
      return true;
    } catch (error) {
      console.error(
        `Backend API approve request failed for ${requestId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Reject a pending subscription request directly via backend API
   */
  async rejectRequest(requestId: string): Promise<boolean> {
    const cleanId = requestId.replace("req-", "");
    try {
      await apiClient
        .post(`/fitness/admin/request/${requestId}/reject`)
        .catch(() =>
          apiClient.post(`/fitness/admin/request/${cleanId}/reject`),
        );
      return true;
    } catch (error) {
      console.error(
        `Backend API reject request failed for ${requestId}:`,
        error,
      );
      throw error;
    }
  },

  /**
   * Update request status helper
   */
  async updateRequestStatus(
    id: string,
    status: "approved" | "rejected",
  ): Promise<boolean> {
    if (status === "approved") {
      return this.approveRequest(id);
    } else {
      return this.rejectRequest(id);
    }
  },

  /**
   * Check if an email already exists in backend database or local storage cache
   */
  async checkEmail(email: string): Promise<{
    exists: boolean;
    reason?: "member" | "request" | "user" | "none";
    message: string;
    member?: any;
    request?: any;
  }> {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail) {
      return {
        exists: false,
        reason: "none",
        message: "Email address is required",
      };
    }

    try {
      const response = await apiClient.get("/fitness/check-email", {
        params: { email: cleanEmail },
      });
      if (response.data && typeof response.data.exists === "boolean") {
        return response.data;
      }
    } catch (error: any) {
      if (
        error?.response?.data &&
        typeof error.response.data.exists === "boolean"
      ) {
        return error.response.data;
      }
      console.warn(
        "Backend API /fitness/check-email unavailable, checking local storage cache:",
        error,
      );
    }

    // Fallback: Check local storage members
    const localMembers = getStoredItem<any[]>("gym_members", []);
    const foundMember = localMembers.find(
      (m) => m.email && m.email.trim().toLowerCase() === cleanEmail,
    );
    if (foundMember) {
      return {
        exists: true,
        reason: "member",
        message: `A registered member account with '${cleanEmail}' already exists.`,
        member: foundMember,
      };
    }

    // Fallback: Check local storage requests
    const localRequests = getStoredItem<SubscriptionRequest[]>(
      REQUESTS_KEY,
      initialRequests,
    );
    const foundReq = localRequests.find(
      (r) =>
        r.email &&
        r.email.trim().toLowerCase() === cleanEmail &&
        (r.status === "pending" || r.status === "approved"),
    );
    if (foundReq) {
      return {
        exists: true,
        reason: "request",
        message: `A subscription application for '${cleanEmail}' is currently ${foundReq.status}.`,
        request: foundReq,
      };
    }

    return {
      exists: false,
      reason: "none",
      message: "Email is available for registration.",
    };
  },

  /**
   * Fetch all registered gym branches
   */
  async fetchBranches(): Promise<
    Array<{
      id: number;
      name: string;
      location: string;
      phone: string;
      price_per_month?: number;
      offers?: string;
    }>
  > {
    try {
      const res = await apiClient.get("/fitness/branches");
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch (e) {
      console.warn("Error fetching branches, using default list:", e);
    }
    return [
      {
        id: 1,
        name: "Main Branch",
        location: "Khanqah",
        phone: "01000000000",
        price_per_month: 500.0,
        offers: "Summer Special 20% Off",
      },
      {
        id: 2,
        name: "Downtown Branch",
        location: "City Center",
        phone: "01000000005",
        price_per_month: 600.0,
        offers: "Free 1 personal training session",
      },
    ];
  },
};

export default subscriptionService;
