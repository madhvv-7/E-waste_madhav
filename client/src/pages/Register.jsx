import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    address: '',
    phone: '',
  });

  // Show/hide password states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors state (inline errors for each field)
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const [error, setError] = useState(''); // General error message
  const [success, setSuccess] = useState(''); // Success message for pending accounts
  const [loading, setLoading] = useState(false);

  /**
   * Frontend validation functions
   */

  // Validate email format: must contain @ and proper domain
  const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email must be in valid format (e.g., user@example.com)';
    }
    const parts = email.split('@');
    if (parts.length !== 2 || !parts[1].includes('.')) {
      return 'Email must contain a valid domain (e.g., gmail.com, mail.com)';
    }
    const domainParts = parts[1].split('.');
    if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
      return 'Email domain must be valid (e.g., gmail.com, mail.com)';
    }
    return '';
  };

  // Validate phone: exactly 10 digits, only numbers
  const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) {
      return ''; // Phone is optional
    }
    // Remove whitespace for validation
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^\d+$/.test(cleanPhone)) {
      return 'Phone number must contain only digits';
    }
    if (cleanPhone.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  // Validate password: minimum 8 characters
  const validatePassword = (password) => {
    if (!password || password.length === 0) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return '';
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {
      name: form.name.trim() === '' ? 'Name is required' : '',
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword: '',
      phone: validatePhone(form.phone),
    };

    // Validate confirm password
    if (!form.confirmPassword || form.confirmPassword.length === 0) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Password and confirm password do not match';
    }

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((err) => err !== '');
  };

  // Handle input change - preserve user input, clear errors on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Preserve user input (all fields)
    setForm({ ...form, [name]: value });

    // Clear general errors on any input change
    if (error) setError('');
    if (success) setSuccess('');

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Real-time validation for phone (only digits allowed)
    if (name === 'phone') {
      // Remove non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly !== value) {
        setForm({ ...form, [name]: digitsOnly });
      }
    }
  };

  // Handle form blur for validation
  const handleBlur = (fieldName) => {
    // Validate specific field on blur
    if (fieldName === 'email') {
      setErrors({ ...errors, email: validateEmail(form.email) });
    } else if (fieldName === 'phone') {
      setErrors({ ...errors, phone: validatePhone(form.phone) });
    } else if (fieldName === 'password') {
      setErrors({ ...errors, password: validatePassword(form.password) });
    } else if (fieldName === 'confirmPassword') {
      if (!form.confirmPassword || form.confirmPassword.length === 0) {
        setErrors({ ...errors, confirmPassword: 'Please confirm your password' });
      } else if (form.password !== form.confirmPassword) {
        setErrors({ ...errors, confirmPassword: 'Password and confirm password do not match' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate all fields before submission
    if (!validateForm()) {
      return; // Block submission if validation fails
    }

    setLoading(true);
    try {
      const result = await register({
        ...form,
        confirmPassword: form.confirmPassword, // Include confirmPassword for backend
      });

      // Check if account is pending approval
      if (result && result.pending) {
        setSuccess(
          'Registration successful! Your account is pending admin approval. You will be able to login once approved.'
        );
        // Clear form except passwords (preserve other fields per requirement)
        setForm({
          ...form,
          password: '',
          confirmPassword: '',
        });
      } else {
        // User role: immediate activation, redirect to home
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      // Preserve all input except passwords
      setForm({
        ...form,
        password: '',
        confirmPassword: '',
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submit button state
  const isFormValid = () => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      form.password.length >= 8 &&
      form.confirmPassword &&
      form.password === form.confirmPassword &&
      (!form.phone || (form.phone.replace(/\s/g, '').length === 10 && /^\d+$/.test(form.phone.replace(/\s/g, ''))))
    );
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 500, margin: '2rem auto' }}>
        <h2>Register</h2>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              Name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={() => handleBlur('name')}
                required
              />
            </label>
            {errors.name && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                required
              />
            </label>
            {errors.email && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>
              Password (min 8 characters)
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#666',
                    fontSize: '0.875rem',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            {errors.password && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.password}</span>}
          </div>

          <div className="form-group">
            <label>
              Confirm Password
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: '#666',
                    fontSize: '0.875rem',
                  }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            {errors.confirmPassword && (
              <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">User (Citizen)</option>
                <option value="agent">Collection Agent</option>
                <option value="recycler">Recycler</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {(form.role === 'agent' || form.role === 'recycler') && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                Note: {form.role} accounts require admin approval before you can login.
              </p>
            )}
            {(form.role === 'admin' || form.role === 'user') && (
              <p style={{ fontSize: '0.875rem', color: '#27ae60', marginTop: '0.25rem' }}>
                {form.role === 'admin' ? 'Admin' : 'User'} accounts are activated immediately after registration.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>
              Address
              <input type="text" name="address" value={form.address} onChange={handleChange} />
            </label>
          </div>

          <div className="form-group">
            <label>
              Phone (10 digits)
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                placeholder="1234567890"
                maxLength={10}
              />
            </label>
            {errors.phone && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.phone}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isFormValid()}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
