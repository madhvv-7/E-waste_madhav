import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return null;
    const role = user.role;
    if (role === 'user') return '/user/dashboard';
    if (role === 'agent') return '/agent/dashboard';
    if (role === 'recycler') return '/recycler/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return null;
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          E-Waste Management System
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to={getDashboardLink()}>Dashboard</Link>
              <span>Welcome, {user.name} ({user.role})</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
