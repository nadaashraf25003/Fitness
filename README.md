# 🏋️ GEM — Gym Management & Membership System

<div align="center">

![GEM Gym Management System Banner](https://img.shields.io/badge/GEM-Gym_Management_System-F0A500?style=for-the-badge&logo=dumbbell&logoColor=white)

**A modern, all-in-one web application for gym operations, member tracking, trainer scheduling, and membership storefront.**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?style=flat-square&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Zero Backend](https://img.shields.io/badge/Backend-Client--Side_LocalStorage-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](#-data-storage--persistence)

[Overview](#-about-the-app) • [Key Features](#-key-features) • [User Flow](#-application-preview--user-flow) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure)

</div>

---

## 🌟 About The App

**GEM (Gym Management System)** is a modern, responsive Single Page Application (SPA) designed to digitise and streamline everyday gym operations. It combines a **public membership storefront** where visitors can explore tiers and request subscriptions, with a powerful **administrative dashboard** for gym owners, receptionists, and fitness trainers.

The application runs **100% client-side** using browser `localStorage` as its database engine, seeded with realistic initial data — meaning zero backend setup, instant deployment, and zero server costs.

---

## 🚀 Key Features

| Category | Module & Area | Highlights & Capabilities |
| :--- | :--- | :--- |
| 🌐 **Public Storefront** | **Membership Showcase (`/#pricing`)** | • High-impact dark athletic landing page<br>• Interactive tier comparison (*Foundation, Performance, Elite*)<br>• Modal inquiry form (*"Subscribe to GEM"* questionnaire) |
| 🪪 **Membership Engine** | **Subscriptions & Requests Inbox** | • Real-time inquiry inbox with live status filtering (`Pending`, `Approved`, `Rejected`)<br>• **1-Click conversion:** converts inquiries into active member records<br>• Dynamic expiration badges (`Active`, `Expiring Soon [≤7d]`, `Expired`) |
| 📋 **Attendance Log** | **Fast Check-In & Retention Alerts** | • 1-click member check-in & check-out time logging<br>• Real-time counter of visitors currently inside the facility<br>• **Absence flag system:** warns if members are inactive for >14 days |
| 👥 **Trainer Rosters** | **Trainer Directory & Scheduling** | • Coach profiles with specialties, bios, and active client count<br>• Interactive mini-calendar weekly schedule grid<br>• **Smart conflict detection:** prevents overlapping trainer bookings |
| ⚖️ **Progress Metrics** | **Body Composition & Analytics** | • Full metric logging (Weight, Body Fat %, Chest, Waist, Arms)<br>• Multi-metric interactive trend charts over time<br>• Automated BMI classification & Before/After comparison view |
| 💳 **Billing & Invoicing** | **Payments Ledger & Receipts** | • Multi-channel payment logging (Cash, Card, Transfer)<br>• Instant revenue summary & overdue account flags<br>• Printable transaction receipts via `@media print` CSS |
| 📊 **Operations Hub** | **Executive Admin Dashboard** | • Real-time KPI stat cards (Members, Check-ins, Revenue, Requests)<br>• Live activity feed tracking recent gym check-in events<br>• Subscription status donut chart & 6-month revenue bar graph |
| 🔒 **Security Guard** | **Role-Based Protected Routing** | • Client-side authentication with session persistence<br>• Granular role guards distinguishing **Admin** and **Staff** permissions |

---

## 📸 Application Preview & User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PUBLIC STOREFRONT                             │
│       Hero Banner  ───►  Plan Comparison  ───►  Subscription Modal      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Visitor submits inquiry
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMIN DASHBOARD                               │
│  ┌──────────────────────────┬──────────────────────────┬─────────────┐  │
│  │   📬 Requests Inbox      │   🪪 Member Profiles     │  📋 CheckIn │  │
│  │   • Live Search & Filter │   • Plan Assignment      │  • Fast Log │  │
│  │   • 1-Click Approval     │   • Expiration Badges    │  • Absence! │  │
│  ├──────────────────────────┼──────────────────────────┼─────────────┤  │
│  │   👥 Trainer Rosters     │   ⚖️ Progress & BMI      │  💳 Billing │  │
│  │   • Class Schedules      │   • Multi-Line Charts    │  • Receipts │  │
│  │   • Conflict Detection   │   • Before/After View    │  • Revenue  │  │
│  └──────────────────────────┴──────────────────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Category | Technology | Usage |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** | Functional components, hooks, and context API |
| **Build Tool** | **Vite 5** | High-speed compilation and Hot Module Replacement (HMR) |
| **Styling** | **Tailwind CSS v4** | CSS-first configuration via `@theme`, dark-mode design system |
| **Routing** | **React Router v6** | Client-side routing, protected route guards, and URL parameters |
| **Charts** | **Chart.js / Recharts** | Multi-metric line graphs, revenue bars, and status donut charts |
| **Data Engine** | **LocalStorage API** | Browser-backed persistent data layer with JSON fallback seeding |
| **Icons** | **FontAwesome / Lucide** | Clean, scalable vector iconography |

---

## 💾 Data Storage & Persistence

The app features a custom `useLocalStorage` state synchronization layer:
- **Seed Initialization:** On first launch, the app populates data from mock JSON files (`members.json`, `plans.json`, `subscription_requests.json`, `trainers.json`, `payments.json`, etc.).
- **Reactive Storage:** Any addition, update, or deletion syncs instantly to browser `localStorage`.
- **Zero Refresh Loss:** Data persists across browser refreshes and tab closures.

```javascript
// Example: Storing and updating state seamlessly in LocalStorage
const [members, setMembers] = useLocalStorage("gym_members", initialSeedData);
```

---

## 📁 Project Structure

```
src/
├── assets/                  # Logos, icons, background images
├── Components/              # Modular UI components
│   ├── charts/              # Line, Bar, and Donut chart wrappers
│   ├── layout/              # Navbar, Sidebar, and PageWrapper
│   ├── public/              # Landing page sections & subscription modal
│   └── ui/                  # Buttons, Modals, Badges, Inputs, Tables, StatCards
├── context/                 # AuthContext (roles & user) & ThemeContext
├── data/                    # Initial JSON seed datasets (members, plans, payments)
├── Hooks/                   # Custom typed React hooks (useLocalStorage, useAuth, useForm, etc.)
├── Routing/                 # Route paths & protected route guards
├── services/                # Data/API Abstraction Layer (localStorage & External API ready)
├── types/                   # Global TypeScript type contracts & interfaces
├── utils/                   # Helper functions (date, currency, validation, formatting)
├── Views/                   # Page views (Dashboard, Subscriptions, Attendance, etc.)
├── App.tsx                  # Main application component
├── index.css                # Tailwind CSS v4 directives & @theme tokens
└── main.tsx                 # Application entry point
```

---

## 🏛️ Architecture: Services vs. Hooks vs. Views

To ensure clean code separation and make future migration to external REST/GraphQL APIs effortless, the codebase follows a **3-tier decoupled architecture**:

```
┌────────────────────────────────────────────────────────┐
│ 1. Views / Components (UI Layer)                      │
│    e.g. SubscriptionsPage.tsx, Table.tsx               │
│    • Responsible for rendering UI layout, buttons, forms│
└───────────────────────────┬────────────────────────────┘
                            │ uses hook or service
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. Hooks Layer (React State & Lifecycle)               │
│    e.g. useSubscriptionRequests.ts, useAuth.ts        │
│    • Manages React state: useState, useEffect          │
│    • Manages loading spinners, errors, re-renders      │
└───────────────────────────┬────────────────────────────┘
                            │ calls
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. Services Layer (Data & API Layer)                   │
│    e.g. memberService.ts, subscriptionService.ts       │
│    • Pure TypeScript (NO React code / NO hooks)        │
│    • Currently: Reads / Writes LocalStorage & JSON     │
│    • In Production: Calls External Backend / Axios     │
└────────────────────────────────────────────────────────┘
```

### 1. `services/` = **Where Data Comes From (Data/API Engine)**
- **What it is:** Pure TypeScript objects and functions handling CRUD operations (Create, Read, Update, Delete).
- **Current State:** Reads initial seed data from `src/data/*.json` and persists state to browser `localStorage`.
- **When switching to a Real Backend API:** You **only** change the internal implementation of the functions in `services/` (e.g. replacing `localStorage` calls with `await apiClient.get('/members')`).
- **Advantage:** React UI components remain 100% untouched when migrating from mock JSON to a live production database.

### 2. `Hooks/` = **React State & UI Glue**
- **What it is:** Custom React hooks using `useState`, `useEffect`, and custom state handlers.
- **Why it is needed:** Services are plain TypeScript functions with no UI reactivity. Hooks bridge the gap by holding reactive state, managing `isLoading` / `error` states, and triggering automatic re-renders when data updates.

### 3. Summary Comparison

| Layer / Folder | Architectural Role | Contains React Code? (`useState`, `useEffect`) | What to change when adding a Backend API? |
| :--- | :--- | :--- | :--- |
| **`services/`** | **Data / API Layer** (Axios, Fetch, or LocalStorage/JSON) | ❌ **No** (Pure TypeScript) | ✅ **Yes** — Change function body to `apiClient.get(...)` |
| **`Hooks/`** | **State Layer** (Loading, Caching, Filtering) | ✅ **Yes** | ❌ **No** — Stays identical |
| **`Views/`** | **Visual Pages** (Buttons, Cards, Modals) | ✅ **Yes** | ❌ **No** — Stays identical |

