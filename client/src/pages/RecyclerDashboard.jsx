import { useEffect, useState } from 'react';
import api from '../api';
import './RecyclerDashboard.css';

function RecyclerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [method, setMethod] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/recycler/requests');
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

  const handleRecycle = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select a request first');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.put(`/recycler/recycle/${selectedId}`, {
        recyclingMethod: method,
        remarks,
      });
      setMethod('');
      setRemarks('');
      setSelectedId('');
      setSuccess('E-waste marked as recycled successfully!');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark as recycled');
    } finally {
      setSubmitting(false);
    }
  };

  const computeSummary = () => {
    const incoming = requests.filter((r) => r.status === 'SentToRecycler').length;
    const recycled = requests.filter((r) => r.status === 'Recycled').length;
    const totalProcessed = recycled;
    return { incoming, recycled, totalProcessed };
  };

  const summary = computeSummary();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'incoming', label: 'Incoming E-Waste' },
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
                  <div className="stat-number">{summary.incoming}</div>
                  <div className="stat-label">
                    <span className="status-badge status-SentToRecycler">Incoming</span>
                  </div>
                </div>
                <div className="stat-card-modern">
                  <div className="stat-number">{summary.recycled}</div>
                  <div className="stat-label">
                    <span className="status-badge status-Recycled">Recycled</span>
                  </div>
                </div>
                <div className="stat-card-modern">
                  <div className="stat-number">{summary.totalProcessed}</div>
                  <div className="stat-label">
                    <span className="status-badge status-Collected">Total Processed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Incoming E-Waste Tab */}
        {activeTab === 'incoming' && (
          <div className="content-card">
            <h2 className="content-title">Incoming E-Waste Requests</h2>
            
            {loading ? (
              <div className="loading">Loading incoming e-waste...</div>
            ) : summary.incoming === 0 ? (
              <p className="empty-text">No incoming e-waste waiting for recycling.</p>
            ) : (
              <>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Date</th>
                        <th>Address</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests
                        .filter((r) => r.status === 'SentToRecycler')
                        .map((r) => (
                          <tr key={r._id}>
                            <td>
                              <input
                                type="radio"
                                name="selected"
                                value={r._id}
                                checked={selectedId === r._id}
                                onChange={() => setSelectedId(r._id)}
                              />
                            </td>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td>{r.pickupAddress}</td>
                            <td>{r.items?.[0]?.description || 'N/A'}</td>
                            <td>{r.items?.[0]?.quantity || 0}</td>
                            <td>
                              <span className={`status-badge status-${r.status}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Mark as Recycled Form */}
                <div className="recycle-form-section">
                  <h3 className="recycle-form-title">Mark Selected as Recycled</h3>
                  <form onSubmit={handleRecycle} className="recycle-form">
                    <div className="form-field">
                      <label className="field-label">Recycling Method</label>
                      <input
                        type="text"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        required
                        placeholder="e.g., Material recovery"
                        className="field-input"
                      />
                    </div>
                    <div className="form-field">
                      <label className="field-label">Remarks</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Additional notes about the recycling process"
                        className="field-textarea"
                        rows="3"
                      />
                    </div>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={!selectedId || submitting}
                    >
                      {submitting ? 'Processing...' : 'Mark Recycled'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecyclerDashboard;
