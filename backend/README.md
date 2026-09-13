# 🏋️ Fitness & Gym Management System — Python Backend API

A production-ready RESTful backend built with **FastAPI**, **SQLAlchemy**, and **Pydantic v2** designed specifically to integrate with the Fitness React frontend.

👉 **[View Complete Detailed API Documentation (API_DOCUMENTATION.md)](./API_DOCUMENTATION.md)**  
👉 **[View Detailed Backend Architecture & Flow Guide (BACKEND_FLOW.md)](./BACKEND_FLOW.md)**  
👉 **[View Detailed Frontend Architecture & Flow Guide (FRONTEND_FLOW.md)](../FRONTEND_FLOW.md)**  
👉 **[View Frontend Integration Plan (FRONTEND_INTEGRATION_PLAN.md)](../FRONTEND_INTEGRATION_PLAN.md)**

---

## ⚡ How to Run

### 🎯 Option 1: 1-Click Launcher (Easiest for Windows)

Double-click the **[`start_app.bat`](../start_app.bat)** file in the root project folder.  
It automatically starts both the **FastAPI Backend** and **React Frontend** in two separate windows.

---

### 💻 Option 2: Running via NPM Scripts (Two Terminals)

In the root project folder (`Fitness/`):

- **Terminal 1 (Backend API):**

  ```powershell
  npm run backend
  ```

  _(Starts FastAPI server at `http://localhost:8000`)_

- **Terminal 2 (Frontend App):**
  ```powershell
  npm run dev
  ```
  _(Starts Vite React at `http://localhost:5173`)_

---

### 🐍 Option 3: Running via Python Directly

