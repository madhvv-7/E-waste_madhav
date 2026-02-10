import { Link, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ContactAdmin from './pages/ContactAdmin';
import UserDashboard from './pages/UserDashboard';
import AgentDashboard from './pages/AgentDashboard';
import RecyclerDashboard from './pages/RecyclerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h1>E-Waste Collection & Recycling Management System</h1>
      {user ? (
        <>
          <p>
            Welcome, <strong>{user.name}</strong>! Access your dashboard below.
          </p>
          <div className="dashboard-links">
            {user.role === 'user' && (
              <Link to="/user/dashboard">User Dashboard</Link>
            )}
            {user.role === 'agent' && (
              <Link to="/agent/dashboard">Agent Dashboard</Link>
            )}
            {user.role === 'recycler' && (
              <Link to="/recycler/dashboard">Recycler Dashboard</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            )}
          </div>
        </>
      ) : (
        <>
          <p>
            A centralized web application connecting Users, Collection Agents,
            Recyclers, and Admin for responsible e-waste management.
          </p>
          <div className="dashboard-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact-admin" element={<ContactAdmin />} />
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
    </>
  );
}

export default App;
