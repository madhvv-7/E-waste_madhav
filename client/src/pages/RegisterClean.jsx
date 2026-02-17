import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './RegisterClean.css';

export default function RegisterClean() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'user', address: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateEmail = (email) => {
    if (!email || email.trim() === '') return 'Email is required';
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return rx.test(email) ? '' : 'Email must be valid';
  };

  const validatePhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 ? '' : 'Phone must be 10 digits';
  };

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    const e = validateEmail(form.email); if (e) errs.email = e;
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    const p = validatePhone(form.phone); if (p) errs.phone = p;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setError(''); setSuccess('');
    setFieldErrors((f) => ({ ...f, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await register({ ...form });
      if (res?.pending) {
        setSuccess('Registered — awaiting admin approval.');
        setForm((s) => ({ ...s, password: '', confirmPassword: '' }));
      } else navigate('/');
    } catch (err) { setError(err?.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="register-page">
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="register-card">
            <div className="row g-0">
              {/* Left Panel */}
              <div className="col-12 col-md-6 order-2 order-md-1">
                <div className="register-left-panel">
                  <div className="register-left-content">
                    <h3 className="fw-bold mb-3">Welcome Back!</h3>
                    <p className="mb-4">
                      Join the E-Waste movement — manage collections and recycle responsibly.
                    </p>
                    <Link to="/" className="btn btn-outline-light rounded-pill register-signin-btn">
                      Sign In
                    </Link>
                  </div>
                  <div className="register-circle register-circle-1"></div>
                  <div className="register-circle register-circle-2"></div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="col-12 col-md-6 order-1 order-md-2">
                <div className="register-form-panel">
                  <h2 className="register-title">Create Account</h2>

                  {error && <div className="alert alert-danger">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <form onSubmit={handleSubmit} noValidate>
                    {/* Name Field */}
                    <div className="register-field-wrapper">
                      <div className={`register-input-group ${fieldErrors.name ? 'has-error' : ''}`}>
                        <span className="register-icon">👤</span>
                        <input
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Full name"
                          className="register-input"
                        />
                      </div>
                      {fieldErrors.name && <div className="register-error">{fieldErrors.name}</div>}
                    </div>

                    {/* Email Field */}
                    <div className="register-field-wrapper">
                      <div className={`register-input-group ${fieldErrors.email ? 'has-error' : ''}`}>
                        <span className="register-icon">📧</span>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="Email"
                          className="register-input"
                        />
                      </div>
                      {fieldErrors.email && <div className="register-error">{fieldErrors.email}</div>}
                    </div>

                    {/* Password Field */}
                    <div className="register-field-wrapper">
                      <div className={`register-input-group ${fieldErrors.password ? 'has-error' : ''}`}>
                        <span className="register-icon">🔒</span>
                        <input
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className="register-input"
                        />
                        <button
                          type="button"
                          className="register-toggle-btn"
                          onClick={() => setShowPassword((s) => !s)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {fieldErrors.password && <div className="register-error">{fieldErrors.password}</div>}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="register-field-wrapper">
                      <div className={`register-input-group ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                        <span className="register-icon">🔒</span>
                        <input
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm Password"
                          className="register-input"
                        />
                        <button
                          type="button"
                          className="register-toggle-btn"
                          onClick={() => setShowConfirmPassword((s) => !s)}
                        >
                          {showConfirmPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {fieldErrors.confirmPassword && <div className="register-error">{fieldErrors.confirmPassword}</div>}
                    </div>

                    {/* Role Select */}
                    <div className="register-field-wrapper">
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="register-select"
                      >
                        <option value="user">User (Citizen)</option>
                        <option value="agent">Collection Agent</option>
                      </select>
                    </div>

                    {/* Agent-specific fields */}
                    {form.role === 'agent' && (
                      <>
                        <div className="register-field-wrapper">
                          <div className={`register-input-group ${fieldErrors.phone ? 'has-error' : ''}`}>
                            <span className="register-icon">📞</span>
                            <input
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              placeholder="Phone (10 digits)"
                              className="register-input"
                            />
                          </div>
                          {fieldErrors.phone && <div className="register-error">{fieldErrors.phone}</div>}
                        </div>

                        <div className="register-field-wrapper">
                          <div className="register-input-group">
                            <span className="register-icon">🏠</span>
                            <input
                              name="address"
                              value={form.address}
                              onChange={handleChange}
                              placeholder="Address"
                              className="register-input"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="register-submit-btn"
                      disabled={loading}
                    >
                      {loading ? 'Registering...' : 'Sign Up'}
                    </button>

                    <div className="register-footer">
                      Already have an account? <Link to="/">Sign in</Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

