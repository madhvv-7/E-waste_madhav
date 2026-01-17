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

  return (
    <div className="container">
      <div className="card">
        <h2>Recycler Dashboard</h2>
        <p>View incoming e-waste and mark items as recycled</p>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <p>No incoming e-waste (SentToRecycler status).</p>
        ) : (
          <>
            <h3>Incoming E-Waste</h3>
            <div className="table-container">
              <table>
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
                      <td>{r.items?.[0]?.description || 'N/A'}</td>
                      <td>{r.items?.[0]?.quantity || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Mark Selected as Recycled</h3>
            <form onSubmit={handleRecycle} style={{ maxWidth: 500 }}>
              <div className="form-group">
                <label>
                  Recycling Method
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    required
                    placeholder="e.g., Shredding and material recovery"
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
          </>
        )}
      </div>
    </div>
  );
}

export default RecyclerDashboard;
