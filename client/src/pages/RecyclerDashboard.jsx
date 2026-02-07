import { useEffect, useState } from 'react';
import api from '../api';

function RecyclerDashboard() {
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

  // Helper to compute recycler-specific summary counts from loaded requests
  const computeSummary = () => {
    const incoming = requests.filter((r) => r.status === 'SentToRecycler').length;
    const recycled = requests.filter((r) => r.status === 'Recycled').length;
    // Total processed — here we treat 'Recycled' as processed by recycler
    const totalProcessed = recycled;
    return { incoming, recycled, totalProcessed };
  };

  const summary = computeSummary();

  return (
    <div className="container">
      {/* Header */}
      <div className="card">
        <h2>Recycler Dashboard</h2>
        <p>Manage incoming e-waste and mark items as recycled</p>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
      </div>

      {/* Summary Cards - Incoming, Recycled, Total Processed */}
      {!loading && (
        <div className="card">
          <h3>Request Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{summary.incoming}</h3>
              <p>
                <span className="status-badge status-SentToRecycler">Incoming</span>
              </p>
            </div>

            <div className="stat-card">
              <h3>{summary.recycled}</h3>
              <p>
                <span className="status-badge status-Recycled">Recycled</span>
              </p>
            </div>

            <div className="stat-card">
              <h3>{summary.totalProcessed}</h3>
              <p>
                <span className="status-badge status-Requested">Total Processed</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Incoming E-Waste Requests Table */}
      <div className="card">
        <h3>Incoming E-Waste Requests</h3>
        {loading ? (
          <div className="loading">Loading incoming e-waste...</div>
        ) : (
          <>
            {summary.incoming === 0 ? (
              <p>No incoming e-waste waiting for recycling. Check back later.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Created At</th>
                      <th>Address</th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Current Status</th>
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
                              title="Select request to mark as recycled"
                            />
                          </td>
                          <td>{new Date(r.createdAt).toLocaleString()}</td>
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
            )}

            {/* Mark as Recycled Form */}
            <div style={{ marginTop: '1.25rem' }}>
              <h3>Mark Selected as Recycled</h3>
              <form onSubmit={handleRecycle} style={{ maxWidth: 500 }}>
                <div className="form-group">
                  <label>
                    Recycling Method
                    <input
                      type="text"
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      required
                      placeholder="e.g., Material recovery"
                    />
                  </label>
                </div>
                <div className="form-group">
                  <label>
                    Remarks
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Additional notes about the recycling process"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={!selectedId || submitting}
                >
                  {submitting ? 'Processing...' : 'Mark Recycled'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RecyclerDashboard;
