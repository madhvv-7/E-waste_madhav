import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Login() {
  const { loginRequest } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginRequest(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setErrorStatus(err.response?.data?.status || '');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card shadow-sm" style={{ maxWidth: 480, margin: '2rem auto' }}>
        <div className="card-body">
          <h2 className="card-title mb-3">Login</h2>
          {error && <div className="message message-error">{error}</div>}

          {errorStatus && (errorStatus === 'rejected' || errorStatus === 'deactivated') && (
            <div className="mb-3">
              <Link
                to={`/contact-admin?email=${encodeURIComponent(form.email || '')}`}
                className="btn btn-outline-secondary"
              >
                Contact Admin
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="text-center mt-3">
            <small>
              No account? <Link to="/register">Register</Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;


