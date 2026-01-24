import { useEffect, useState } from 'react';
import api from '../api';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState('');
  const [rejecting, setRejecting] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, repRes, usersRes, pendingRes] = await Promise.all([
        api.get('/admin/requests'),
        api.get('/admin/reports'),
        api.get('/admin/users'),
        api.get('/admin/pending-accounts'),
      ]);
      setRequests(reqRes.data);
      setReports(repRes.data);
      setAllUsers(usersRes.data);
      setPendingAccounts(pendingRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRequestId || !agentId) {
      setError('Please select a request and enter agent ID');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await api.put(`/admin/assign/${selectedRequestId}`, { agentId });
      setAgentId('');
      setSelectedRequestId('');
      setSuccess('Agent assigned successfully!');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not assign agent');
    } finally {
      setSubmitting(false);
    }
  };

  // Approve account: update status to active, refresh data immediately
  const handleApproveAccount = async (accountId) => {
    setError('');
    setSuccess('');
    setApproving(accountId);
    try {
      await api.put(`/admin/approve-account/${accountId}`);
      
      // Update UI immediately without page refresh
      setPendingAccounts((prev) => prev.filter((acc) => acc._id !== accountId));
      setAllUsers((prev) =>
        prev.map((user) =>
          user._id === accountId ? { ...user, status: 'active' } : user
        )
      );
      
      setSuccess('Account approved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve account');
    } finally {
      setApproving('');
    }
  };

  // Reject account: update status to rejected, refresh data immediately
  const handleRejectAccount = async (accountId) => {
    setError('');
    setSuccess('');
    setRejecting(accountId);
    try {
      await api.put(`/admin/reject-account/${accountId}`);
      
      // Update UI immediately without page refresh
      setPendingAccounts((prev) => prev.filter((acc) => acc._id !== accountId));
      setAllUsers((prev) =>
        prev.map((user) =>
          user._id === accountId ? { ...user, status: 'rejected' } : user
        )
      );
      
      setSuccess('Account rejected successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject account');
    } finally {
      setRejecting('');
    }
  };

  const getStatusBadgeClass = (status) => {
    // User account statuses
    if (status === 'pending') return 'status-badge status-pending';
    if (status === 'active') return 'status-badge status-active';
    if (status === 'rejected') return 'status-badge status-rejected';
    // Pickup request statuses (fallback)
    if (status === 'Requested') return 'status-badge status-Requested';
    if (status === 'Collected') return 'status-badge status-Collected';
    if (status === 'SentToRecycler') return 'status-badge status-SentToRecycler';
    if (status === 'Recycled') return 'status-badge status-Recycled';
    return 'status-badge';
  };

  const getRoleBadgeClass = (role) => {
    const roleColors = {
      user: 'status-badge status-Requested',
      agent: 'status-badge status-Collected',
      recycler: 'status-badge status-SentToRecycler',
      admin: 'status-badge status-Recycled',
    };
    return roleColors[role] || 'status-badge';
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Admin Dashboard</h2>
        <p>Monitor system flow and manage users and requests</p>
        {error && <div className="message message-error">{error}</div>}
        {success && <div className="message message-success">{success}</div>}
      </div>

      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          {/* Pending Account Approvals Section - Only agent and recycler */}
          <div className="card">
            <h3>Pending Account Approvals</h3>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
              Collection agents and recyclers require admin approval before they can login.
            </p>
            {pendingAccounts.length === 0 ? (
              <p>No pending accounts waiting for approval.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Registered At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAccounts.map((account) => (
                      <tr key={account._id}>
                        <td>{account.name}</td>
                        <td>{account.email}</td>
                        <td>
                          <span className={getRoleBadgeClass(account.role)}>
                            {account.role}
                          </span>
                        </td>
                        <td>{account.phone || 'N/A'}</td>
                        <td>{account.address || 'N/A'}</td>
                        <td>{new Date(account.createdAt).toLocaleString()}</td>
                        <td>
                          <button
                            onClick={() => handleApproveAccount(account._id)}
                            className="btn btn-success"
                            disabled={approving === account._id || rejecting === account._id}
                            style={{ marginRight: '0.5rem' }}
                          >
                            {approving === account._id ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleRejectAccount(account._id)}
                            className="btn btn-warning"
                            disabled={approving === account._id || rejecting === account._id}
                          >
                            {rejecting === account._id ? 'Rejecting...' : 'Reject'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* All System Users Section */}
          <div className="card">
            <h3>All System Users</h3>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
              View all registered users. Normal users are active immediately and do not require approval.
            </p>
            {allUsers.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Registered At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={getRoleBadgeClass(user.role)}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(user.status)}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.phone || 'N/A'}</td>
                        <td>{user.address || 'N/A'}</td>
                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {reports && (
            <div className="card">
              <h3>System Reports</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{reports.totalRequests}</h3>
                  <p>Total Requests</p>
                </div>
                <div className="stat-card">
                  <h3>{reports.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
                <div className="stat-card">
                  <h3>{reports.totalAgents}</h3>
                  <p>Total Agents</p>
                </div>
                <div className="stat-card">
                  <h3>{reports.totalRecyclers}</h3>
                  <p>Total Recyclers</p>
                </div>
                <div className="stat-card">
                  <h3>{reports.recyclingRecords}</h3>
                  <p>Recycling Records</p>
                </div>
              </div>

              {reports.statusCounts && reports.statusCounts.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <h3>Status Breakdown</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.statusCounts.map((s) => (
                          <tr key={s._id}>
                            <td>
                              <span className={getStatusBadgeClass(s._id)}>
                                {s._id}
                              </span>
                            </td>
                            <td>{s.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3>All Pickup Requests</h3>
            {requests.length === 0 ? (
              <p>No pickup requests found.</p>
            ) : (
              <div className="table-container">
                <table>
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
                        <td>{r.userId?.name || 'N/A'}</td>
                        <td>{r.pickupAddress}</td>
                        <td>{r.items?.[0]?.description || 'N/A'}</td>
                        <td>{r.items?.[0]?.quantity || 0}</td>
                        <td>
                          <span className={getStatusBadgeClass(r.status)}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.assignedAgentId?.name || 'Not assigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3>Assign Agent to Selected Request</h3>
            <form onSubmit={handleAssign} style={{ maxWidth: 500 }}>
              <div className="form-group">
                <label>
                  Agent User ID
                  <input
                    type="text"
                    value={agentId}
                    onChange={(e) => setAgentId(e.target.value)}
                    placeholder="Enter agent's user ID"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedRequestId || !agentId || submitting}
              >
                {submitting ? 'Assigning...' : 'Assign Agent'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
