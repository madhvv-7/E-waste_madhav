import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css';

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
      const res = await loginRequest({ email: loginForm.email, password: loginForm.password });
      // If loginRequest returns user data, redirect immediately based on role
      const role = res?.user?.role || res?.role;
      if (role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (role === 'agent') navigate('/agent/dashboard', { replace: true });
      else if (role === 'recycler') navigate('/recycler/dashboard', { replace: true });
      else navigate('/user/dashboard', { replace: true });
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // entrance animation classes
  const [textClass, setTextClass] = useState('');
  const [cardClass, setCardClass] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setTextClass('fade-in'), 80);
    const c = setTimeout(() => setCardClass('slide-in'), 220);
    return () => { clearTimeout(t); clearTimeout(c); };
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-inner">
            <div className={`col-12 col-md-6 ${textClass}`}>
              <h1 className="hero-headline display-4">Smart E-Waste Collection & Recycling Platform</h1>
              <p className="hero-sub mt-4">
                Connect citizens, agents, and recyclers with an easy-to-use system to request pickups, assign collections, and track recycling — built for impact and clarity.
              </p>
              <div className="d-flex gap-3 mt-4">
                <a href="/" className="btn btn-outline-success rounded-pill">Explore</a>
                <a href="/register" className="btn btn-gradient rounded-pill">Get Started</a>
              </div>
            </div>

            <div className={`col-12 col-md-6 login-accent ${cardClass}`}>
              <div className="bg-accent" />
              <div className="login-card">
                <h5 className="mb-3" style={{ color: '#0b6623' }}>Sign in to your account</h5>
                <form onSubmit={handleLoginSubmit}>
                  {loginError && <div className="alert alert-danger">{loginError}</div>}
                  <div className="mb-3">
                    <label className="form-label small">Email</label>
                    <input name="email" value={loginForm.email} onChange={handleLoginChange} type="email" className="form-control rounded-pill" placeholder="you@example.com" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Password</label>
                    <div className="input-group">
                      <input name="password" value={loginForm.password} onChange={handleLoginChange} type={showPassword ? 'text' : 'password'} className="form-control rounded-pill" placeholder="Password" />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                  <div className="d-grid">
                    <button className="btn btn-gradient rounded-pill" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
                  </div>
                </form>
                <div className="mt-3 text-center">
                  <small>Don't have an account? <a href="/register">Register</a></small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New sections below hero */}
      <section id="how-it-works" className="py-5">
        <div className="container">
          <h2 className="mb-4 text-center" style={{ color: '#0b6623' }}>How It Works</h2>
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-4">
              <div className="card p-4 h-100" style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(6,62,38,0.06)' }}>
                <h5 style={{ color: '#0b6623' }}>Request Pickup</h5>
                <p className="text-muted mb-0">Users submit e-waste pickup requests through a simple form.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card p-4 h-100" style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(6,62,38,0.06)' }}>
                <h5 style={{ color: '#0b6623' }}>Agent Collection</h5>
                <p className="text-muted mb-0">Admins assign agents who collect and update request status.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="card p-4 h-100" style={{ borderRadius: 12, boxShadow: '0 8px 24px rgba(6,62,38,0.06)' }}>
                <h5 style={{ color: '#0b6623' }}>Responsible Recycling</h5>
                <p className="text-muted mb-0">Recyclers process items and mark them as recycled for reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="who" className="py-5" style={{ background: '#f8faf9' }}>
        <div className="container">
          <h2 className="mb-4 text-center" style={{ color: '#0b6623' }}>Who Can Use This Platform</h2>
          <div className="row g-4">
            <div className="col-12 col-md-4 text-center">
              <h5>Citizens</h5>
              <p className="text-muted">Request pickups and track status.</p>
            </div>
            <div className="col-12 col-md-4 text-center">
              <h5>Collection Agents</h5>
              <p className="text-muted">View assigned pickups and update collection.</p>
            </div>
            <div className="col-12 col-md-4 text-center">
              <h5>Recyclers</h5>
              <p className="text-muted">Manage incoming e-waste and mark recycled.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-4" style={{ background: '#f1f6f3' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
          <div className="mb-3 mb-md-0">
            <strong>About</strong>
            <div className="text-muted small">E-Waste Management — simple & responsible.</div>
          </div>
          <div className="mb-3 mb-md-0">
            <strong>Contact</strong>
            <div className="text-muted small">support@ewaste.example</div>
          </div>
          <div className="text-muted small">© 2026 E-Waste Management</div>
        </div>
      </footer>
    </>
  );
}

