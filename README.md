# E-Waste Collection and Recycling Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application for managing e-waste collection and recycling processes. This system connects Users (Citizens), Collection Agents, Recyclers, and Administrators to facilitate responsible e-waste disposal.

##Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Workflow](#workflow)
- [Screenshots](#screenshots)
- [Testing](#testing)

##Features

- **User Registration & Authentication**: JWT-based authentication for all user roles
- **Role-Based Access Control**: Four distinct user roles with appropriate permissions
- **Pickup Request Management**: Users can create and track e-waste pickup requests
- **Agent Assignment**: Admins can assign pickup requests to collection agents
- **Status Tracking**: Real-time status updates (Requested → Collected → SentToRecycler → Recycled)
- **Recycling Records**: Detailed recycling records with methods and remarks
- **Admin Dashboard**: Comprehensive system reports and analytics
- **Responsive UI**: Clean, modern interface with intuitive navigation

##Tech Stack

### Frontend
- **React 19** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool

###Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

##Project Structure

```
Main_Project/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── api.js         # API configuration
│   │   ├── AuthContext.jsx # Authentication context
│   │   ├── App.jsx        # Main app component
│   │   ├── components/    # Reusable components
│   │   └── pages/         # Page components
│   └── package.json
│
├── server/                 # Express backend application
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── server.js          # Server entry point
│   └── package.json
│
└── README.md              # This file
```

##Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MongoDB** (Local installation or MongoDB Atlas account)

##Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Main_Project
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

##Configuration

### Backend Configuration

1. Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ewaste_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**Important**: 
- Replace `MONGO_URI` with your MongoDB connection string
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/ewaste_db`
- Replace `JWT_SECRET` with a strong random string

### Frontend Configuration

The frontend is configured to connect to `http://localhost:5000` by default. If your backend runs on a different port, update `client/src/api.js`.

##Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For local MongoDB
mongod
```

Or ensure your MongoDB Atlas cluster is accessible.

### Start Backend Server

```bash
cd server
npm start
# Or for development with auto-restart:
# nodemon server.js (if installed)
```

The server will start on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal:

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

##User Roles

### 1. User (Citizen)
- Register and login
- Create e-waste pickup requests
- Track request status
- View pickup history

### 2. Collection Agent
- Login
- View assigned pickup requests
- Mark requests as "Collected"
- Send collected items to recycler

### 3. Recycler
- Login
- View incoming e-waste (SentToRecycler status)
- Mark items as "Recycled"
- Add recycling method and remarks

### 4. Admin
- Login
- View all pickup requests
- Assign agents to requests
- View system reports and statistics
- Monitor entire workflow

##API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User (Citizen)
- `POST /api/pickup/request` - Create pickup request
- `GET /api/pickup/my-requests` - Get user's requests

### Collection Agent
- `GET /api/agent/requests` - Get assigned requests
- `PUT /api/agent/collect/:id` - Mark as collected
- `PUT /api/agent/send-to-recycler/:id` - Send to recycler

### Recycler
- `GET /api/recycler/requests` - Get incoming e-waste
- `PUT /api/recycler/recycle/:id` - Mark as recycled

### Admin
- `GET /api/admin/requests` - Get all requests
- `PUT /api/admin/assign/:id` - Assign agent to request
- `GET /api/admin/reports` - Get system statistics

**Note**: All routes except `/api/auth/register` and `/api/auth/login` require authentication via JWT token.

##Workflow

1. **User creates request**: Citizen registers and creates a pickup request
2. **Admin assigns agent**: Admin views the request and assigns it to an agent
3. **Agent collects**: Agent marks the request as "Collected"
4. **Agent sends to recycler**: Agent marks request as "SentToRecycler"
5. **Recycler processes**: Recycler marks the item as "Recycled" with details
6. **User sees completion**: User can track the status through all stages

##Screenshots

*Add screenshots of your application here for documentation*

##Testing

### Manual Testing Workflow

1. **Register Test Users**:
   - Create accounts for each role (User, Agent, Recycler, Admin)
   - Use the Register page or seed script

2. **User Flow**:
   - Login as User → Create pickup request → View in "My Requests"

3. **Admin Flow**:
   - Login as Admin → View all requests → Assign to agent

4. **Agent Flow**:
   - Login as Agent → View assigned requests → Mark as Collected → Send to Recycler

5. **Recycler Flow**:
   - Login as Recycler → View incoming e-waste → Mark as Recycled

6. **Verify End-to-End**:
   - Check that user's request status updates through all stages

### Seed Script

A seed script is available to create test users. See `server/scripts/seed.js` for details.

##Notes

- This is a demonstration project for academic purposes
- JWT tokens expire after 30 days
- Passwords are hashed using bcrypt
- All routes are protected with role-based authorization

##Contributing

This is a final year project. For questions or issues, please contact the project maintainer.

##License

This project is created for academic purposes.

##Author

Madhav S

Final Year Project - [2026]

---
