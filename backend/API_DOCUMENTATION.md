# 📖 Gym & Fitness Management System — Complete API Reference Manual

> **Base URL:** `http://localhost:8000` (or `http://127.0.0.1:8000`)  
> **Interactive Swagger UI:** [`http://localhost:8000/docs`](http://localhost:8000/docs)  
> **Interactive ReDoc:** [`http://localhost:8000/redoc`](http://localhost:8000/redoc)  
> **Architecture & Lifecycle Guide:** [`./BACKEND_FLOW.md`](./BACKEND_FLOW.md)

---

## 📑 Table of Contents

1. [Authentication & Security](#1-authentication--security)
2. [Public User Module (Client-Facing)](#2-public-user-module-no-auth)
3. [Reception Staff Module](#3-reception-staff-module)
4. [Admin Requests & Approvals Module](#4-admin-requests--approvals-module)
5. [Executive Dashboard Module](#5-executive-dashboard-module)
6. [Analytics & Financial Reports Module](#6-analytics--financial-reports-module)
7. [Members Management Module](#7-members-management-module)
8. [Subscription Plans Module](#8-subscription-plans-module)
9. [Attendance Tracking Module](#9-attendance-tracking-module)
10. [Body Measurements & BMI Module](#10-body-measurements--bmi-module)
11. [Fitness Coaches & Trainers Module](#11-fitness-coaches--trainers-module)
12. [Frontend View Mapping Matrix](#12-frontend-view-mapping-matrix)

---

## 1. Authentication & Security

All protected endpoints require a JWT token passed in the `Authorization` HTTP header:

```http
Authorization: Bearer <TOKEN>
```

### 1.1 Universal Staff / Admin Login

- **Endpoint:** `POST /fitness/auth/login`
- **Auth Required:** No
- **Used by Frontend:** `src/Views/auth/LoginPage.tsx` via `authService.login()`
- **Request Body:**
  ```json
  {
    "email": "admin@gym.com",
    "password": "admin123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "bearer",
    "user": {
      "id": "u-admin-1",
      "name": "Gym Admin",
      "email": "admin@gym.com",
      "role": "admin",
      "avatarUrl": null
    }
  }
  ```
- **Errors:**
  - `401 Unauthorized`: `{ "detail": "Incorrect email or password" }`
  - `400 Bad Request`: `{ "detail": "Account is disabled" }`

### 1.2 Get Authenticated Profile (`/me`)

- **Endpoint:** `GET /fitness/auth/me`
- **Auth Required:** Yes (`Bearer <TOKEN>`)
- **Used by Frontend:** App initialization & route permission checks
- **Success Response (200 OK):**
  ```json
  {
    "id": "u-admin-1",
    "name": "Gym Admin",
    "email": "admin@gym.com",
    "role": "admin",
    "avatarUrl": null
  }
  ```

---

## 2. Public User Module (No Auth)

Public-facing APIs for guests and members on the storefront landing page.

### 2.1 Get Branch Information

- **Endpoint:** `GET /fitness/user/branch/<branch_id>`
- **Auth Required:** No
- **Used by Frontend:** `src/Views/public/LandingPage.tsx` Branch Selector
- **Path Parameter:** `branch_id` _(Integer, e.g. 1)_
- **Success Response (200 OK):**
  ```json
  {
    "message": "Branch found successfully",
    "branch": {
      "id": 1,
      "name": "Main Branch",
      "location": "Khanqah",
      "phone": "01000000000",
      "price_per_month": 500.0,
      "offers": "Summer Special 20% Off for annual memberships"
    }
  }
  ```
- **Errors:**
  - `404 Not Found`: `{ "error": "Branch not found" }`

### 2.2 Public Member & Subscription Lookup

- **Endpoint:** `POST /fitness/user/search`
- **Auth Required:** No
- **Used by Frontend:** Landing Page Membership Search Bar
- **Rules:** Send `branch_id` + **either** `member_code` **OR** `phone` (never both).
- **Request Body (By Member Code):**
  ```json
  {
    "branch_id": 1,
    "member_code": "15"
  }
  ```
- **Request Body (By Phone):**
  ```json
  {
    "branch_id": 1,
    "phone": "01012345678"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Member found successfully",
    "member": {
      "id": 15,
      "member_code": "15",
      "name": "Ahmed",
      "branch_id": 1
    },
    "subscription": {
      "id": 32,
      "start_date": "2026-09-08",
      "end_date": "2026-10-08",
      "duration": 1,
      "status": "active",
      "remaining_days": 30
    }
  }
  ```
- **Errors:**
  - `400 Bad Request`: `{ "error": "You must provide either member_code or phone, but not both" }`
  - `404 Not Found`: `{ "error": "Member not found" }`
  - `404 Not Found`: `{ "error": "No subscription found for this member" }`

---

## 3. Reception Staff Module

### 3.1 Reception Login

- **Endpoint:** `POST /fitness/reception/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "employee@example.com",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "employee": {
      "id": 2,
      "name": "Front Desk Reception",
      "email": "employee@example.com",
      "role": "reception"
    }
  }
  ```

### 3.2 Reception Member Search (Full Protected View)

- **Endpoint:** `POST /fitness/reception/member/search`
- **Auth Required:** Yes
- **Used by Frontend:** `src/Views/attendance/AttendancePage.tsx`
- **Request Body:**
  ```json
  {
    "branch_id": 1,
    "member_code": "15"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Member found successfully",
    "member": {
      "id": 15,
      "member_code": "15",
      "name": "Ahmed",
      "phone": "01012345678",
      "photo": "https://images.unsplash.com/photo-...",
      "note": "VIP member, prefers morning workouts",
      "branch_id": 1
    },
    "subscription": {
      "id": 32,
      "start_date": "2026-09-08",
      "end_date": "2026-10-08",
      "duration": 1,
      "status": "active",
      "remaining_days": 30
    }
  }
  ```

### 3.3 Reception Check-In (Member Code or Barcode)

- **Endpoint:** `POST /fitness/reception/attendance`
- **Auth Required:** Yes
- **Used by Frontend:** Front-desk Attendance Scanner Modal
- **Request Body (Code or Barcode):**
  ```json
  {
    "branch_id": 1,
    "barcode": "123456789"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Attendance recorded successfully",
    "attendance": {
      "id": 100,
      "check_in": "2026-09-08T10:30:00"
    },
    "member": {
      "id": 15,
      "member_code": "15",
      "name": "Ahmed",
      "phone": "01012345678",
      "photo": "https://...",
      "note": "..."
    },
    "subscription": {
      "id": 32,
      "start_date": "2026-09-08",
      "end_date": "2026-10-08",
      "duration": 1,
      "status": "active",
      "remaining_days": 30
    }
  }
  ```
- **Errors:**
  - `403 Forbidden` (No active subscription): `{ "message": "Member does not have an active subscription", "member": {...} }`
  - `403 Forbidden` (Expired): `{ "message": "Subscription has expired", "member": {...}, "subscription": {...} }`
  - `409 Conflict` (Already checked in today): `{ "message": "Member has already checked in today", "attendance": {...}, "member": {...} }`

### 3.4 Create Subscription Request (For Admin Approval)

- **Endpoint:** `POST /fitness/request`
- **Auth Required:** Yes
- **Used by Frontend:** `src/Components/public/SubscriptionRequestModal.tsx`
- **Request Payload Examples:**

#### 🟢 Type: `new` (New Member)

```json
{
  "request_type": "new",
  "branch_id": 1,
  "member": {
    "name": "Sara Ahmed",
    "phone": "01099999999",
    "photo": "https://..."
  },
  "subscription": {
    "start_date": "2026-09-10",
    "duration": 3,
    "price": 79.99,
    "paid_amount": 79.99,
    "payment_method": "فيزا"
  }
}
```

#### 🔄 Type: `renew` (Renew Expired Member)

```json
{
  "request_type": "renew",
  "branch_id": 1,
  "member_id": 15,
  "subscription": {
    "start_date": "2026-09-10",
    "duration": 1,
    "price": 500,
    "paid_amount": 500,
    "payment_method": "كاش"
  }
}
```

#### ⏩ Type: `extend` (Extend Active Member)

```json
{
  "request_type": "extend",
  "branch_id": 1,
  "member_id": 15,
  "subscription": {
    "duration": 1,
    "price": 500,
    "paid_amount": 500,
    "payment_method": "كاش"
  }
}
```

#### ❌ Type: `cancel` (Cancel Active Subscription)

```json
{
  "request_type": "cancel",
  "branch_id": 1,
  "member_id": 15
}
```

- **Success Response (201 Created):**
  ```json
  {
    "message": "Request created successfully",
    "request_id": 50,
    "request_for_admin": {
      "request_id": 50,
      "member_name": "Sara Ahmed",
      "member_code": 50,
      "request_type": "new",
      "duration": 3,
      "paid_amount": 79.99,
      "payment_method": "فيزا"
    },
    "request_for_subscription": {
      "start_date": "2026-09-10",
      "end_date": "2026-12-08",
      "duration": 3,
      "price": 79.99,
      "paid_amount": 79.99,
      "payment_method": "فيزا"
    }
  }
  ```

---

## 4. Admin Requests & Approvals Module

### 4.1 Get Pending Requests by Branch

- **Endpoint:** `GET /fitness/admin/requests/<branch_id>`
- **Auth Required:** Yes (Admin/Staff)
- **Used by Frontend:** `src/Views/subscriptions/SubscriptionRequestsInbox.tsx`
- **Success Response (200 OK):**
  ```json
  [
    {
      "request_id": 50,
      "member_name": "Sara Ahmed",
      "member_code": 50,
      "request_type": "new",
      "duration": 3,
      "paid_amount": 79.99,
      "payment_method": "فيزا"
    }
  ]
  ```

### 4.2 Get Request Full Details

- **Endpoint:** `GET /fitness/admin/request/<request_id>`
- **Auth Required:** Yes
- **Used by Frontend:** Request Review Modal
- **Success Response (200 OK):**
  ```json
  {
    "request_id": 50,
    "branch_id": 1,
    "request_type": "new",
    "status": "pending",
    "member_data": {
      "name": "Sara Ahmed",
      "member_id": 50
    },
    "subscription_data": {
      "start_date": "2026-09-10",
      "end_date": "2026-12-08",
      "duration": 3,
      "price": 79.99,
      "paid_amount": 79.99,
      "payment_method": "فيزا"
    }
  }
  ```

### 4.3 Approve Request

- **Endpoint:** `POST /fitness/admin/request/<request_id>/approve`
- **Auth Required:** Yes
- **Used by Frontend:** "Approve" button
- **Success Response (200 OK):**
  ```json
  {
    "message": "Request approved successfully"
  }
  ```

### 4.4 Reject Request

- **Endpoint:** `POST /fitness/admin/request/<request_id>/reject`
- **Auth Required:** Yes
- **Used by Frontend:** "Reject" button
- **Success Response (200 OK):**
  ```json
  {
    "message": "Request rejected successfully"
  }
  ```

---

## 5. Executive Dashboard Module

### 5.1 Get Branch Dashboard Statistics

- **Endpoint:** `GET /fitness/admin/dashboard/<branch_id>`
- **Auth Required:** Yes
- **Used by Frontend:** `src/Views/dashboard/DashboardPage.tsx`
- **Success Response (200 OK):**
  ```json
  {
    "members": 150,
    "active_subscriptions": 87,
    "pending_requests": 4,
    "today_subscriptions": {
      "new": 3,
      "renew": 5,
      "extend": 2,
      "cancel": 1
    },
    "today_attendance": 64,
    "today_income": {
      "cash": 1200.0,
      "visa": 800.0,
      "transfer": 500.0,
      "total": 2500.0
    }
  }
  ```

---

## 6. Analytics & Financial Reports Module

Used by `src/Views/payments/PaymentsPage.tsx`.

### 6.1 Subscriptions Breakdown Report

- **Endpoint:** `GET /fitness/admin/report/subscriptions/<branch_id>`
- **Query Parameters:** `type=today|week|month|custom`, `start_date=YYYY-MM-DD`, `end_date=YYYY-MM-DD`
- **Success Response (200 OK):**
  ```json
  {
    "period": {
      "start_date": "2026-09-01",
      "end_date": "2026-09-30"
    },
    "subscriptions": {
      "new": 12,
      "renew": 18,
      "extend": 7,
      "cancel": 3
    }
  }
  ```

### 6.2 Income Breakdown Report

- **Endpoint:** `GET /fitness/admin/report/income/<branch_id>`
- **Query Parameters:** `type=today|week|month|year|custom`
- **Success Response (200 OK):**
  ```json
  {
    "period": {
      "start_date": "2026-09-01",
      "end_date": "2026-09-30"
    },
    "income": {
      "cash": 5000.0,
      "visa": 3200.0,
      "transfer": 1800.0,
      "total": 10000.0
    }
  }
  ```

### 6.3 Top 10 Active Members Leaderboard

- **Endpoint:** `GET /fitness/admin/report/top-members/<branch_id>`
- **Success Response (200 OK):**
  ```json
  [
    {
      "member_id": 15,
      "member_code": "15",
      "name": "Ahmed",
      "attendance_count": 45
    }
  ]
  ```

### 6.4 Expired Subscriptions Follow-Up List

- **Endpoint:** `GET /fitness/admin/report/expired-subscriptions/<branch_id>`
- **Success Response (200 OK):**
  ```json
  [
    {
      "member_id": "mem-103",
      "member_code": "103",
      "name": "Ahmed Ali",
      "phone": "01000000003",
      "end_date": "2026-07-15"
    }
  ]
  ```

---

## 7. Members Management Module

Used by `src/Views/subscriptions/SubscriptionsPage.tsx`.

- **List Members:** `GET /fitness/members?search=ahmed&status=active`
- **Get Member by ID:** `GET /fitness/members/{member_id}`
- **Create Member:** `POST /fitness/members`
- **Update Member:** `PUT /fitness/members/{member_id}`
- **Delete Member (Admin only):** `DELETE /fitness/members/{member_id}`

---

## 8. Subscription Plans Module

Used by Landing Page, Pricing Cards, and `src/Views/subscriptions/SubscriptionsPage.tsx`.

- **List Plans:** `GET /fitness/plans`
- **Get Plan by ID:** `GET /fitness/plans/{plan_id}`
- **Create Plan (Admin):** `POST /fitness/plans`
- **Update Plan (Admin):** `PUT /fitness/plans/{plan_id}`
- **Delete Plan (Admin):** `DELETE /fitness/plans/{plan_id}`

---

## 9. Attendance Tracking Module

Used by `src/Views/attendance/AttendancePage.tsx`.

- **Today's Attendance List:** `GET /fitness/attendance/today`
- **Attendance Stats:** `GET /fitness/attendance/stats` _(Returns checked in today, active now, monthly total)_
- **Check Out Member:** `POST /fitness/attendance/check-out` ➔ Body: `{ "attendance_id": 100 }`
- **Member History:** `GET /fitness/attendance/member/{member_id}`

---

## 10. Body Measurements & BMI Module

Used by `src/Views/measurements/MeasurementsPage.tsx`.

### 10.1 Get Historical Metrics

- **Endpoint:** `GET /fitness/measurements/member/{member_id}`
- **Returns:** List of chronological entries for BMI & weight graphs.

### 10.2 Record New Measurement

- **Endpoint:** `POST /fitness/measurements`
- **Request Body:**
  ```json
  {
    "member_id": 15,
    "date": "2026-09-08",
    "weight_kg": 78.5,
    "height_cm": 180.0,
    "body_fat_percentage": 15.2,
    "chest_cm": 102.0,
    "waist_cm": 84.0,
    "arms_cm": 38.5,
    "notes": "Good progress in muscle retention"
  }
  ```
- **Auto-Computed by Backend:** Automatically computes `bmi: 24.2` and `bmi_category: "normal"`.

---

## 11. Fitness Coaches & Trainers Module

Used by `src/Views/trainers/TrainersPage.tsx`.

- **List Trainers:** `GET /fitness/trainers`
- **Get Trainer by ID:** `GET /fitness/trainers/{trainer_id}`
- **Create Trainer:** `POST /fitness/trainers`
- **Update Trainer:** `PUT /fitness/trainers/{trainer_id}`
- **Delete Trainer:** `DELETE /fitness/trainers/{trainer_id}`

---

## 12. Frontend View Mapping Matrix

| API Endpoint & Method                                  | Frontend View File                                      | Visual Component / Hook            |
| :----------------------------------------------------- | :------------------------------------------------------ | :--------------------------------- |
| `POST /fitness/auth/login`                             | `src/Views/auth/LoginPage.tsx`                          | Auth Form & Login Button           |
| `GET /fitness/user/branch/<id>`                        | `src/Views/public/LandingPage.tsx`                      | Branch Selector & Storefront Info  |
| `POST /fitness/user/search`                            | `src/Views/public/LandingPage.tsx`                      | Public Membership Lookup Bar       |
| `POST /fitness/request`                                | `src/Components/public/SubscriptionRequestModal.tsx`    | Subscription Request Questionnaire |
| `GET /fitness/admin/dashboard/<id>`                    | `src/Views/dashboard/DashboardPage.tsx`                 | KPI Stat Cards & Overview Feed     |
| `GET /fitness/admin/requests/<id>`                     | `src/Views/subscriptions/SubscriptionRequestsInbox.tsx` | Requests Inbox Table               |
| `POST /fitness/admin/request/<id>/approve`             | `src/Views/subscriptions/SubscriptionRequestsInbox.tsx` | "Approve" Button                   |
| `POST /fitness/admin/request/<id>/reject`              | `src/Views/subscriptions/SubscriptionRequestsInbox.tsx` | "Reject" Button                    |
| `POST /fitness/reception/member/search`                | `src/Views/attendance/AttendancePage.tsx`               | Front-Desk Member Search           |
| `POST /fitness/reception/attendance`                   | `src/Views/attendance/AttendancePage.tsx`               | Barcode / Code Scanner Check-In    |
| `GET /fitness/attendance/today`                        | `src/Views/attendance/AttendanceLog.tsx`                | Live Attendance Feed Table         |
| `POST /fitness/attendance/check-out`                   | `src/Views/attendance/AttendancePage.tsx`               | "Check Out" Action                 |
| `GET /fitness/members`                                 | `src/Views/subscriptions/SubscriptionsPage.tsx`         | Members Directory Grid             |
| `GET /fitness/plans`                                   | `src/Views/subscriptions/SubscriptionsPage.tsx`         | Pricing Tiers & Plan Cards         |
| `GET /fitness/measurements/member/<id>`                | `src/Views/measurements/MeasurementsPage.tsx`           | Line Charts & Progress Trends      |
| `POST /fitness/measurements`                           | `src/Views/measurements/MeasurementsPage.tsx`           | Log Measurement Form Modal         |
| `GET /fitness/trainers`                                | `src/Views/trainers/TrainersPage.tsx`                   | Coaches Roster & Bio Cards         |
| `GET /fitness/admin/report/income/<id>`                | `src/Views/payments/PaymentsPage.tsx`                   | Income Bar Charts & Ledger         |
| `GET /fitness/admin/report/subscriptions/<id>`         | `src/Views/payments/PaymentsPage.tsx`                   | Operations Breakdown Report        |
| `GET /fitness/admin/report/top-members/<id>`           | `src/Views/payments/PaymentsPage.tsx`                   | Leaderboard Table                  |
| `GET /fitness/admin/report/expired-subscriptions/<id>` | `src/Views/payments/PaymentsPage.tsx`                   | Expired Accounts Table             |
