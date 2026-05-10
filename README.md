# Visages Attend Manager

A React-based attendance management dashboard for school administrators, teachers, and staff. The app includes role-based access, attendance tracking, timetable management, user profile management, reports, system settings, and a real-time backend health indicator.

## Key features

- Role-based navigation for Super Admin, Admin, Teacher, Staff, Parent, and Student users
- Dashboard with attendance summaries and charts
- Course and timetable management for administrators
- Teacher attendance workflows with course-based filtering
- Attendance records viewing, editing, and deletion
- Admin user management and profile management
- System settings for superuser configuration
- Connection status monitor for Django backend availability
- React Query data fetching, smart API retry handling, and token refresh support

## Project structure

- `src/App.tsx` - app routing and protected routes
- `src/contexts/AuthContext.tsx` - authentication, JWT storage, role handling
- `src/components/` - main UI pages and reusable features
- `src/services/djangoApi.ts` - Django backend integration and auth API
- `src/services/timetableApi.ts` - timetable API adapter
- `src/config/` - permission rules and menu definitions
- `src/constants/roles.ts` - user role constants

## Technology stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI components
- React Router DOM
- React Query
- Zod + React Hook Form
- Recharts for analytics visualizations

## Local setup

1. Install dependencies

```sh
npm install
```

2. Start the frontend development server

```sh
npm run dev
```

3. Open the local URL shown by Vite (usually `http://localhost:5173`)

## Backend integration

This frontend is designed to connect to a Django backend. It auto-detects a running backend at one of these endpoints:

- `http://localhost:8000`
- `http://127.0.0.1:8000`
- `http://localhost:8080`
- `http://192.168.1.100:8000`

If your backend uses a different host, set the environment variable:

```sh
VITE_API_BASE_URL=http://your-backend-host:8000
```

The frontend expects the Django API to provide authentication endpoints and attendance/timetable resources, including:

- `/auth/login/`
- `/auth/refresh/`
- `/auth/user/`
- `/api/timetable/entries/`
- `/api/timetable/timeslots/`
- `/api/timetable/rooms/`

## Running a production build

```sh
npm run build
```

Preview the built app locally:

```sh
npm run preview
```

## Notes

- Login is handled via JWT tokens stored in `localStorage`
- Protected pages are wrapped by `ProtectedRoute`
- Menu items are displayed based on role and permission rules in `src/config/menuPermissions.ts`
- The `ConnectionStatus` component checks backend availability regularly and shows offline status if the Django API cannot be reached

## Useful commands

- `npm run dev` - start development server
- `npm run build` - build app for production
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint checks
