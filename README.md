# FACE.IT — Attendance Intelligence Dashboard

A full-featured, role-based attendance management platform built with React and TypeScript. Designed for higher-education institutions, FACE.IT combines manual attendance workflows with facial recognition to give administrators, teachers, and staff a single place to track presence, manage courses, and generate reports.

**Author:** Ndifon Lemuel  
**Institution model:** FACE.IT Engineering & Technology Institute, Yaoundé, Cameroun  
**Academic year modeled:** 2024/2025

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Modules Reference](#modules-reference)
- [Data Model](#data-model)
- [Authentication](#authentication)
- [Attendance Flow](#attendance-flow)
- [Exporting Reports](#exporting-reports)
- [Security](#security)
- [Roadmap / Backend Integration](#roadmap--backend-integration)

---

## Overview

FACE.IT is a single-page application that acts as the administrative front-end for an attendance tracking system. It currently ships with a rich mock-data layer (`src/data/mockData.ts`) so the full UI is fully functional without a live backend. When a Django REST API backend is available, the data layer is swapped for real API calls.

The application supports four departments — Computer Science & Engineering, Electrical & Electronic Engineering, Business Administration, and Mathematics & Statistics — each with multiple specializations across four academic levels (100L–400L).

---

## Features

### Core
- **Role-based dashboards** — superadmin, teacher, and staff each see a different overview with relevant KPIs and quick-actions
- **Student management** — create, view, edit, and deactivate student records; includes matric number, department, specialization, level, enrolled courses, face image count, and attendance rate
- **Teacher management** — manage lecturer profiles, assigned departments, and course loads
- **Course management** — level-based course browser with credit hours, semester assignment, department filtering, and teacher assignment
- **Timetable manager** — weekly grid showing all scheduled classes; create and edit time slots per course, room, and day
- **Attendance tracking** — start timed attendance sessions per course; mark students present, late, absent, or excused; view session history
- **Facial recognition** — face enrollment (up to 5 images per student) and real-time verification with configurable confidence threshold (default 0.75)
- **Reports** — attendance summaries by course, department, date range, or student; export to `.xlsx` via ExcelJS
- **Notifications panel** — in-app notification feed in the header
- **System settings** — configure institution details, timezone, date format, attendance grace period, facial recognition parameters, backup schedule, and email/SMS notification flags
- **Security dashboard** — live view of login attempts, active sessions, user activity log, and configurable security policy (password rules, session timeout, 2FA, IP whitelist)
- **Admin user management** — invite and manage admin accounts with granular permission sets
- **Admin profile** — personal profile page with account details and preference management

### UX
- Responsive layout — collapsible sidebar on desktop, off-canvas on mobile
- Tab-based navigation driven by URL search params (`?tab=students`, etc.) for direct-link support
- Smooth fade-in transitions between tabs
- Toast notifications via Sonner
- Accessible form components via Radix UI primitives

---

## User Roles

| Role | Description | Default Permissions |
|---|---|---|
| `superadmin` | Full system access | All |
| `teacher` | Can view students and mark/view attendance for their courses | `view_students`, `mark_attendance`, `view_attendance` |
| `staff` | Administrative access to student records and attendance views | `view_students`, `view_attendance`, `manage_students` |

Role is stored on the user object returned from the auth context and determines which sidebar items are rendered and which tabs are accessible.

**Demo credentials (mock data)**

| Username | Password | Role |
|---|---|---|
| `admin` | *(set by backend)* | superadmin |
| `dr.mbarga` | *(set by backend)* | teacher |
| `mr.onana` | *(set by backend)* | teacher |
| `mrs.nkwi` | *(set by backend)* | staff |

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5.5 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 + tailwindcss-animate |
| Component primitives | shadcn/ui (Radix UI) |
| Icons | Lucide React |
| Routing | React Router DOM v6 |
| Data fetching | TanStack React Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Excel export | ExcelJS |
| Toasts | Sonner |
| Theming | next-themes |
| Date utilities | date-fns |

---

## Project Structure

```
visages-attend-manager/
├── public/                         # Static assets (favicon, manifest)
├── src/
│   ├── features/                   # Feature modules (domain-driven)
│   │   ├── admin/
│   │   │   └── components/
│   │   │       ├── AdminProfile.tsx
│   │   │       ├── AdminUsers.tsx
│   │   │       ├── FacialRecognition.tsx
│   │   │       ├── SecurityDashboard.tsx
│   │   │       ├── SessionManagement.tsx
│   │   │       └── SystemSettings.tsx
│   │   ├── attendance/
│   │   │   └── components/AttendanceTable.tsx
│   │   ├── auth/
│   │   │   └── components/
│   │   │       ├── Login.tsx
│   │   │       ├── Logout.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── courses/
│   │   │   └── components/
│   │   │       ├── CourseDialog.tsx
│   │   │       ├── CourseManagement.tsx
│   │   │       └── LevelBasedCourseManager.tsx
│   │   ├── dashboard/
│   │   │   └── components/RoleBasedDashboard.tsx
│   │   ├── reports/
│   │   │   └── components/Reports.tsx
│   │   ├── students/
│   │   │   └── components/
│   │   │       ├── StudentCreateDialog.tsx
│   │   │       ├── StudentEditDialog.tsx
│   │   │       └── Students.tsx
│   │   ├── teachers/
│   │   │   └── components/
│   │   │       ├── TeacherCreateDialog.tsx
│   │   │       ├── TeacherEditDialog.tsx
│   │   │       └── TeacherManagement.tsx
│   │   └── timetable/
│   │       └── components/
│   │           ├── TimetableGrid.tsx
│   │           ├── TimetableManager.tsx
│   │           └── TimetableSlotDialog.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Top bar with notifications and user menu
│   │   │   ├── Sidebar.tsx         # Collapsible nav sidebar
│   │   │   └── index.ts
│   │   ├── shared/
│   │   │   ├── ErrorBoundary.tsx   # React error boundary wrapper
│   │   │   ├── NotificationsPanel.tsx
│   │   │   └── index.ts
│   │   └── ui/                     # shadcn/ui primitives (button, input, dialog, …)
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state, login/logout, JWT handling
│   ├── data/
│   │   └── mockData.ts             # Seed data for all entities
│   ├── hooks/
│   │   └── use-mobile.ts           # Breakpoint-aware mobile detection
│   ├── pages/
│   │   ├── Index.tsx               # Main shell — sidebar + header + tab router
│   │   └── NotFound.tsx
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── App.tsx                     # Route definitions and providers
│   ├── App.css                     # Global overrides and custom utilities
│   ├── index.css                   # Tailwind base + CSS custom properties
│   └── main.tsx                    # React DOM entry point
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

Each feature folder exposes a barrel `index.ts` so imports stay clean:

```ts
import { Students } from '@/features/students';
import { AttendanceTable } from '@/features/attendance';
import { Header, Sidebar } from '@/components/layout';
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later (comes with Node)

### Install dependencies

```sh
npm install
```

### Start the development server

```sh
npm run dev
```

Vite will print a local URL — typically `http://localhost:5173`. Open it in your browser.

The app loads with the mock data layer by default. No backend is required to explore all UI features.

---

## Environment Variables

Create a `.env.local` file in the project root to override defaults:

```sh
# Base URL for the Django REST API backend (optional, only needed when connecting to a live backend)
VITE_API_BASE_URL=http://localhost:8000
```

If `VITE_API_BASE_URL` is not set, the application falls back to mock data for all queries.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Type-check and build for production to `dist/` |
| `npm run build:dev` | Build with development mode flags (no minification) |
| `npm run preview` | Serve the production build locally for smoke-testing |
| `npm run lint` | Run ESLint across the entire `src/` tree |

---

## Modules Reference

### `src/features/auth`

Handles the login form, JWT storage, and route protection.

- `Login` — split-panel sign-in page with animated editorial left side and form on the right. Password visibility toggle and inline error display included.
- `ProtectedRoute` — wraps all authenticated routes; redirects unauthenticated visitors to `/login` while preserving the intended destination.
- `Logout` — clears auth state and redirects.

### `src/features/dashboard`

- `RoleBasedDashboard` — renders a different dashboard card set depending on the user's role. Superadmin sees institution-wide KPIs (total students, active courses, average attendance rate, sessions today). Teacher sees their own course list and recent session stats. Staff sees student counts and pending actions.

### `src/features/students`

- `Students` — paginated, filterable table of all students. Filters by department, level, specialization, and status. Shows matric number, attendance rate badge, and face image count.
- `StudentCreateDialog` — full form for enrolling a new student including department/specialization/level cascading selects and course enrollment.
- `StudentEditDialog` — pre-populated edit form for updating an existing student record.

### `src/features/teachers`

- `TeacherManagement` — list of all teachers with their departments and assigned course count.
- `TeacherCreateDialog` / `TeacherEditDialog` — create and edit teacher profiles.

### `src/features/courses`

- `CourseManagement` — top-level course browser with tabs per department.
- `LevelBasedCourseManager` — drill-down view filtered by level (100L–400L) within a department.
- `CourseDialog` — create/edit dialog for a course including credits, semester, level, specializations, and teacher assignment.

### `src/features/timetable`

- `TimetableManager` — wraps the grid with semester/academic year selectors and a "New Slot" button.
- `TimetableGrid` — renders a Monday–Friday, time-blocked weekly calendar. Each cell is color-coded by department.
- `TimetableSlotDialog` — form to create or update a timetable entry (course, room, day, start/end time).

### `src/features/attendance`

- `AttendanceTable` — lists all attendance sessions. Teachers can start a new session for one of their courses; the session card shows present/absent/late counters in real time. Supports manual mark overrides and session close.

### `src/features/reports`

- `Reports` — charts (bar, line, pie via Recharts) summarizing attendance by course, department, and date range. Export button generates an `.xlsx` workbook via ExcelJS.

### `src/features/admin`

- `AdminUsers` — table of all admin accounts with role badges, 2FA status, and last-login time. Supports invite, edit, and deactivate.
- `FacialRecognition` — face enrollment UI; shows each student's enrolled image count, lets admins add/remove face images, and displays confidence scores from the last recognition event.
- `SecurityDashboard` — three-tab view: login attempts log, active sessions list (with remote-invalidate option), and user activity audit log. Security policy form at the bottom (password rules, lockout config, 2FA toggle).
- `SessionManagement` — focused view of currently active browser sessions with IP, last-activity timestamp, and force-expire button.
- `SystemSettings` — tabbed settings panel covering institution profile, attendance policy (grace period, late threshold, auto-absent threshold), facial recognition parameters, backup schedule, and notification channels.
- `AdminProfile` — personal profile page for the logged-in admin: avatar, display name, email, and password change.

### `src/components/layout`

- `Header` — top bar showing the current page label, a notification bell (opens `NotificationsPanel`), and a user avatar menu with links to profile, settings, and logout.
- `Sidebar` — collapsible navigation rail. On desktop it toggles between full-width (with labels) and icon-only mode. On mobile it slides in as an overlay. Nav items are filtered by role permissions.

### `src/components/shared`

- `ErrorBoundary` — catches unhandled render errors and displays a user-friendly fallback with a reload button instead of a blank screen.
- `NotificationsPanel` — slide-in panel listing recent system notifications (attendance flagged, student enrolled, etc.).

---

## Data Model

The core TypeScript interfaces live in `src/types/index.ts`. Key entities:

| Entity | Key fields |
|---|---|
| `Department` | `id`, `department_name`, `department_code`, `head_of_department` |
| `Specialization` | `id`, `specialization_name`, `specialization_code`, `department`, `duration_years` |
| `Level` | `id`, `level_name` (`100 Level`–`400 Level`), `level_code`, `departments`, `specializations` |
| `Course` | `id`, `course_code`, `course_name`, `credits`, `semester`, `department`, `level`, `specializations`, `teachers` |
| `Student` | `id`, `matric_number`, `full_name`, `department`, `specialization`, `level`, `enrolled_courses`, `face_images_count`, `attendance_rate` |
| `AdminUser` | `id`, `username`, `role`, `permissions[]`, `is_2fa_enabled`, `last_login` |
| `AttendanceRecord` | `id`, `student`, `course`, `status` (`present`/`absent`/`late`/`excused`), `check_in_time`, `date` |
| `AttendanceSession` | `id`, `session_id`, `course`, `teacher`, `start_time`, `status`, `present_count`, `late_count`, `absent_count`, `attendance_rate` |
| `SystemSettings` | institution details, attendance policy, face recognition config, backup config |
| `SecuritySettings` | password policy, session policy, 2FA config, logging config |

---

## Authentication

Auth state is managed by `AuthContext` (`src/contexts/AuthContext.tsx`). On successful login the context stores the user object (id, username, role, permissions) and a JWT access token. All protected routes are wrapped in `ProtectedRoute`, which redirects to `/login` if no valid session exists.

The mock auth layer accepts any username/password combination and returns the matching user from `adminUsers` in `mockData.ts` based on the username. When the real backend is connected, `AuthContext` calls `/auth/login/` and `/auth/refresh/` on the Django API.

---

## Attendance Flow

1. A teacher navigates to the **Attendance** tab and clicks **Start Session** for one of their assigned courses.
2. A session record is created with `status: active`. The system records `start_time` and applies the configured `grace_period_minutes` (default 10 min) and `late_threshold` (default 15 min).
3. Students check in — either via facial recognition or manual mark. Check-ins within the grace period are `present`; after the grace period and before the late threshold they are `late`.
4. After `auto_mark_absent_after` minutes (default 30) any student who has not checked in is automatically marked `absent`.
5. The teacher ends the session (or it auto-ends if `auto_end_enabled` is true). The session is closed with `status: completed` and the final counts are frozen.
6. Records appear immediately in **Attendance** history and are included in **Reports** exports.

---

## Exporting Reports

The **Reports** module uses [ExcelJS](https://github.com/exceljs/exceljs) to generate `.xlsx` files client-side — no server round-trip required. Each export includes:

- A summary sheet with total sessions, average attendance rate, and per-course breakdown
- A detail sheet with one row per attendance record (student name, matric, course, date, status, check-in time)

Triggered by the **Export** button in the Reports tab. The file is downloaded directly to the user's machine.

> Note: the `xlsx` package (a lighter alternative) was evaluated but ExcelJS was kept for its write-only safety profile and richer cell formatting support.

---

## Security

The Security Dashboard surfaces three categories of data:

- **Login attempts** — every auth attempt (success or failure) is logged with username, IP address, timestamp, and failure reason if applicable.
- **Active sessions** — all currently valid browser sessions with last-activity timestamps. Admins can force-invalidate any session remotely.
- **Activity log** — high-level audit trail of all create/update/delete actions performed by admin users.

Security policy is configurable from the same page: minimum password length, lockout threshold and duration, session timeout, concurrent session limit, 2FA enforcement, and IP whitelist mode.

---

## Roadmap / Backend Integration

This frontend is designed to connect to a **Django REST Framework** backend. The expected API surface is:

```
POST   /auth/login/
POST   /auth/refresh/
GET    /auth/user/

GET/POST       /api/students/
GET/PUT/DELETE /api/students/:id/

GET/POST       /api/teachers/
GET/PUT/DELETE /api/teachers/:id/

GET/POST       /api/courses/
GET/PUT/DELETE /api/courses/:id/

GET/POST       /api/timetable/entries/
GET/PUT/DELETE /api/timetable/entries/:id/

GET/POST       /api/attendance/sessions/
POST           /api/attendance/sessions/:id/close/
GET/POST       /api/attendance/records/
PUT            /api/attendance/records/:id/

GET            /api/reports/summary/
GET            /api/reports/export/

GET/POST       /api/admin/users/
GET/PUT/DELETE /api/admin/users/:id/

GET/PUT        /api/settings/system/
GET/PUT        /api/settings/security/
GET            /api/security/login-attempts/
GET            /api/security/sessions/
DELETE         /api/security/sessions/:id/
GET            /api/security/activity-log/
```

To connect the frontend to a live backend, replace the mock data exports in `src/data/mockData.ts` with TanStack Query hooks that call the above endpoints, and set `VITE_API_BASE_URL` in your `.env.local`.
