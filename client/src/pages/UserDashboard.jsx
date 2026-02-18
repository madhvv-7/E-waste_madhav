import { useEffect, useState } from 'react';
import api from '../api';
import './UserDashboard.css';

function UserDashboard() {
  const [activeTab, setActiveTab] = useState('pickup');
  const [pickupAddress, setPickupAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
              <div className="form-group">
                <label>
                  Pickup Address
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    required
                    placeholder="Enter your address"
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Item Description
                  <input
                    type="text"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    required
                    placeholder="e.g., Old Laptop, Mobile Phone"
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
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
      </div>
    </div>
  );
}

export default UserDashboard;
