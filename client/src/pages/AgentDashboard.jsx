import { useEffect, useState } from 'react';
import api from '../api';

function AgentDashboard() {
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

  return (
    <div className="container">
      <div className="card">
        <h2>Collection Agent Dashboard</h2>
        <p>View and manage your assigned pickup requests</p>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <p>No assigned requests yet.</p>
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
                  <th>Actions</th>
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
                    <td>
                      <button
                        onClick={() => updateStatus(r._id, 'collect')}
                        disabled={r.status !== 'Requested' || updating === r._id}
                        className="btn btn-success"
                        style={{ marginRight: '0.5rem' }}
                      >
                        {updating === r._id ? 'Updating...' : 'Mark Collected'}
                      </button>
                      <button
                        onClick={() => updateStatus(r._id, 'send')}
                        disabled={r.status !== 'Collected' || updating === r._id}
                        className="btn btn-warning"
                      >
                        {updating === r._id ? 'Updating...' : 'Send to Recycler'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentDashboard;
