import { useEffect, useState } from 'react';
import api from '../api';

function UserDashboard() {
  const [pickupAddress, setPickupAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await api.get('/pickup/my-requests');
      setRequests(res.data);
    } catch {
      // Keep it simple for now
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/pickup/request', {
        pickupAddress,
        items: [{ description: itemDescription, quantity: Number(quantity) }],
      });
      setPickupAddress('');
      setItemDescription('');
      setQuantity(1);
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>User Dashboard</h2>
      <h3>Create Pickup Request</h3>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Pickup Address
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Item Description
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      <h3 style={{ marginTop: '2rem' }}>My Requests</h3>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
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
                <td>{r.items?.[0]?.description}</td>
                <td>{r.items?.[0]?.quantity}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserDashboard;


