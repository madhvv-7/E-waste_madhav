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

  // Calculate status counts from existing requests data
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

  return (
    <div className="container">
      <div className="card">
        <h2>Collection Agent Dashboard</h2>
        <p>View and manage your assigned pickup requests</p>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
      </div>

      {/* Summary Cards Section */}
      {!loading && (
        <div className="card">
          <h3>Request Summary</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{statusCounts.Requested}</h3>
              <p>
                <span className={getStatusBadgeClass('Requested')}>
                  Requested
                </span>
              </p>
            </div>
            <div className="stat-card">
              <h3>{statusCounts.Collected}</h3>
              <p>
                <span className={getStatusBadgeClass('Collected')}>
                  Collected
                </span>
              </p>
            </div>
            <div className="stat-card">
              <h3>{statusCounts.SentToRecycler}</h3>
              <p>
                <span className={getStatusBadgeClass('SentToRecycler')}>
                  Sent to Recycler
                </span>
              </p>
            </div>
            <div className="stat-card">
              <h3>{statusCounts.Recycled}</h3>
              <p>
                <span className={getStatusBadgeClass('Recycled')}>
                  Recycled
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Assigned Pickup Requests</h3>
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
