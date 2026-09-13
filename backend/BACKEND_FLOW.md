# 🚀 Backend Architecture & Flow Guide (With Source File Mapping)

A deep-dive technical guide explaining the lifecycle, data flow, security model, and business logic pipelines of the **Fitness & Gym Management FastAPI Backend**, mapped directly to the exact source files.

---

## 📑 Table of Contents

1. [High-Level Architecture & Source Files Directory](#1-high-level-architecture--source-files-directory)
2. [Server Startup & Lifespan Flow](#2-server-startup--lifespan-flow)
3. [Authentication & Authorization Flow](#3-authentication--authorization-flow)
4. [Public Storefront & Member Lookup Flow](#4-public-storefront--member-lookup-flow)
5. [Reception Desk & Attendance Pipeline](#5-reception-desk--attendance-pipeline)
6. [Subscription Request & Approval Workflow](#6-subscription-request--approval-workflow)
7. [Dashboard & Analytics Aggregation Pipeline](#7-dashboard--analytics-aggregation-pipeline)
8. [Body Measurements & BMI Calculation Flow](#8-body-measurements--bmi-calculation-flow)
9. [Database Entity Relationship & Model Files](#9-database-entity-relationship--model-files)
10. [Error Handling & Response Conventions](#10-error-handling--response-conventions)

---

## 1. High-Level Architecture & Source Files Directory

The backend is built as an asynchronous REST API using **FastAPI**, **SQLAlchemy ORM**, **Pydantic v2**, and **SQLite**.

### 🗂️ Complete Source File Registry

| Layer | File Path | Primary Responsibility |
| :--- | :--- | :--- |
| **App Entrypoint** | `backend/app/main.py` | FastAPI app instance, CORS middleware, lifespan events, root `/` and `/health` routes. |
| **Config & Settings** | `backend/app/core/config.py` | Environment variables, JWT secret, token expiration (`pydantic-settings`). |
| **Database Engine** | `backend/app/core/database.py` | SQLAlchemy SQLite engine, `SessionLocal`, `Base` model declarative root, `get_db()` dependency. |
| **Security & JWT** | `backend/app/core/security.py` | Password hashing & verification (`bcrypt`), JWT token creation/decoding (`python-jose`). |
| **Data Seeder** | `backend/app/data/seed.py` | Auto-seeds default admin, staff, reception users, branches, plans, coaches, and mock logs. |
| **API Router Aggregator** | `backend/app/api/v1/router.py` | Mounts all sub-routers under canonical and versioned routes. |
| **Auth Controller** | `backend/app/api/v1/auth.py` | Login (`POST /fitness/auth/login`), profile (`GET /fitness/auth/me`), `get_current_user` dependency. |
| **Public User Module** | `backend/app/api/v1/user_module.py` | Public branch lookup (`GET /fitness/user/branch/<id>`) and member search (`POST /fitness/user/search`). |
| **Reception Module** | `backend/app/api/v1/reception.py` | Reception login (`/fitness/reception/login`), protected search, check-in scanner, and `POST /fitness/request`. |
| **Admin Module** | `backend/app/api/v1/admin_module.py` | Pending requests list (`GET /fitness/admin/requests/<id>`), details, approval, and rejection. |
| **Dashboard Module** | `backend/app/api/v1/dashboard.py` | Real-time branch statistics & KPI calculations (`GET /fitness/admin/dashboard/<id>`). |
| **Reports Module** | `backend/app/api/v1/reports.py` | Subscriptions, income, top 10 members, and expired accounts analytical reports. |
| **Members CRUD** | `backend/app/api/v1/members.py` | Full CRUD operations, filtering, and pagination for gym members (`/fitness/members`). |
| **Plans CRUD** | `backend/app/api/v1/plans.py` | Subscription pricing tier management (`/fitness/plans`). |
| **Attendance Tracker** | `backend/app/api/v1/attendance.py` | Today's check-ins feed, check-out timestamps, and member history (`/fitness/attendance`). |
| **Measurements Tracker** | `backend/app/api/v1/measurements.py` | Body metrics logging with automated BMI computation and category assignment (`/fitness/measurements`). |
| **Trainers CRUD** | `backend/app/api/v1/trainers.py` | Coaches and personal trainers management (`/fitness/trainers`). |

```mermaid
flowchart TD
    Client["Frontend (React / Vite)
    Files: src/Views/*, src/Services/*"]
    
    subgraph FastAPI_Backend ["FastAPI Application (backend/app/main.py)"]
        CORS["CORS Middleware
        File: backend/app/main.py"]
        Router["Router Aggregator
        File: backend/app/api/v1/router.py"]
        
        subgraph Security_Layer ["Security & Validation"]
            JWT["OAuth2 / JWT Bearer Validation
            File: backend/app/core/security.py"]
            Pydantic["Pydantic Schemas
            Files: backend/app/schemas/*"]
            RoleCheck["Role-Based Access Control
            File: backend/app/api/v1/auth.py"]
        end
        
        subgraph Business_Modules ["Controllers (backend/app/api/v1/)"]
            AuthMod["auth.py (/api/v1/auth)"]
            UserMod["user_module.py (/api/user)"]
            RecepMod["reception.py (/api/reception, /request)"]
            AdminMod["admin_module.py (/api/admin/requests)"]
            DashMod["dashboard.py (/api/admin/dashboard)"]
            ReportMod["reports.py (/api/admin/report)"]
            CrudMod["members.py, plans.py, attendance.py, measurements.py, trainers.py"]
        end
        
        subgraph Data_Layer ["Data Access Layer"]
            Session["SQLAlchemy DB Session
            File: backend/app/core/database.py"]
            Models["SQLAlchemy ORM Models
            Files: backend/app/models/*"]
        end
    end
    
    DB[("SQLite Database
    File: backend/gym.db")]
    
    Client -->|HTTP Request| CORS
    CORS --> Router
    Router --> Security_Layer
    Security_Layer --> Business_Modules
    Business_Modules --> Session
    Session --> Models
    Models -->|SQL Queries| DB
```

---

## 2. Server Startup & Lifespan Flow

When the server starts up via `uvicorn app.main:app`, the `@asynccontextmanager lifespan` executes in `backend/app/main.py`:

```mermaid
sequenceDiagram
    autonumber
    participant App as backend/app/main.py
    participant Engine as backend/app/core/database.py
    participant Models as backend/app/models/__init__.py
    participant Seeder as backend/app/data/seed.py
    participant DB as backend/gym.db

    App->>Engine: Base.metadata.create_all(bind=engine)
    Engine->>Models: Scan all model classes (User, Member, Plan, etc.)
    Engine->>DB: Execute CREATE TABLE IF NOT EXISTS
    App->>Seeder: seed_initial_data(db)
    Seeder->>DB: Check count of User records
    alt DB is Fresh / Empty
        Seeder->>DB: Insert Admin ('admin@gym.com', pass='admin123')
        Seeder->>DB: Insert Staff ('staff@gym.com', pass='staff123')
        Seeder->>DB: Insert Reception ('employee@example.com', pass='password123')
        Seeder->>DB: Insert Default Branch ('Main Branch', price=500.0)
        Seeder->>DB: Insert Plans ('Gold', 'Silver', 'Platinum')
        Seeder->>DB: Insert Coaches, Member 'Ahmed', Attendance & Payments
        Seeder->>DB: db.commit()
    end
    App-->>App: Lifespan yield -> Server running on http://localhost:8000
```

---

## 3. Authentication & Authorization Flow

Handled by `backend/app/api/v1/auth.py` and `backend/app/core/security.py`.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Admin / Receptionist
    participant UI as src/Views/auth/LoginPage.tsx
    participant Service as src/Services/authService.ts
    participant AuthAPI as backend/app/api/v1/auth.py (or reception.py)
    participant Sec as backend/app/core/security.py
    participant DB as backend/app/models/user.py

    User->>UI: Types email & password
    UI->>Service: authService.login(email, password)
    Service->>AuthAPI: POST /api/v1/auth/login { email, password }
    AuthAPI->>DB: db.query(User).filter(User.email == email).first()
    DB-->>AuthAPI: User record (with password_hash)
    AuthAPI->>Sec: verify_password(plain_password, user.password_hash)
    alt Password Mismatch
        Sec-->>AuthAPI: False
        AuthAPI-->>UI: 401 Unauthorized ("Incorrect email or password")
    else Password Match
        Sec-->>AuthAPI: True
        AuthAPI->>Sec: create_access_token(sub=user.email, role=user.role)
        Sec-->>AuthAPI: JWT Token String (HS256)
        AuthAPI-->>Service: 200 OK { accessToken, tokenType: "bearer", user: {...} }
        Service->>UI: Save token to localStorage
    end

    Note over UI,AuthAPI: Subsequent Protected Calls (e.g. GET /api/v1/members)
    UI->>AuthAPI: GET /api/v1/members (Header: Authorization: Bearer <TOKEN>)
    AuthAPI->>Sec: decode_token(token)
    Sec-->>AuthAPI: TokenPayload (email: "admin@gym.com")
    AuthAPI->>DB: Query active user
    AuthAPI-->>UI: 200 OK (Members JSON list)
```

- **Backend Route Handlers:** `backend/app/api/v1/auth.py`
- **Pydantic Validation:** `backend/app/schemas/auth.py`
- **Security Utilities:** `backend/app/core/security.py`
- **Database Model:** `backend/app/models/user.py`
- **Frontend Consumer:** `src/Views/auth/LoginPage.tsx` & `src/Services/authService.ts`

---

## 4. Public Storefront & Member Lookup Flow

Handled by `backend/app/api/v1/user_module.py` for guest visitors on the landing page.

```mermaid
flowchart TD
    Guest(["Guest / Member on Landing Page
    File: src/Views/public/LandingPage.tsx"]) --> Action{Select Action}
    
    Action -->|View Branch Info| BranchReq["GET /api/user/branch/1
    File: backend/app/api/v1/user_module.py"]
    BranchReq --> BranchCheck{Branch exists in DB?}
    BranchCheck -->|No| Err404["404 Not Found: Branch not found"]
    BranchCheck -->|Yes| BranchRes["200 OK: Branch Name, Location, Monthly Price, Offers
    Model: backend/app/models/branch.py"]
    
    Action -->|Search Subscription| SearchReq["POST /api/user/search
    Schema: backend/app/schemas/user_module.py"]
    SearchReq --> ValCheck{Provided both or neither?}
    ValCheck -->|Invalid input| Err400["400 Bad Request: Provide member_code OR phone, not both"]
    ValCheck -->|Valid input| DBFind["Query Member by code/phone & branch_id
    Model: backend/app/models/member.py"]
    DBFind --> MemCheck{Member found?}
    MemCheck -->|No| ErrMem404["404 Not Found: Member not found"]
    MemCheck -->|Yes| SubCheck["Check Member Subscription Status & Dates"]
    SubCheck --> HasSub{Has Subscription?}
    HasSub -->|No| ErrSub404["404 Not Found: No subscription found"]
    HasSub -->|Yes| CaldDays["Compute remaining_days = (end_date - today).days"]
    CaldDays --> SuccessRes["200 OK: Member Name, Branch, Plan Dates, Remaining Days, Status"]
```

- **Backend Route Handlers:** `backend/app/api/v1/user_module.py`
- **Pydantic Validation:** `backend/app/schemas/user_module.py`
- **Database Models:** `backend/app/models/branch.py`, `backend/app/models/member.py`
- **Frontend Consumer:** `src/Views/public/LandingPage.tsx`

---

## 5. Reception Desk & Attendance Pipeline

Handled by `backend/app/api/v1/reception.py` with multi-tier validation guards.

```mermaid
flowchart TD
    Scan(["Reception Scans Barcode or Member Code
    File: src/Views/attendance/AttendancePage.tsx"]) --> CheckIn["POST /api/reception/attendance
    File: backend/app/api/v1/reception.py"]
    
    CheckIn --> Auth["Verify Reception JWT Token
    File: backend/app/core/security.py"]
    Auth --> QMem["Query Member by barcode or member_code
    Model: backend/app/models/member.py"]
    
    QMem --> G1{Guard 1: Member Exists?}
    G1 -->|No| E1["404 Not Found: Member not found"]
    
    G1 -->|Yes| G2{Guard 2: Has Active Subscription?}
    G2 -->|No| E2["403 Forbidden: Member does not have an active subscription"]
    
    G2 -->|Yes| G3{Guard 3: Is Subscription Expired?}
    G3 -->|end_date < today| E3["403 Forbidden: Subscription has expired"]
    
    G3 -->|Valid Dates| G4{Guard 4: Already Checked In Today?}
    G4 -->|Yes| E4["409 Conflict: Member has already checked in today"]
    
    G4 -->|No| LogPass["Create Attendance Record (check_in = NOW)
    Model: backend/app/models/attendance.py"]
    LogPass --> Commit["db.commit()"]
    Commit --> Res["201 Created: Attendance ID, Timestamp, Member Info, Remaining Days"]
```

- **Backend Route Handlers:** `backend/app/api/v1/reception.py`
- **Pydantic Validation:** `backend/app/schemas/reception.py`
- **Database Models:** `backend/app/models/member.py`, `backend/app/models/attendance.py`
- **Frontend Consumer:** `src/Views/attendance/AttendancePage.tsx` & `src/Views/attendance/AttendanceLog.tsx`

---

## 6. Subscription Request & Approval Workflow

Handled across `backend/app/api/v1/reception.py` (Request Creation) and `backend/app/api/v1/admin_module.py` (Approval Workflow).

```mermaid
sequenceDiagram
    autonumber
    actor Rec as Reception Staff
    participant RecepUI as src/Components/public/SubscriptionRequestModal.tsx
    participant RecepAPI as backend/app/api/v1/reception.py (POST /request)
    participant ReqModel as backend/app/models/subscription_request.py
    participant DB as backend/gym.db
    actor Adm as Gym Administrator
    participant AdminUI as src/Views/subscriptions/SubscriptionRequestsInbox.tsx
    participant AdminAPI as backend/app/api/v1/admin_module.py

    Note over Rec,RecepAPI: Step 1: Reception Creates Operation Request
    Rec->>RecepUI: Fills form (type: "new" | "renew" | "extend" | "cancel")
    RecepUI->>RecepAPI: POST /request (Payload: SubscriptionCreateRequest)
    RecepAPI->>ReqModel: Instantiate SubscriptionRequest(status="pending")
    ReqModel->>DB: db.add(req) && db.commit()
    RecepAPI-->>RecepUI: 201 Created (request_id, summary)

    Note over Adm,AdminAPI: Step 2: Admin Inspects Pending Requests
    Adm->>AdminUI: Opens Requests Inbox
    AdminUI->>AdminAPI: GET /api/admin/requests/<branch_id>
    AdminAPI->>DB: Query SubscriptionRequests WHERE status = 'pending'
    DB-->>AdminAPI: List of pending request records
    AdminAPI-->>AdminUI: 200 OK JSON list

    Note over Adm,AdminAPI: Step 3: Admin Approves or Rejects Request
    alt Admin Clicks "Approve"
        Adm->>AdminUI: Clicks "Approve" button
        AdminUI->>AdminAPI: POST /api/admin/request/<id>/approve
        AdminAPI->>DB: Update SubscriptionRequest.status = 'approved'
        alt Request Type == "new"
            AdminAPI->>DB: Insert new Member (auto-generated member_code)
            AdminAPI->>DB: Set Member start_date & end_date (status='active')
            AdminAPI->>DB: Insert Payment ledger entry (cash/visa/transfer)
        else Request Type == "renew"
            AdminAPI->>DB: Set Member.status = 'active', reset subscription dates
            AdminAPI->>DB: Insert Payment ledger entry
        else Request Type == "extend"
            AdminAPI->>DB: Add duration months to Member.end_date
            AdminAPI->>DB: Insert Payment ledger entry
        else Request Type == "cancel"
            AdminAPI->>DB: Set Member.status = 'inactive'
        end
        AdminAPI->>DB: db.commit()
        AdminAPI-->>AdminUI: 200 OK ("Request approved successfully")
    else Admin Clicks "Reject"
        Adm->>AdminUI: Clicks "Reject" button
        AdminUI->>AdminAPI: POST /api/admin/request/<id>/reject
        AdminAPI->>DB: Update SubscriptionRequest.status = 'rejected'
        AdminAPI->>DB: db.commit()
        AdminAPI-->>AdminUI: 200 OK ("Request rejected successfully")
    end
```

- **Reception Request Creation:** `backend/app/api/v1/reception.py` (`POST /request`)
- **Admin Inbox & Decisions:** `backend/app/api/v1/admin_module.py` (`GET /api/admin/requests/<id>`, `POST /approve`, `POST /reject`)
- **Pydantic Validation:** `backend/app/schemas/reception.py` & `backend/app/schemas/admin_module.py`
- **Database Models:** `backend/app/models/subscription_request.py`, `backend/app/models/member.py`, `backend/app/models/payment.py`
- **Frontend Consumers:** `src/Components/public/SubscriptionRequestModal.tsx` & `src/Views/subscriptions/SubscriptionRequestsInbox.tsx`

---

## 7. Dashboard & Analytics Aggregation Pipeline

Handled by `backend/app/api/v1/dashboard.py` and `backend/app/api/v1/reports.py`.

```mermaid
flowchart LR
    Req["GET /api/admin/dashboard/<branch_id>
    File: backend/app/api/v1/dashboard.py"] --> Handler["Dashboard Controller"]
    
    subgraph Database_Aggregations ["SQLAlchemy Aggregation Queries (backend/app/models/*)"]
        T1["COUNT(members)
        Model: member.py"]
        T2["COUNT(members) WHERE status = 'active'
        Model: member.py"]
        T3["COUNT(requests) WHERE status = 'pending'
        Model: subscription_request.py"]
        T4["COUNT(attendance) WHERE DATE(check_in) = TODAY
        Model: attendance.py"]
        T5["SUM(payments) GROUP BY payment_method WHERE DATE = TODAY
        Model: payment.py"]
        T6["COUNT(requests) GROUP BY type WHERE status = 'approved' AND DATE = TODAY
        Model: subscription_request.py"]
    end
    
    Handler --> Database_Aggregations
    Database_Aggregations --> JsonBuilder["Pydantic Response Schema
    File: backend/app/schemas/dashboard.py"]
    JsonBuilder --> Ret["200 OK Dashboard JSON Output
    Frontend: src/Views/dashboard/DashboardPage.tsx"]
```

- **Dashboard Controller:** `backend/app/api/v1/dashboard.py`
- **Reports Controller:** `backend/app/api/v1/reports.py`
- **Pydantic Schemas:** `backend/app/schemas/dashboard.py` & `backend/app/schemas/reports.py`
- **Database Models:** `backend/app/models/member.py`, `backend/app/models/attendance.py`, `backend/app/models/payment.py`, `backend/app/models/subscription_request.py`
- **Frontend Consumers:** `src/Views/dashboard/DashboardPage.tsx` & `src/Views/payments/PaymentsPage.tsx`

---

## 8. Body Measurements & BMI Calculation Flow

Handled by `backend/app/api/v1/measurements.py`.

$$\text{BMI} = \frac{\text{weight (kg)}}{\left(\frac{\text{height (cm)}}{100}\right)^2}$$

```mermaid
flowchart TD
    In["POST /api/v1/measurements
    Frontend: src/Views/measurements/MeasurementsPage.tsx
    Schema: backend/app/schemas/measurement.py"] --> Calc["Compute BMI = weight / (height/100)^2
    File: backend/app/api/v1/measurements.py"]
    Calc --> CatCheck{Categorize BMI}
    CatCheck -->|< 18.5| UW["bmi_category = 'underweight'"]
    CatCheck -->|18.5 - 24.9| NW["bmi_category = 'normal'"]
    CatCheck -->|25.0 - 29.9| OW["bmi_category = 'overweight'"]
    CatCheck -->|25.0 - 29.9| OW["bmi_category = 'overweight'"]
    CatCheck -->|>= 30.0| OB["bmi_category = 'obese'"]
    
    UW & NW & OW & OB --> Save["db.add(measurement) && db.commit()
    Model: backend/app/models/measurement.py"]
    Save --> Out["201 Created: Full Measurement JSON Response"]
```

- **Backend Route Handlers:** `backend/app/api/v1/measurements.py`
- **Pydantic Validation:** `backend/app/schemas/measurement.py`
- **Database Model:** `backend/app/models/measurement.py`
- **Frontend Consumer:** `src/Views/measurements/MeasurementsPage.tsx`

---

## 9. Database Entity Relationship & Model Files

All ORM entities are defined in `backend/app/models/` and registered in `backend/app/models/__init__.py`:

```mermaid
erDiagram
    BRANCH ||--o{ USER : employs
    BRANCH ||--o{ MEMBER : registers
    BRANCH ||--o{ SUBSCRIPTION_REQUEST : receives
    BRANCH ||--o{ PAYMENT : logs
    
    MEMBER ||--o{ ATTENDANCE : logs
    MEMBER ||--o{ MEASUREMENT : records
    MEMBER ||--o{ PAYMENT : makes
    MEMBER ||--o{ SUBSCRIPTION_REQUEST : requests
    
    PLAN ||--o{ MEMBER : assigns_to

    BRANCH {
        int id PK "File: backend/app/models/branch.py"
        string name
        string location
        string phone
        float price_per_month
        string offers
    }

    USER {
        string id PK "File: backend/app/models/user.py"
        string email UK
        string password_hash
        string name
        string role "admin | staff | reception"
        int branch_id FK
    }

    MEMBER {
        int id PK "File: backend/app/models/member.py"
        string member_code UK
        string barcode
        string name
        string phone
        string status "active | inactive | expired"
        date start_date
        date end_date
        int branch_id FK
        int plan_id FK
    }

    SUBSCRIPTION_REQUEST {
        int id PK "File: backend/app/models/subscription_request.py"
        int branch_id FK
        int member_id FK
        string request_type "new | renew | extend | cancel"
        string status "pending | approved | rejected"
        int duration
        float paid_amount
        string payment_method "cash | visa | transfer"
        date start_date
    }

    ATTENDANCE {
        int id PK "File: backend/app/models/attendance.py"
        int member_id FK
        int branch_id FK
        datetime check_in
        datetime check_out
    }

    PAYMENT {
        int id PK "File: backend/app/models/payment.py"
        int member_id FK
        int branch_id FK
        float amount
        string method "cash | visa | transfer"
        string type "new | renew | extend"
        datetime created_at
    }

    MEASUREMENT {
        int id PK "File: backend/app/models/measurement.py"
        int member_id FK
        float weight_kg
        float height_cm
        float bmi
        string bmi_category
        float body_fat_percentage
        date date
    }
```

### 📂 Model Files Checklist

1. `backend/app/models/branch.py` ➔ Branch entity
2. `backend/app/models/user.py` ➔ System users & staff logins
3. `backend/app/models/member.py` ➔ Gym members & active subscription state
4. `backend/app/models/plan.py` ➔ Gym subscription tiers & pricing
5. `backend/app/models/subscription_request.py` ➔ Reception-submitted pending requests
6. `backend/app/models/attendance.py` ➔ Daily check-in & check-out logs
7. `backend/app/models/payment.py` ➔ Income & payment ledger transactions
8. `backend/app/models/measurement.py` ➔ Body metrics & BMI records
9. `backend/app/models/trainer.py` ➔ Fitness coaches & trainers directory

---

## 10. Error Handling & Response Conventions

All API controllers use standard FastAPI `HTTPException` triggers:

| Status Code | Meaning | Code Trigger File | Scenario |
| :--- | :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | `backend/app/api/v1/*.py` | Successful data fetch, search, or status update |
| **`201 Created`** | Resource created | `reception.py`, `measurements.py` | Successful check-in, request creation, measurement log |
| **`400 Bad Request`** | Validation error | `user_module.py`, `reception.py` | Conflicting search parameters (providing both code and phone) |
| **`401 Unauthorized`** | Authentication failed | `auth.py`, `security.py` | Invalid password or malformed/expired JWT token |
| **`403 Forbidden`** | Guard permission denied | `reception.py` | Member checking in with expired or inactive subscription |
| **`404 Not Found`** | Record missing | `members.py`, `plans.py`, `branch.py` | Target ID does not exist in SQLite database |
| **`409 Conflict`** | Duplicate operation | `reception.py` | Member attempting to check in twice on the same day |
| **`500 Internal Error`** | Uncaught server error | `backend/app/main.py` | Unexpected database or internal system exception |