```powershell
cd backend
.\.venv\Scripts\uvicorn.exe app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔄 One-Time Setup vs Daily Running

| Action                            | Commands                             | When to Run                     |
| :-------------------------------- | :----------------------------------- | :------------------------------ |
| **1. Create Virtual Environment** | `python -m venv .venv`               | **Only ONCE** (Already done ✅) |
| **2. Install Dependencies**       | `pip install -r requirements.txt`    | **Only ONCE** (Already done ✅) |
| **3. Daily Server Start**         | `npm run backend` or `start_app.bat` | **Every time you develop**      |

---

## 📖 Interactive API Documentation

Once the backend is running, open your browser:

- **Swagger UI (Interactive API Testing):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔑 Default Seed Credentials

The backend automatically creates an SQLite database (`gym.db`) with these test accounts:

| Role      | Email           | Password   | Access Level                                             |
| :-------- | :-------------- | :--------- | :------------------------------------------------------- |
| **Admin** | `admin@gym.com` | `admin123` | Full access (CRUD plans, members, trainers, reports)     |
| **Staff** | `staff@gym.com` | `staff123` | Front-desk operations (check-in, view members, requests) |

---

## 📦 Installed Packages & Size Breakdown

| Package                         | Purpose                                      | Approx. Wheel Size    | Approx. Installed Size |
| :------------------------------ | :------------------------------------------- | :-------------------- | :--------------------- |
| **`fastapi`**                   | Modern, high-performance async web framework | ~95 KB                | ~450 KB                |
| **`uvicorn[standard]`**         | Lightning-fast ASGI web server & event loop  | ~1.5 MB               | ~4.2 MB                |
| **`sqlalchemy`**                | SQL toolkit & Object-Relational Mapper (ORM) | ~2.9 MB               | ~11.5 MB               |
| **`pydantic[email]`**           | Fast data validation and email validation    | ~2.1 MB               | ~7.8 MB                |
| **`email-validator`**           | RFC-compliant email verification             | ~35 KB                | ~160 KB                |
| **`pydantic-settings`**         | Environment settings management              | ~25 KB                | ~120 KB                |
| **`python-jose[cryptography]`** | JWT token generation and encryption          | ~3.4 MB               | ~12.0 MB               |
| **`bcrypt`**                    | Secure password hashing algorithm            | ~650 KB               | ~2.2 MB                |
| **`python-multipart`**          | Streaming multipart/form-data parser         | ~40 KB                | ~160 KB                |
| **`python-dotenv`**             | Read key-value pairs from `.env`             | ~35 KB                | ~140 KB                |
| **Total Disk Size**             | _(Including virtual environment `.venv`)_    | **~11.5 MB download** | **~71 MB on disk**     |

---

## 🔌 API Endpoints Summary (Base Prefix: `/fitness`)

### 🔐 Authentication (`/fitness/auth`)

- `POST /fitness/auth/login` — Login with credentials, returns Bearer JWT token
- `GET /fitness/auth/me` — Returns profile & role for the authenticated user

### 👥 Members (`/fitness/members`)

- `GET /fitness/members` — List members (search query `?search=john` & status filter `?status=active`)
- `GET /fitness/members/{id}` — Get member profile by ID
- `POST /fitness/members` — Create member record
- `PUT /fitness/members/{id}` — Update member record
- `DELETE /fitness/members/{id}` — Delete member record (Admin only)

### 📋 Plans (`/fitness/plans`)

- `GET /fitness/plans` — List active gym packages
- `GET /fitness/plans/{id}` — Get single plan details
- `POST /fitness/plans` — Add new plan (Admin)
- `PUT /fitness/plans/{id}` — Update plan (Admin)
- `DELETE /fitness/plans/{id}` — Delete plan (Admin)

### ⏱️ Attendance (`/fitness/attendance`)

- `GET /fitness/attendance/today` — List check-ins for current day
- `GET /fitness/attendance/stats` — Metrics (checked in today, active now, monthly count)
- `POST /fitness/attendance/check-out` — Record check-out timestamp
- `GET /fitness/attendance/member/{member_id}` — Member attendance history

### 📊 Measurements & Progress (`/fitness/measurements`)

- `GET /fitness/measurements/member/{member_id}` — Historical measurements for charts
- `POST /fitness/measurements` — Record metrics _(Auto-computes BMI & BMI Category)_
- `DELETE /fitness/measurements/{id}` — Delete measurement entry

### 🏃 Trainers (`/fitness/trainers`)

- `GET /fitness/trainers` — List fitness coaches
- `GET /fitness/trainers/{id}` — Get trainer profile
- `POST /fitness/trainers` — Add trainer (Admin)
- `PUT /fitness/trainers/{id}` — Update trainer (Admin)
- `DELETE /fitness/trainers/{id}` — Delete trainer (Admin)

### 📊 Reports Module (`/fitness/admin/report`) _(Auth Required)_

- `GET /fitness/admin/report/subscriptions/<branch_id>?type=today|week|month|custom` — Approved operations breakdown (`new`, `renew`, `extend`, `cancel`)
- `GET /fitness/admin/report/income/<branch_id>?type=today|week|month|year|custom` — Total income breakdown (`cash`, `visa`, `transfer`, `total`)
- `GET /fitness/admin/report/top-members/<branch_id>` — Top 10 members with highest attendance records
- `GET /fitness/admin/report/expired-subscriptions/<branch_id>` — Members with expired subscriptions requiring follow-up

### 👤 Public User Module (`/fitness/user`) _(No Auth Required)_

- `GET /fitness/user/branch/<branch_id>` — Get branch information, price per month, and current offers
- `POST /fitness/user/search` — Search member subscription using `branch_id` + `member_code` OR `phone` (returns remaining days and active subscription status)

### 🛎️ Reception Module (`/fitness/reception` & `/fitness/request`)

- `POST /fitness/reception/login` — Reception staff authentication (`employee@example.com` / `password123`) _(No Auth)_
- `POST /fitness/reception/member/search` — Search member with full private fields (`photo`, `note`, `phone`) using `branch_id` + `member_code` OR `phone` _(Auth Required)_
- `POST /fitness/reception/attendance` — Check-in member using `branch_id` + `member_code` OR `barcode` (validates active subscription, expiration, and duplicate check-in) _(Auth Required)_
- `POST /fitness/request` — Create pending subscription operations for Admin approval (`new`, `renew`, `extend`, `cancel`) _(Auth Required)_

### 📈 Dashboard Module (`/fitness/admin/dashboard`) _(Auth Required)_

- `GET /fitness/admin/dashboard/<branch_id>` — Main branch dashboard metrics (total members, active subscriptions, pending requests, today's subscriptions, today's attendance, and today's income breakdown)

### 🛡️ Admin Requests Module (`/fitness/admin/requests`) _(Auth Required)_

- `GET /fitness/admin/requests/<branch_id>` — List pending subscription requests waiting for Admin approval
- `GET /fitness/admin/request/<request_id>` — Get full details of a specific pending request
- `POST /fitness/admin/request/<request_id>/approve` — Approve request (automatically creates/renews member & subscription, updates payment records)
- `POST /fitness/admin/request/<request_id>/reject` — Reject request
