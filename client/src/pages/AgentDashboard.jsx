import { useEffect, useState } from 'react';
import api from '../api';
import './AgentDashboard.css';

function AgentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');

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
      </div>
    </div>
  );
}

export default AgentDashboard;
