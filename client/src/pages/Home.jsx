import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { loginRequest, user } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect logged-in users to their dashboards immediately
  useEffect(() => {
    if (!user) return;
    const role = user.role;
    if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    else if (role === 'agent') navigate('/agent/dashboard', { replace: true });
    else if (role === 'recycler') navigate('/recycler/dashboard', { replace: true });
    else navigate('/user/dashboard', { replace: true });
  }, [user, navigate]);

  // If user exists, don't render the home UI (we are redirecting)
  if (user) return null;

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((s) => ({ ...s, [name]: value }));
    setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await loginRequest({ email: loginForm.email, password: loginForm.password });
      navigate('/');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-fluid py-5" style={{ background: 'linear-gradient(180deg,#f4faf7,#ffffff)' }}>
      <div className="container">
        <div className="row align-items-center gx-5">
          <div className="col-12 col-md-6">
            <h1 className="display-5 fw-bold" style={{ color: '#0b6623', lineHeight: 1.05 }}>
              Smart E-Waste Collection & Recycling Platform
            </h1>
            <p className="lead text-muted my-4" style={{ maxWidth: 560 }}>
              Streamline pickup requests, agent assignments, and recycling records with an easy-to-use platform that connects citizens, collection agents, recyclers, and administrators — built for visibility and impact.
            </p>
            <div className="d-flex gap-3">
              <a href="/register" className="btn btn-lg text-white rounded-pill" style={{ background: 'linear-gradient(90deg,#0b6623,#2aa38a)', border: 'none' }}>Register</a>
            </div>
          </div>

          <div className="col-12 col-md-6 mt-4 mt-md-0">
            <div className="card shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
              <div className="p-4" style={{ background: '#ffffff' }}>
                <h5 className="mb-3" style={{ color: '#0b6623' }}>Login</h5>
                <form onSubmit={handleLoginSubmit}>
                  {loginError && <div className="alert alert-danger">{loginError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input name="email" value={loginForm.email} onChange={handleLoginChange} type="email" className="form-control rounded-pill" placeholder="you@example.com" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <input name="password" value={loginForm.password} onChange={handleLoginChange} type={showPassword ? 'text' : 'password'} className="form-control rounded-pill" placeholder="Password" />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-success rounded-pill" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
                  </div>
                </form>
                <div className="mt-3 text-center">
                  <small>Don't have an account? <a href="/register">Register</a></small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

