import {
  Plan,
  SubscriptionRequest,
  RequestStatus,
} from "../types/subscription.types";
import { apiClient } from "./apiClient";

export const subscriptionService = {
  // ==========================================
  // PLANS API (DIRECT BACKEND)
  // ==========================================

  /**
   * Synchronous helper for initial render
   */
  getPlans(): Plan[] {
    return [];
  },

  /**
   * Async fetch plans directly from backend API
   */
  async fetchPlans(): Promise<Plan[]> {
    try {
      const response = await apiClient.get<Plan[]>("/fitness/plans");
      if (Array.isArray(response.data)) {
        return response.data;
      }
    } catch (error: any) {
      console.error("Backend API /fitness/plans error:", error);
      throw error;
    }
    return [];
  },

  /**
   * Get single plan by ID directly from backend API
   */
  async getPlanById(planId: string): Promise<Plan | null> {
    try {
      const response = await apiClient.get<Plan>(`/fitness/plans/${planId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Backend API /fitness/plans/${planId} error:`, error);
      return null;
    }
  },

  /**
   * Create new membership plan directly in backend API
   */
  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    try {
      const response = await apiClient.post<Plan>("/fitness/plans", plan);
      return response.data;
    } catch (error: any) {
      console.error("Backend API POST /fitness/plans failed:", error);
      throw error;
    }
  },

  /**
   * Update existing plan directly in backend API
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
      return response.data;
    } catch (error: any) {
      console.error(`Backend API PUT /fitness/plans/${planId} failed:`, error);
      throw error;
    }
  },

  /**
   * Delete plan directly in backend API
   */
  async deletePlan(planId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/fitness/plans/${planId}`);
      return true;
    } catch (error: any) {
      console.error(`Backend API DELETE /fitness/plans/${planId} failed:`, error);
      throw error;
    }
  },

  // ==========================================
  // SUBSCRIPTION REQUESTS API (DIRECT BACKEND)
  // ==========================================

  /**
   * Synchronous get requests helper (returns empty array before fetch)
   */
  getRequests(): SubscriptionRequest[] {
    return [];
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
        const mapped: SubscriptionRequest[] = response.data.map((item: any) => {
          const planName =
            item.plan_name ||
            (item.duration === 1
              ? "Basic Monthly"
              : item.duration === 3
                ? "Pro 3-Month"
                : item.duration === 12
                  ? "VIP Annual"
                  : `${item.duration || 1}-Month Membership`);

          const planId = item.plan_id || `plan-${item.duration || 1}`;

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
                  : 0,
            paymentMethod: item.payment_method || item.paymentMethod || "Visa",
            duration: item.duration ?? 1,
            memberCode: item.member_code || item.memberCode,
            branchId: item.branch_id || branchId || 1,
          };
        });

        return mapped;
      }
    } catch (error: any) {
      console.error("Backend API /fitness/admin/requests error:", error);
      throw error;
    }
    return [];
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

      return {
        ...request,
        id: newId,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error("Backend API POST /fitness/request failed:", err);
      throw err;
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
    } catch (error: any) {
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
    } catch (error: any) {
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
   * Check if an email already exists in backend database directly
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
      console.error("Backend API /fitness/check-email error:", error);
    }

    return {
      exists: false,
      reason: "none",
      message: "Email is available for registration.",
    };
  },

  /**
   * Fetch all registered gym branches directly from backend
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
    } catch (e: any) {
      console.error("Error fetching branches from backend:", e);
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
