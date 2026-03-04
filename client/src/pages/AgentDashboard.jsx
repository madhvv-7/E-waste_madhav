import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import './AgentDashboard.css';

function AgentDashboard() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agent/requests');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load requests');
    } finally {
      setLoading(false);
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

  const updateStatus = async (id, action) => {
    setError('');
    setSuccess('');
    setUpdating(id);
    try {
      const url =
        action === 'collect'
          ? `/agent/collect/${id}`
          : `/agent/send-to-recycler/${id}`;
      await api.put(url);
      setSuccess(
        `Request ${action === 'collect' ? 'collected' : 'sent to recycler'} successfully!`
      );
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    } finally {
      setUpdating('');
    }
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  const calculateStatusCounts = () => {
    const statusCounts = {
      Requested: 0,
      Collected: 0,
      SentToRecycler: 0,
      Recycled: 0,
    };

    requests.forEach((request) => {
      if (statusCounts.hasOwnProperty(request.status)) {
        statusCounts[request.status]++;
      }
    });

    return statusCounts;
  };

  const statusCounts = calculateStatusCounts();

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: 'Assigned Requests' },
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
        {error && <div className="message message-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div className="message message-success" style={{ marginBottom: '1rem' }}>{success}</div>}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="content-card">
            <h2 className="content-title">Request Summary</h2>
            
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="stats-grid-modern">
                <div className="stat-card-modern">
                  <div className="stat-number">{statusCounts.Requested}</div>
                  <div className="stat-label">
                    <span className={getStatusBadgeClass('Requested')}>Requested</span>
                  </div>
                </div>
                <div className="stat-card-modern">
                  <div className="stat-number">{statusCounts.Collected}</div>
                  <div className="stat-label">
                    <span className={getStatusBadgeClass('Collected')}>Collected</span>
                  </div>
                </div>
                <div className="stat-card-modern">
                  <div className="stat-number">{statusCounts.SentToRecycler}</div>
                  <div className="stat-label">
                    <span className={getStatusBadgeClass('SentToRecycler')}>Sent to Recycler</span>
                  </div>
                </div>
                <div className="stat-card-modern">
                  <div className="stat-number">{statusCounts.Recycled}</div>
                  <div className="stat-label">
                    <span className={getStatusBadgeClass('Recycled')}>Recycled</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assigned Requests Tab */}
        {activeTab === 'requests' && (
          <div className="content-card">
            <h2 className="content-title">Assigned Pickup Requests</h2>
            
            {loading ? (
              <div className="loading">Loading requests...</div>
            ) : requests.length === 0 ? (
              <p className="empty-text">No assigned requests yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Created At</th>
                      <th>Address</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r._id}>
                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td>{r.pickupAddress}</td>
                        <td>{r.items?.[0]?.description || 'N/A'}</td>
                        <td>{r.items?.[0]?.quantity || 0}</td>
                        <td>
                          <span className={getStatusBadgeClass(r.status)}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => updateStatus(r._id, 'collect')}
                            disabled={r.status !== 'Requested' || updating === r._id}
                            className="action-btn action-btn-collect"
                          >
                            {updating === r._id ? '...' : 'Collect'}
                          </button>
                          <button
                            onClick={() => updateStatus(r._id, 'send')}
                            disabled={r.status !== 'Collected' || updating === r._id}
                            className="action-btn action-btn-send"
                          >
                            {updating === r._id ? '...' : 'Send'}
                          </button>
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
          <div className="content-card">
            <h2 className="content-title">My Profile</h2>
            {profileError && <div className="message message-error">{profileError}</div>}
            {profileSuccess && <div className="message message-success">{profileSuccess}</div>}
            <form onSubmit={handleProfileSubmit} className="pickup-form">
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
                <label className="field-label">Email</label>
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
                <label className="field-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="10 digits"
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
                  rows="3"
                  className="field-textarea"
                />
              </div>
              <button type="submit" className="submit-btn">
                Save Profile
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentDashboard;
