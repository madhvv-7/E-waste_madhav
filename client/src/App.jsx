import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AgentDashboard from './pages/AgentDashboard';
import RecyclerDashboard from './pages/RecyclerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function Home() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1>E-Waste Collection & Recycling</h1>
      {user ? (
        <>
          <p>
            Logged in as <strong>{user.name}</strong> ({user.role})
          </p>
          <button onClick={logout}>Logout</button>
          <div style={{ marginTop: '1rem' }}>
            {user.role === 'user' && (
              <Link to="/user/dashboard">Go to User Dashboard</Link>
            )}
            {user.role === 'agent' && (
              <Link to="/agent/dashboard">Go to Agent Dashboard</Link>
            )}
            {user.role === 'recycler' && (
              <Link to="/recycler/dashboard">Go to Recycler Dashboard</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin/dashboard">Go to Admin Dashboard</Link>
            )}
          </div>
        </>
      ) : (
        <p>
          <Link to="/login">Login</Link> or{' '}
          <Link to="/register">Register</Link> to continue.
        </p>
      )}
      <p style={{ marginTop: '1rem' }}>
        This is the main landing page. In later phases we will add separate
        dashboards for User, Agent, Recycler, and Admin.
      </p>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Examples of protected routes we will fill in future phases */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recycler/dashboard"
        element={
          <ProtectedRoute allowedRoles={['recycler']}>
            <RecyclerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
