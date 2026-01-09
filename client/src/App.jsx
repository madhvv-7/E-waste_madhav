import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

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
            <div>User dashboard (to be implemented)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute allowedRoles={['agent']}>
            <div>Agent dashboard (to be implemented)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/recycler/dashboard"
        element={
          <ProtectedRoute allowedRoles={['recycler']}>
            <div>Recycler dashboard (to be implemented)</div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div>Admin dashboard (to be implemented)</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
