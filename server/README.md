# Server - E-Waste Management API

Express.js backend server for the E-Waste Collection and Recycling Management System.

## 📁 Directory Structure

```
server/
├── config/
│   └── db.js              # MongoDB connection configuration
├── models/
│   ├── User.js            # User schema (all roles)
│   ├── PickupRequest.js   # Pickup request schema
│   ├── EWasteItem.js      # E-waste item schema (optional)
│   └── RecyclingRecord.js # Recycling record schema
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── pickup.js          # User pickup routes
│   ├── agent.js           # Agent routes
│   ├── recycler.js        # Recycler routes
│   └── admin.js           # Admin routes
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── server.js              # Server entry point
├── .env                   # Environment variables (create this)
└── package.json           # Dependencies
```

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ewaste_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Start Server

```bash
node server.js
```

For development with auto-restart, install nodemon:

```bash
npm install -g nodemon
nodemon server.js
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",  // user | agent | recycler | admin
  "address": "123 Main St",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### User Endpoints (Requires 'user' role)

#### Create Pickup Request
```http
POST /api/pickup/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickupAddress": "123 Main St, City",
  "items": [
    {
      "description": "Old Laptop",
      "quantity": 1
    }
  ]
}
```

#### Get My Requests
```http
GET /api/pickup/my-requests
Authorization: Bearer <token>
```

### Agent Endpoints (Requires 'agent' role)

#### Get Assigned Requests
```http
GET /api/agent/requests
Authorization: Bearer <token>
```

#### Mark as Collected
```http
PUT /api/agent/collect/:id
Authorization: Bearer <token>
```

#### Send to Recycler
```http
PUT /api/agent/send-to-recycler/:id
Authorization: Bearer <token>
```

### Recycler Endpoints (Requires 'recycler' role)

#### Get Incoming Requests
```http
GET /api/recycler/requests
Authorization: Bearer <token>
```

#### Mark as Recycled
```http
PUT /api/recycler/recycle/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "recyclingMethod": "Shredding and material recovery",
  "remarks": "Recovered copper and aluminum"
}
```

### Admin Endpoints (Requires 'admin' role)

#### Get All Requests
```http
GET /api/admin/requests
Authorization: Bearer <token>
```

#### Assign Agent
```http
PUT /api/admin/assign/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "agentId": "agent_user_id_here"
}
```

#### Get Reports
```http
GET /api/admin/reports
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalRequests": 10,
  "statusCounts": [
    { "_id": "Requested", "count": 3 },
    { "_id": "Collected", "count": 2 },
    { "_id": "SentToRecycler", "count": 2 },
    { "_id": "Recycled", "count": 3 }
  ],
  "totalUsers": 5,
  "totalAgents": 2,
  "totalRecyclers": 1,
  "recyclingRecords": 3
}
```

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are valid for 30 days.

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'user', 'agent', 'recycler', 'admin'),
  address: String,
  phone: String,
  timestamps: true
}
```

### PickupRequest Model
```javascript
{
  userId: ObjectId (ref: User),
  items: [{
    description: String,
    quantity: Number
  }],
  pickupAddress: String,
  assignedAgentId: ObjectId (ref: User, nullable),
  status: String (enum: 'Requested', 'Collected', 'SentToRecycler', 'Recycled'),
  timestamps: true
}
```

### RecyclingRecord Model
```javascript
{
  pickupRequestId: ObjectId (ref: PickupRequest),
  recyclerId: ObjectId (ref: User),
  recyclingMethod: String,
  completionDate: Date,
  remarks: String,
  timestamps: true
}
```

## 🛠 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🐛 Error Handling

All routes return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

Error responses include a message:
```json
{
  "message": "Error description here"
}
```

## 📝 Notes

- MongoDB connection is established in `config/db.js`
- Authentication middleware validates JWT tokens
- Role-based authorization is enforced via `authorize` middleware
- All passwords are hashed using bcrypt before storage
