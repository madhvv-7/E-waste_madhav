import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import './UserDashboard.css';

function UserDashboard() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [pickupAddress, setPickupAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchRequests = async () => {
    try {
      setFetchLoading(true);
      const res = await api.get('/pickup/my-requests');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load requests');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileError('');
    setProfileSuccess('');
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    const phone = (profileForm.phone || '').trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      setProfileError('Phone must be exactly 10 digits');
      return;
    }
    if (!profileForm.name?.trim()) {
      setProfileError('Full name is required');
      return;
    }
    if (!profileForm.email?.trim()) {
      setProfileError('Email is required');
      return;
    }
    updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim().toLowerCase(),
      phone: phone || undefined,
      address: (profileForm.address || '').trim() || undefined,
    });
    setProfileSuccess('Profile updated successfully.');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await api.put('/auth/change-password', passwordForm);
      setPasswordSuccess(res.data.message || 'Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Could not change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/pickup/request', {
        pickupAddress,
        items: [{ description: itemDescription, quantity: Number(quantity) }],
      });
      setPickupAddress('');
      setItemDescription('');
      setQuantity(1);
      setSuccess('Pickup request created successfully!');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'pickup', label: 'Pickup Request' },
    { id: 'requests', label: 'My Requests' },
  ];

  return (
    <div className="dashboard-page">
      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <div className="dashboard-tabs-inner">
          <nav className="tabs-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {/* Pickup Request Tab */}
        {activeTab === 'pickup' && (
          <div className="content-card">
            <h2 className="content-title">Create Pickup Request</h2>
            
            {error && <div className="message message-error">{error}</div>}
            {success && <div className="message message-success">{success}</div>}
            
            <form onSubmit={handleSubmit} className="pickup-form">
              <div className="form-field">
                <label className="field-label">Pickup Address</label>
                <textarea
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  required
                  placeholder="Enter your full address"
                  rows="3"
                  className="field-textarea"
                />
              </div>
              <div className="form-row">
                <div className="form-field flex-2">
                  <label className="field-label">Item Description</label>
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                    placeholder="e.g., Old Laptop, Mobile Phone"
                    className="field-input"
                  />
                </div>
                <div className="form-field flex-1">
                  <label className="field-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="field-input"
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && (
          <div className="content-card">
            <h2 className="content-title">My Requests</h2>
            
            {fetchLoading ? (
              <div className="loading">Loading requests...</div>
            ) : requests.length === 0 ? (
              <p className="empty-text">No requests yet. Create your first pickup request!</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Created At</th>
                      <th>Address</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td>{new Date(r.createdAt).toLocaleString()}</td>
                        <td>{r.pickupAddress}</td>
                        <td>{r.items?.[0]?.description || 'N/A'}</td>
                        <td>{r.items?.[0]?.quantity || 0}</td>
                        <td>
                          <span className={getStatusBadgeClass(r.status)}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-container">
            {/* Avatar Header */}
            <div className="content-card profile-header-card">
              <div className="profile-avatar">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <h2 className="profile-avatar-name">{user?.name || 'User'}</h2>
              <span className="profile-role-badge">{user?.role || 'user'}</span>
            </div>

            {/* Profile Information */}
            <div className="content-card profile-info-card">
              {profileError && <div className="message message-error">{profileError}</div>}
              {profileSuccess && <div className="message message-success">{profileSuccess}</div>}
              <div className="profile-section-heading">
                <span className="profile-section-icon">👤</span>
                <div>
                  <h3>Profile Information</h3>
                  <p>Manage your personal details</p>
                </div>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-grid">
                  <div className="form-field">
                    <label className="field-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="Your full name"
                      className="field-input"
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                      placeholder="you@example.com"
                      className="field-input"
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Phone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="10-digit number"
                      className="field-input"
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">Address</label>
                    <textarea
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileChange}
                      placeholder="Your address"
                      rows="2"
                      className="field-textarea"
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn">
                  Save Changes
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="content-card profile-password-card">
              {passwordError && <div className="message message-error">{passwordError}</div>}
              {passwordSuccess && <div className="message message-success">{passwordSuccess}</div>}
              <div className="profile-section-heading">
                <span className="profile-section-icon">🔒</span>
                <div>
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="profile-form-grid">
                  <div className="form-field">
                    <label className="field-label">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="field-input"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="field-label">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 8 characters"
                      className="field-input"
                      required
                    />
                  </div>
                  <div className="form-field profile-form-full">
                    <label className="field-label">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmNewPassword"
                      value={passwordForm.confirmNewPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      className="field-input"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-btn" disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
