import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

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

  const leftStyle = {
    background: 'linear-gradient(135deg,#0b6623,#2aa38a)',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  };
  const circleStyle = (size, top, left, opacity) => ({
    width: size, height: size, borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
    position: 'absolute', top, left, opacity,
  });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-center">
        <div className="card rounded-4 shadow-lg" style={{ maxWidth: 980, width: '100%', overflow: 'hidden' }}>
          <div className="row g-0 d-flex align-items-stretch">
            {/* Left Panel - visual, order second on mobile */}
            <div className="col-12 col-md-6 order-2 order-md-1" style={leftStyle}>
              <div style={{ padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 className="fw-bold">Welcome Back!</h3>
                  <p className="mb-4" style={{ opacity: 0.95 }}>
                    Join the E-Waste movement — manage collections and recycle responsibly.
                  </p>
                  <Link to="/login" className="btn btn-outline-light rounded-pill" style={{ padding: '.6rem 1.2rem', borderWidth: 2 }}>
                    Sign In
                  </Link>
                </div>
                <div style={circleStyle(160, '-20px', '-40px', 0.06)} />
                <div style={circleStyle(100, '60%', '70%', 0.05)} />
              </div>
            </div>

            {/* Right Panel - form, appears first on mobile */}
            <div className="col-12 col-md-6 order-1 order-md-2">
              <div className="p-4 p-md-5">
                <h2 className="mb-3">Create Account</h2>
                

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3 input-group input-group-lg">
                    <span className="input-group-text bg-white">👤</span>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" className={`form-control rounded-pill bg-light ${fieldErrors.name ? 'is-invalid' : ''}`} />
                    {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
                  </div>

                  <div className="mb-3 input-group input-group-lg">
                    <span className="input-group-text bg-white">📧</span>
                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className={`form-control rounded-pill bg-light ${fieldErrors.email ? 'is-invalid' : ''}`} type="email" />
                    {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
                  </div>

                  <div className="mb-3 input-group input-group-lg">
                    <span className="input-group-text bg-white">🔒</span>
                    <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className={`form-control rounded-pill bg-light ${fieldErrors.password ? 'is-invalid' : ''}`} type={showPassword ? 'text' : 'password'} />
                    <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
                    {fieldErrors.password && <div className="invalid-feedback d-block">{fieldErrors.password}</div>}
                  </div>

                  <div className="mb-3 input-group input-group-lg">
                    <span className="input-group-text bg-white">🔒</span>
                    <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" className={`form-control rounded-pill bg-light ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`} type={showConfirmPassword ? 'text' : 'password'} />
                    <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => setShowConfirmPassword((s) => !s)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                    {fieldErrors.confirmPassword && <div className="invalid-feedback d-block">{fieldErrors.confirmPassword}</div>}
                  </div>

                  <div className="mb-3">
                    <select name="role" value={form.role} onChange={handleChange} className="form-select form-select-lg rounded-pill bg-light">
                      <option value="user">User (Citizen)</option>
                      <option value="agent">Collection Agent</option>
                    </select>
                  </div>

                  {form.role === 'agent' && (
                    <>
                      <div className="mb-3 input-group input-group-lg">
                        <span className="input-group-text bg-white">📞</span>
                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (10 digits)" className={`form-control rounded-pill bg-light ${fieldErrors.phone ? 'is-invalid' : ''}`} />
                        {fieldErrors.phone && <div className="invalid-feedback d-block">{fieldErrors.phone}</div>}
                      </div>
                      <div className="mb-3 input-group input-group-lg">
                        <span className="input-group-text bg-white">🏠</span>
                        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="form-control rounded-pill bg-light" />
                      </div>
                    </>
                  )}

                  <div className="d-grid mt-3">
                    <button className="btn btn-success btn-lg rounded-pill" disabled={loading} style={{ background: 'linear-gradient(90deg,#0b6623,#2aa38a)', border: 'none', transition: 'transform .12s ease' }}>
                      {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                  </div>

                  <div className="mt-3 text-center">
                    <small>Already have an account? <Link to="/login">Sign in</Link></small>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

