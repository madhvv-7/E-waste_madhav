import { useEffect, useState } from 'react';
import api from '../api';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState(null);
  const [agentId, setAgentId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [reqRes, repRes] = await Promise.all([
        api.get('/admin/requests'),
        api.get('/admin/reports'),
      ]);
      setRequests(reqRes.data);
      setReports(repRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRequestId || !agentId) return;
    try {
      await api.put(`/admin/assign/${selectedRequestId}`, { agentId });
      setAgentId('');
      setSelectedRequestId('');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not assign agent');
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2>Admin Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>System Reports</h3>
      {reports ? (
        <ul>
          <li>Total Requests: {reports.totalRequests}</li>
          <li>
            Status Counts:
            <ul>
              {reports.statusCounts.map((s) => (
                <li key={s._id}>
                  {s._id}: {s.count}
                </li>
              ))}
            </ul>
          </li>
          <li>Total Users: {reports.totalUsers}</li>
          <li>Total Agents: {reports.totalAgents}</li>
          <li>Total Recyclers: {reports.totalRecyclers}</li>
          <li>Recycling Records: {reports.recyclingRecords}</li>
        </ul>
      ) : (
        <p>No report data yet.</p>
      )}

      <h3 style={{ marginTop: '2rem' }}>All Pickup Requests</h3>
      {requests.length === 0 ? (
        <p>No pickup requests found.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Select</th>
              <th>Created At</th>
              <th>User</th>
              <th>Address</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Assigned Agent</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r._id}>
                <td>
                  <input
                    type="radio"
                    name="request"
                    value={r._id}
                    checked={selectedRequestId === r._id}
                    onChange={() => setSelectedRequestId(r._id)}
                  />
                </td>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td>{r.userId?.name}</td>
                <td>{r.pickupAddress}</td>
                <td>{r.items?.[0]?.description}</td>
                <td>{r.items?.[0]?.quantity}</td>
                <td>{r.status}</td>
                <td>{r.assignedAgentId?.name || 'Not assigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: '1.5rem' }}>Assign Agent to Selected Request</h3>
      <form onSubmit={handleAssign} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Agent User ID
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </label>
        </div>
        <button type="submit" disabled={!selectedRequestId || !agentId}>
          Assign Agent
        </button>
      </form>
    </div>
  );
}

export default AdminDashboard;


