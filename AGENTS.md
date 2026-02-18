# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

E-Waste Collection and Recycling Management System - a full-stack MERN application connecting Users (Citizens), Collection Agents, Recyclers, and Administrators to manage e-waste disposal workflows.

## Commands

### Server (Express Backend)
```bash
cd server
npm install          # Install dependencies
npm start            # Start server (port 5000)
npm run dev          # Start with nodemon (hot reload)
npm run seed         # Seed test users
npm test             # Run Jest tests
```

### Client (React Frontend)
```bash
cd client
npm install          # Install dependencies
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Production build
npm run lint         # Run ESLint
```

### Prerequisites
- MongoDB must be running locally or via Atlas
- Server requires `.env` file with `PORT`, `MONGO_URI`, and `JWT_SECRET`

## Architecture

### Authentication Flow
- JWT tokens stored in localStorage, attached via `Authorization: Bearer` header
- `AuthContext.jsx` manages auth state and provides `useAuth()` hook
- `client/src/api.js` configures axios with base URL and token injection
- `server/middleware/auth.js` exports `protect` (validates JWT) and `authorize(...roles)` (role-based access)

### Role-Based Access Control
Four roles with distinct permissions:
- **user**: Create/track pickup requests
- **agent**: View assigned requests, mark collected, send to recycler
- **recycler**: View incoming e-waste, mark as recycled
- **admin**: View all requests, assign agents, view reports

### Request Status Flow
```
Requested → Collected → SentToRecycler → Recycled
```

### API Route Structure
All routes prefixed with `/api`:
- `/auth` - Registration and login (public)
- `/pickup` - User pickup requests (user role)
- `/agent` - Collection agent operations (agent role)
- `/recycler` - Recycler operations (recycler role)
- `/admin` - Admin operations (admin role)
- `/appeals` - Contact/appeal requests

Health check: `GET /` returns `{ message: 'API is running' }`

### Data Models (server/models/)
- `User.js` - Users with role field (user/agent/recycler/admin)
- `PickupRequest.js` - E-waste pickup requests with status tracking
- `EWasteItem.js` - E-waste item types and categories
- `RecyclingRecord.js` - Recycling completion records
- `Appeal.js` - User contact/appeal submissions

### Frontend Structure
- `AuthContext.jsx` - Global auth state provider
- `ProtectedRoute.jsx` - Route guard component
- `pages/` - Role-specific dashboards (UserDashboard, AgentDashboard, RecyclerDashboard, AdminDashboard)
- `components/Navbar.jsx` - Navigation component
- `components/AdminLayout.jsx` - Admin page layout wrapper
- UI styled with Bootstrap 5
