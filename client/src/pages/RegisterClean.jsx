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
    if (!form.name.trim()) { setError('Name is required'); return false; }
    const e = validateEmail(form.email); if (e) { setError(e); return false; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return false; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return false; }
    const p = validatePhone(form.phone); if (p) { setError(p); return false; }
    return true;
  };

  const handleChange = (e) => { const { name, value } = e.target; setForm((s) => ({ ...s, [name]: value })); setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await register({ ...form });
      if (res?.pending) { setSuccess('Registered — awaiting admin approval.'); setForm((s) => ({ ...s, password: '', confirmPassword: '' })); }
      else navigate('/');
    } catch (err) { setError(err?.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="mb-3">Create Your Account</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3"><input name="name" value={form.name} onChange={handleChange} className="form-control" placeholder="Full name" /></div>
                <div className="mb-3"><input name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="Email" /></div>
                <div className="mb-3 d-flex">
                  <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} className="form-control" placeholder="Password" />
                  <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => setShowPassword((s) => !s)}>{showPassword ? 'Hide' : 'Show'}</button>
                </div>
                <div className="mb-3 d-flex">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} className="form-control" placeholder="Confirm Password" />
                  <button type="button" className="btn btn-outline-secondary ms-2" onClick={() => setShowConfirmPassword((s) => !s)}>{showConfirmPassword ? 'Hide' : 'Show'}</button>
                </div>
                <div className="mb-3">
                  <select name="role" value={form.role} onChange={handleChange} className="form-select">
                    <option value="user">User (Citizen)</option>
                    <option value="agent">Collection Agent</option>
                  </select>
                </div>
                {form.role === 'agent' && (
                  <>
                    <div className="mb-3"><input name="phone" value={form.phone} onChange={handleChange} className="form-control" placeholder="Phone (10 digits)" /></div>
                    <div className="mb-3"><input name="address" value={form.address} onChange={handleChange} className="form-control" placeholder="Address" /></div>
                  </>
                )}
                <div className="d-grid"><button className="btn btn-success" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button></div>
                <div className="mt-3 text-center"><small>Already have an account? <Link to="/login">Login</Link></small></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

