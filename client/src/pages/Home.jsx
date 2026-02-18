import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
                <a href="/explore" className="btn btn-outline-success rounded-pill">Explore</a>
                <a href="/register" className="btn btn-gradient rounded-pill">Get Started</a>
              </div>
            </div>

            <div className={`col-12 col-md-6 login-accent ${cardClass}`}>
              <div className="bg-accent" />
              <div className="login-card">
                <h5 className="mb-3" style={{ color: '#0b6623' }}>Sign in to your account</h5>
                <form onSubmit={handleLoginSubmit}>
                  {loginError && (
                    <div className="alert alert-danger">
                      {loginError}
                      {(loginError.toLowerCase().includes('deactivated') || 
                        loginError.toLowerCase().includes('rejected') ||
                        loginError.toLowerCase().includes('pending')) && (
                        <div className="mt-2">
                          <Link 
                            to={`/contact-admin?email=${encodeURIComponent(loginForm.email)}`}
                            className="alert-link"
                          >
                            Contact Administrator
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
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

      {/* How It Works Section */}
      <section id="how-it-works" className="home-section how-it-works-section">
        <div className="container">
          <h2 className="home-section-title">How It Works</h2>
          <p className="home-section-subtitle">Simple steps to responsibly recycle your e-waste</p>
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-4">
              <div className="home-work-card">
                <div className="home-card-image-placeholder">
                  <span>📦</span>
                </div>
                <div className="home-card-icon">
                  <span>1</span>
                </div>
                <h5>Request Pickup</h5>
                <p>Users submit e-waste pickup requests through a simple form. Schedule at your convenience.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="home-work-card">
                <div className="home-card-image-placeholder">
                  <span>🚚</span>
                </div>
                <div className="home-card-icon">
                  <span>2</span>
                </div>
                <h5>Agent Collection</h5>
                <p>Admins assign agents who collect and update request status in real-time.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="home-work-card">
                <div className="home-card-image-placeholder">
                  <span>♻️</span>
                </div>
                <div className="home-card-icon">
                  <span>3</span>
                </div>
                <h5>Responsible Recycling</h5>
                <p>Recyclers process items and mark them as recycled for transparent reporting.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Use Section */}
      <section id="who" className="home-section who-section">
        <div className="container">
          <h2 className="home-section-title">Who Can Use This Platform</h2>
          <p className="home-section-subtitle">Designed for everyone in the e-waste ecosystem</p>
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-4">
              <div className="home-role-card">
                <div className="home-role-icon">
                  <span>👤</span>
                </div>
                <h5>Citizens</h5>
                <p>Request pickups, track status, and monitor your recycling impact with easy-to-use dashboards.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="home-role-card">
                <div className="home-role-icon">
                  <span>🚛</span>
                </div>
                <h5>Collection Agents</h5>
                <p>View assigned pickups, update collection status, and manage routes efficiently.</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="home-role-card">
                <div className="home-role-icon">
                  <span>🏭</span>
                </div>
                <h5>Recyclers</h5>
                <p>Manage incoming e-waste, process items responsibly, and generate compliance reports.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section - Two Column */}
      <section className="home-section home-info-section">
        <div className="container">
          <div className="home-info-inner">
            <div className="home-info-text">
              <h2 className="home-section-title text-start">Why Choose Our Platform?</h2>
              <p className="home-info-description">
                Our e-waste management platform is designed to make recycling simple, transparent, and impactful. 
                We connect citizens directly with certified collection agents and recyclers, ensuring your 
                electronic waste is handled responsibly.
              </p>
              <p className="home-info-description">
                Track every step of the process, from pickup request to final recycling. Join thousands 
                of responsible citizens making a positive environmental impact.
              </p>
              <div className="home-info-stats">
                <div className="home-info-stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Items Recycled</span>
                </div>
                <div className="home-info-stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Active Users</span>
                </div>
                <div className="home-info-stat">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">Satisfaction</span>
                </div>
              </div>
            </div>
            <div className="home-info-image">
              <div className="home-large-image-placeholder">
                <span>Platform Image</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
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

