import { useEffect, useState } from 'react';
import api from '../api';

function AgentDashboard() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/agent/requests');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, action) => {
    setError('');
    try {
      const url =
        action === 'collect'
          ? `/agent/collect/${id}`
          : `/agent/send-to-recycler/${id}`;
      await api.put(url);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update status');
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Agent Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {requests.length === 0 ? (
        <p>No assigned requests.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
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
                <td>{r.items?.[0]?.description}</td>
                <td>{r.items?.[0]?.quantity}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    onClick={() => updateStatus(r._id, 'collect')}
                    disabled={r.status !== 'Requested'}
                  >
                    Mark Collected
                  </button>{' '}
                  <button
                    onClick={() => updateStatus(r._id, 'send')}
                    disabled={r.status !== 'Collected'}
                  >
                    Send to Recycler
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AgentDashboard;


