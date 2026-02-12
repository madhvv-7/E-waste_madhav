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
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#155724' }}>
      <div className="container">
        <Link className="navbar-brand text-white fw-bold" to="/">
          E-Waste Management
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to={getDashboardLink()}>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <span className="nav-link text-white">Hi, {user.name}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-sm btn-outline-light" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
