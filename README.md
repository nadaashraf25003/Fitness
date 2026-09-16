# 🏋️ GEM — Gym Management & Membership System (Frontend)

<div align="center">

![GEM Gym Management System Banner](https://img.shields.io/badge/GEM-Gym_Management_System-F0A500?style=for-the-badge&logo=dumbbell&logoColor=white)

**A modern, enterprise-grade Single Page Application (SPA) for gym operations, multi-branch management, member lifecycle tracking, trainer scheduling, automated BMI analytics, financial invoicing, and public membership storefront.**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v6.28-CA4245?style=flat-square&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?style=flat-square&logo=axios&logoColor=white)](https://axios-http.com/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-0.475-F56565?style=flat-square&logo=lucide&logoColor=white)](https://lucide.dev/)

[Overview](#-about-the-app) • [Key Features](#-key-features) • [Application Flow](#-application-architecture--flow) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Architecture](#-architecture-services-vs-hooks-vs-views) • [Getting Started](#-getting-started)

</div>

---

### 📚 Complete System Documentation Guides:
- 🎨 **[Frontend Architecture & Flow Guide (FRONTEND_FLOW.md)](./FRONTEND_FLOW.md)** — Comprehensive component tree, sequence diagrams, hooks, and routing flows.
- 🚀 **[Backend Architecture & Flow Guide (backend/BACKEND_FLOW.md)](./backend/BACKEND_FLOW.md)** — FastAPI services, database models, and transaction pipelines.
- 📖 **[Backend API Reference Manual (backend/API_DOCUMENTATION.md)](./backend/API_DOCUMENTATION.md)** — Complete REST API endpoint documentation.

---

## 🌟 About The App

**GEM (Gym Management System)** is a responsive, dark/light-themed Single Page Application designed to digitize and automate every facet of gym and fitness center management. 

It provides an integrated **public membership portal** (where prospects explore plans, verify active membership, generate digital QR passes, and submit requests) and an **administrative operations suite** for gym owners, receptionists, and fitness trainers.

The frontend is built with **React 18**, **TypeScript**, **Tailwind CSS v4**, and **Vite**, fully integrated with a **FastAPI REST backend** via an interceptor-powered **Axios API client** with JWT token management and multi-branch synchronization.

---

## 🚀 Key Features

| Category | Module & Area | Highlights & Capabilities |
| :--- | :--- | :--- |
| 🌐 **Public Storefront** | **Landing Page (`/`)** | • Dark athletic hero landing page with animated gradients and call-to-actions.<br>• Interactive membership tiers & feature comparisons (*Foundation, Performance, Elite*).<br>• Modal inquiry questionnaire with real-time email duplication checking (`/fitness/check-email`). |
| 🪪 **Member ID & Pass** | **Digital Profile & Lookup (`/profile`)** | • Public membership lookup by Member Code or Phone number (`CheckStatusModal`).<br>• Dynamic QR Code generation, printable membership card, and remaining days calculator.<br>• Direct profile inspection with plan details, start date, and branch allocation. |
| 🏢 **Multi-Branch Support** | **Global Branch Switcher (`useBranch`)** | • Seamless multi-location switching (**Main Branch Khanqah** & **Downtown Branch City Center**).<br>• Synchronized across all views, hooks, stat cards, and reports via custom storage events. |
| 📋 **Reception & Check-In** | **Attendance Hub (`/attendance`)** | • 1-Click fast check-in by Member Code / ID with optional assigned trainer tagging.<br>• Real-time counter of active visitors currently inside the facility.<br>• Check-out timestamp logging, search filters, and status tabs (*All, Inside Now, Checked Out*). |
| 📬 **Requests Inbox** | **Admin Inbox (`/admin/subscription-requests`)** | • Real-time inquiry inbox with live status filtering (*Pending, Approved, Rejected*).<br>• **1-Click Approval:** converts online applicants into active member database records.<br>• Full applicant inspection modal showing payment method, fees paid, and notes. |
| 👥 **Members & Plans** | **Directory & Tiers (`/subscriptions`)** | • Searchable members directory with dynamic status badges (*Active, Expiring Soon ≤7d, Expired*).<br>• Member detail modal, manual member registration form, and deletion confirmation dialog.<br>• Custom plan creation engine with dynamic monthly pricing and feature bullet lists. |
| ⚖️ **Body Composition** | **BMI & Progress Tracker (`/measurements`)** | • Member-specific biometric logs (Weight, Height, Body Fat %, Chest, Waist, Hips, Arms, Thighs).<br>• Automated BMI calculation and color-coded status badges (*Underweight, Normal, Overweight, Obese*).<br>• Responsive custom SVG line chart displaying historical weight progression over time. |
| 🏋️ **Trainer Rosters** | **Coaches & Schedules (`/trainers`)** | • Trainer cards with photos, bios, specialties, hourly rates, and client counts.<br>• Add/Edit trainer modals and real-time availability status toggles.<br>• Weekly class timetable grid with trainer schedule management. |
| 💳 **Billing & Invoices** | **Financial Ledger (`/payments`)** | • Multi-channel payment logging (Cash, Card, Transfer) with payment status flags.<br>• Record payment modal and revenue totals calculation.<br>• **Printable receipts** with print-optimized CSS layout (`@media print`). |
| 📊 **Executive Hub** | **Admin Dashboard (`/dashboard`)** | • High-level KPI stat cards (Total Members, Active Subscriptions, Pending Requests, Today Check-ins, Today Income).<br>• 6-Month monthly revenue trend bar chart.<br>• Membership breakdown donut chart (Active, Pending, Expired).<br>• Top 5 members attendance leaderboard and live check-ins feed. |
| 🔒 **Security & Roles** | **Protected Routing (`ProtectedRoute`)** | • JWT authentication with persistent session state and automatic 401 redirect.<br>• Role-based access control distinguishing **Admin** (all routes) and **Staff** (restricted routes). |
| 🌓 **Adaptive Theme** | **Theme Switcher (`ThemeContext`)** | • High-contrast dark and light themes powered by Tailwind CSS v4 variables.<br>• Persisted in `localStorage` with smooth transitions. |

---

## 📸 Application Architecture & Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PUBLIC STOREFRONT                                  │
│   Landing Page (/) ──► Pricing Cards ──► Subscription Request Modal             │
│            │                                    │                               │
│            ▼                                    ▼                               │
│   Check Status Modal ──► Profile Page (/profile) with Digital QR Pass           │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                        Staff / Admin Authentication (/login)
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             AUTHENTICATED PORTAL                                │
│                                                                                 │
│   🏢 Global Branch Selector (Main Branch Khanqah / Downtown City Center)       │
│                                                                                 │
│   ┌──────────────────────────┬──────────────────────────┬────────────────────┐  │
│   │  📊 Executive Dashboard  │  📋 Reception Check-In   │  📬 Requests Inbox │  │
│   │  • KPI Summary StatCards │  • Fast Barcode/ID Log   │  • Online Requests │  │
│   │  • 6-Mo Revenue BarChart │  • Inside Now Counter    │  • 1-Click Approve │  │
│   │  • Status Donut Chart    │  • Check-out Logging     │  • Auto-Provision  │  │
│   ├──────────────────────────┼──────────────────────────┼────────────────────┤  │
│   │  🪪 Members Directory    │  ⚖️ Biometric Tracker    │  👥 Trainer Roster │  │
│   │  • Member Profiles & Mod │  • Automated BMI Badge   │  • Coach Profiles  │  │
│   │  • Expiration Badges     │  • SVG Weight Trend Line │  • Class Schedule  │  │
│   │  • Plan Pricing Builder  │  • Measurement History   │  • Availability    │  │
│   ├──────────────────────────┴──────────────────────────┴────────────────────┤  │
│   │  💳 Billing & Invoicing: Payments Ledger, Receipts & Print Mode          │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Category | Technology | Usage in Application |
| :--- | :--- | :--- |
| **Framework** | **React 18.3** | Component hierarchy, custom hooks, React Context API, lifecycle effects |
| **Language** | **TypeScript 5.7** | Strict type safety, shared interfaces (`types/`), DTO models |
| **Build Tool** | **Vite 5.4** | Ultra-fast HMR dev server and optimized production bundling |
| **Styling** | **Tailwind CSS v4** | Modern `@theme` CSS configuration, dark/light theme tokens, fluid animations |
| **Routing** | **React Router v6.28** | Declarative routing, protected route guards, and URL parameters |
| **HTTP Client** | **Axios 1.7** | REST communication with backend, JWT Bearer interceptor, 401 auto-handler |
| **Icons** | **Lucide React 0.475** | Modern, lightweight, accessible SVG vector icons |
| **Data Visuals** | **Custom SVG Components** | Lightweight, high-performance `LineChart`, `BarChart`, and `DonutChart` |

---

## 📁 Project Structure

```
Fitness/
├── .env.production               # Production API base URL configuration
├── FRONTEND_FLOW.md              # Deep-dive frontend architecture & sequence flows
├── README.md                     # Project overview and frontend documentation
├── index.html                    # Root HTML document with Google fonts & viewport
├── package.json                  # Dependencies, scripts, and build configuration
├── tsconfig.json                 # TypeScript compiler configuration
├── vite.config.ts                # Vite build and plugins configuration
│
└── src/
    ├── App.tsx                   # Top-level application component rendering AppRoutes
    ├── main.tsx                  # Root entrypoint with Theme, Auth, & Router providers
    ├── index.css                 # Tailwind CSS v4 design system, @theme tokens & keyframes
    │
    ├── Components/               # Modular, reusable UI components
    │   ├── charts/               # Custom chart components
    │   │   ├── BarChart.tsx      # Multi-bar revenue & metrics visualization
    │   │   ├── DonutChart.tsx    # Proportional status donut chart
    │   │   └── LineChart.tsx     # SVG line chart for metric progressions
    │   ├── layout/               # Shell layout components
    │   │   ├── Navbar.tsx        # Top navigation with user avatar, branch info, & theme toggle
    │   │   ├── PageWrapper.tsx   # Authenticated shell wrapping Sidebar, Navbar, & outlet
    │   │   └── Sidebar.tsx       # Collapsible role-aware sidebar navigation
    │   ├── public/               # Public landing page components
    │   │   ├── AboutSection.tsx  # Gym philosophy and trainer introduction
    │   │   ├── CheckStatusModal.tsx # Public member search & status inspection modal
    │   │   ├── Footer.tsx        # Public footer with hours, contact, and social links
    │   │   ├── HeroSection.tsx   # Landing hero banner with quick-action CTA buttons
    │   │   ├── MembershipPerksSection.tsx # Facility amenities and perks grid
    │   │   ├── PricingSection.tsx# Membership tier cards and join buttons
    │   │   ├── ServicesSection.tsx # Gym features and training programs
    │   │   └── SubscriptionRequestModal.tsx # Multi-step join questionnaire modal
    │   └── ui/                   # Core atomic design UI components
    │       ├── Avatar.tsx        # User avatar with fallback initials
    │       ├── Badge.tsx         # Status & category badges
    │       ├── Button.tsx        # Styled button variants with loading spinner
    │       ├── ConfirmDialog.tsx # Modal confirmation dialog for destructive actions
    │       ├── EmptyState.tsx    # Informative placeholder for empty data lists
    │       ├── FormInput.tsx     # Standardized text, number, and date input fields
    │       ├── Logo.tsx          # Brand logo component
    │       ├── Modal.tsx         # Accessible overlay modal shell
    │       ├── PricingCard.tsx   # Tier card with features and pricing
    │       ├── Select.tsx        # Custom dropdown selector
    │       ├── Spinner.tsx       # Loading indicator
    │       ├── StatCard.tsx      # Dashboard KPI card with icons and trends
    │       ├── Table.tsx         # Generic typed table component
    │       └── ThemeToggle.tsx   # Dark/light mode switcher button
    │
    ├── context/                  # React Context state providers
    │   ├── AuthContext.tsx       # User authentication, token lifecycle, and role states
    │   └── ThemeContext.tsx      # Dark/light mode state and DOM class synchronization
    │
    ├── Hooks/                    # Typed custom React hooks
    │   ├── useAttendance.ts      # Attendance records, fast check-in/out, and occupancy stats
    │   ├── useAuth.ts            # AuthContext consumer hook
    │   ├── useBranch.ts          # Multi-branch state and cross-tab/window event sync
    │   ├── useConfirm.ts         # Programmatic confirmation dialog state
    │   ├── useForm.ts            # Form state management and validation
    │   ├── useLocalStorage.ts    # Reactive localStorage synchronization hook
    │   ├── useMeasurements.ts    # Biometric measurement logs and calculation state
    │   ├── useMembers.ts         # Member directory CRUD and filtering
    │   ├── usePayments.ts        # Invoicing and payment transactions
    │   ├── usePlans.ts           # Membership packages and tier management
    │   ├── useSearch.ts          # Client-side search and filtering
    │   ├── useSubscriptionRequests.ts # Online inquiry inbox and approval workflow
    │   └── useTrainers.ts        # Trainer directory and schedule management
    │
    ├── Routing/                  # Navigation and permission guards
    │   ├── ProtectedRoute.tsx    # Role-based route guard (Admin vs Staff vs Guest)
    │   ├── routePaths.ts         # Centralized application path constants
    │   └── routes.tsx            # Route configuration map
    │
    ├── services/                 # Data & API abstraction layer (Axios REST client)
    │   ├── apiClient.ts          # Configured Axios instance with JWT & 401 interceptors
    │   ├── attendanceService.ts  # Attendance endpoints (/fitness/attendance/*)
    │   ├── authService.ts        # Authentication endpoints (/fitness/auth/*)
    │   ├── dashboardService.ts   # Executive dashboard stats (/fitness/admin/dashboard/*)
    │   ├── measurementService.ts # Biometric measurement endpoints (/fitness/measurements/*)
    │   ├── memberService.ts      # Member CRUD endpoints (/fitness/members/*)
    │   ├── paymentService.ts     # Payment and financial endpoints (/fitness/payments/*)
    │   ├── subscriptionService.ts# Plans, requests, and branch lookup endpoints
    │   └── trainerService.ts     # Trainer CRUD and schedules (/fitness/trainers/*)
    │
    ├── types/                    # Global TypeScript interfaces and type contracts
    │   ├── attendance.types.ts   # Attendance records, check-in entries, and stats
    │   ├── auth.types.ts         # User, credentials, and authentication responses
    │   ├── dashboard.types.ts    # KPI stats, top members, and branch info
    │   ├── measurement.types.ts  # Body composition, BMI, and biometric records
    │   ├── member.types.ts       # Member entities and subscription statuses
    │   ├── subscription.types.ts # Plans, requests, and payment models
    │   └── trainer.types.ts      # Trainer entities and schedule models
    │
    └── utils/                    # Utility functions and helpers
        ├── currencyUtils.ts      # Currency formatting ($ and EGP)
        ├── dateUtils.ts          # Date and timestamp formatting utilities
        ├── storageUtils.ts       # Type-safe localStorage get/set/remove wrappers
        ├── subscriptionUtils.ts  # Expiration calculation and status derivation
        └── validationUtils.ts    # Email, phone, and input validators
```

---

## 🏛️ Architecture: Services vs. Hooks vs. Views

The frontend adheres to a clean **3-tier decoupled architecture**:

```
┌────────────────────────────────────────────────────────┐
│ 1. Views & UI Components Layer                         │
│    e.g. SubscriptionsPage.tsx, AttendancePage.tsx      │
│    • Renders JSX layouts, interactive tables, modals   │
│    • Consumes custom React hooks                       │
└───────────────────────────┬────────────────────────────┘
                            │ uses hook
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Hooks Layer (React State & Lifecycle)               │
│    e.g. useAttendance.ts, useBranch.ts, useMembers.ts  │
│    • Manages React state (useState, useEffect)         │
│    • Handles loading indicators, errors, optimistic UI │
│    • Coordinates async calls to the services layer     │
└───────────────────────────┬────────────────────────────┘
                            │ calls
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Services Layer (API Client & Data Layer)            │
│    e.g. attendanceService.ts, memberService.ts         │
│    • Pure TypeScript (no React hooks or JSX)           │
│    • Makes HTTP requests via Axios apiClient           │
│    • Handles serialization, endpoints, error mapping   │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm** or **yarn** / **pnpm**
- **Python 3.10+** (if running the backend locally)

### 1. Installation
Clone the repository and install frontend dependencies:
```bash
npm install
```

### 2. Configure Environment (Optional)
By default, the Vite dev server connects to the backend at `http://localhost:8000`. You can customize this by creating a `.env.local` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Running the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Running the Full Stack App (Frontend + Backend)
Open two separate terminal windows:
```powershell
# Terminal 1: Launch FastAPI Backend (http://localhost:8000/docs)
npm run backend

# Terminal 2: Launch Vite Frontend SPA (http://localhost:5173)
npm run dev
```

### 5. Building for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory. You can preview the production build locally with:
```bash
npm run preview
```

---

## 🔐 Default Access Credentials

For testing and administrative access:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gym.com` | `admin123` | Full access to all views, requests inbox, payments, members, and settings |
| **Staff / Coach** | `staff@gym.com` | `staff123` | Access to Dashboard, Attendance Scanner, Trainers, and Measurements |

---

## 📄 License & Ownership
Developed for **GEM Gym Management & Membership Systems**. All rights reserved.
