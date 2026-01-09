import { useEffect, useState } from 'react';
import api from '../api';

function RecyclerDashboard() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedId, setSelectedId] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/recycler/requests');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRecycle = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    try {
      await api.put(`/recycler/recycle/${selectedId}`, {
        recyclingMethod: method,
        remarks,
      });
      setMethod('');
      setRemarks('');
      setSelectedId('');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark as recycled');
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Recycler Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {requests.length === 0 ? (
        <p>No incoming e-waste (SentToRecycler).</p>
      ) : (
        <>
          <table
            border="1"
            cellPadding="8"
            style={{ borderCollapse: 'collapse', marginBottom: '1rem' }}
          >
            <thead>
              <tr>
                <th>Select</th>
                <th>Created At</th>
                <th>Address</th>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
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
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.pickupAddress}</td>
                  <td>{r.items?.[0]?.description}</td>
                  <td>{r.items?.[0]?.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Mark Selected as Recycled</h3>
          <form onSubmit={handleRecycle} style={{ maxWidth: 500 }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label>
                Recycling Method
                <input
                  type="text"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </label>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label>
                Remarks
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </label>
            </div>
            <button type="submit" disabled={!selectedId}>
              Mark Recycled
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default RecyclerDashboard;


