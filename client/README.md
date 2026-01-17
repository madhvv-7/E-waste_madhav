# Client - E-Waste Management Frontend

React frontend application for the E-Waste Collection and Recycling Management System.

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
client/
├── src/
│   ├── api.js              # API configuration (axios instance)
│   ├── AuthContext.jsx     # Authentication context provider
│   ├── App.jsx             # Main app component with routing
│   ├── ProtectedRoute.jsx  # Route protection component
│   ├── components/
│   │   └── Navbar.jsx      # Navigation bar component
│   ├── pages/
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── UserDashboard.jsx      # User dashboard
│   │   ├── AgentDashboard.jsx     # Agent dashboard
│   │   ├── RecyclerDashboard.jsx  # Recycler dashboard
│   │   └── AdminDashboard.jsx     # Admin dashboard
│   ├── index.css           # Global styles
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
└── package.json
```

## 🔧 Configuration

### API Endpoint

By default, the frontend connects to `http://localhost:5000/api`.

To change the API endpoint, update `src/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://your-backend-url/api',
});
```

## 📱 Pages

### Public Pages
- **Home** (`/`) - Landing page with role-based dashboard links
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - User registration with role selection

### Protected Pages (Require Authentication)
- **User Dashboard** (`/user/dashboard`) - Create and track pickup requests
- **Agent Dashboard** (`/agent/dashboard`) - View and manage assigned requests
- **Recycler Dashboard** (`/recycler/dashboard`) - Process incoming e-waste
- **Admin Dashboard** (`/admin/dashboard`) - System management and reports

## 🔐 Authentication

Authentication is handled via:
- **JWT Tokens**: Stored in localStorage
- **AuthContext**: Global state management for user authentication
- **ProtectedRoute**: Component that enforces authentication and role-based access

### Usage Example

```javascript
import { useAuth } from './AuthContext';

function MyComponent() {
  const { user, token, logout } = useAuth();
  // Use user and token here
}
```

## 🎨 Styling

The application uses custom CSS with:
- Modern color scheme
- Responsive design
- Status badges
- Card-based layouts
- Form styling

Styles are defined in `src/index.css`.

## 📦 Dependencies

- **react**: UI library
- **react-dom**: React DOM renderer
- **react-router-dom**: Client-side routing
- **axios**: HTTP client for API calls
- **vite**: Build tool and dev server

## 🛠 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Notes

- JWT tokens are stored in localStorage
- Protected routes redirect to login if not authenticated
- Role-based access control is enforced via `ProtectedRoute`
- All API calls include JWT token in Authorization header
