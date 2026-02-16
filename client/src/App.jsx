import { Link, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import Navbar from './components/Navbar';
// Login page removed - login UI now on Home
import Register from './pages/RegisterClean';
import ContactAdmin from './pages/ContactAdmin';
import UserDashboard from './pages/UserDashboard';
import AgentDashboard from './pages/AgentDashboard';
import RecyclerDashboard from './pages/RecyclerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
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
