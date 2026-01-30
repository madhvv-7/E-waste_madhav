import { useEffect, useState } from 'react';
import api from '../api';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [activeAgents, setActiveAgents] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approving, setApproving] = useState('');
  const [rejecting, setRejecting] = useState('');
  const [deactivating, setDeactivating] = useState('');
  const [reactivating, setReactivating] = useState('');

  // Fetch active agents for dropdown
  const fetchActiveAgents = async () => {
    try {
      console.log('[DEBUG] Fetching active agents from API...');
      const agentsRes = await api.get('/admin/agents');
      console.log('[DEBUG] API Response:', agentsRes);
      console.log('[DEBUG] Agents data:', agentsRes.data);
      console.log('[DEBUG] Agents count:', agentsRes.data?.length || 0);
      console.log('[DEBUG] Agents array:', Array.isArray(agentsRes.data));
      
      if (agentsRes.data && Array.isArray(agentsRes.data)) {
        setActiveAgents(agentsRes.data);
        console.log('[DEBUG] Active agents set in state:', agentsRes.data.length);
      } else {
        console.warn('[DEBUG] Invalid agents data format:', agentsRes.data);
        setActiveAgents([]);
      }
    } catch (err) {
      console.error('[DEBUG] Error loading agents:', err);
      console.error('[DEBUG] Error response:', err.response);
      setActiveAgents([]);
    }
  };

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
      
      // Fetch active agents separately
      await fetchActiveAgents();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Debug: Monitor activeAgents state changes
  useEffect(() => {
    console.log('[DEBUG] activeAgents state changed:', activeAgents);
    console.log('[DEBUG] activeAgents length:', activeAgents.length);
    if (activeAgents.length > 0) {
      console.log('[DEBUG] First agent:', activeAgents[0]);
    }
  }, [activeAgents]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRequestId || !agentId) {
      setError('Please select a request and choose an agent');
      return;
    }

    // Frontend guard: Check if selected request is assignable
    const selectedRequest = requests.find((r) => r._id === selectedRequestId);
    if (selectedRequest) {
      if (selectedRequest.status === 'Recycled') {
        setError('Cannot assign agent to a completed request. This request is read-only.');
        return;
      }
      if (selectedRequest.status !== 'Requested') {
        setError(`Cannot assign agent to a request with status '${selectedRequest.status}'. Only 'Requested' requests can be assigned.`);
        return;
      }
    }

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const res = await api.put(`/admin/assign/${selectedRequestId}`, { agentId });
      setAgentId('');
      setSelectedRequestId('');
      setSuccess(res.data.message || 'Agent assigned successfully!');
      
      // Refresh requests and agents to show updated assignment
      const [reqRes] = await Promise.all([
        api.get('/admin/requests'),
        fetchActiveAgents(),
      ]);
      setRequests(reqRes.data);
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
      
      // Refresh agents list if approved user is an agent
      const approvedUser = allUsers.find((u) => u._id === accountId);
      if (approvedUser && approvedUser.role === 'agent') {
        await fetchActiveAgents();
      }
      
      setSuccess('Account approved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not approve account');
    } finally {
      setApproving('');
    }
  };

  // Reject account: update status to rejected, refresh data immediately
  // Works for pending or active agent/recycler accounts
  const handleRejectAccount = async (accountId) => {
    setError('');
    setSuccess('');
    setRejecting(accountId);
    try {
      await api.put(`/admin/reject-account/${accountId}`);
      
      // Update UI immediately without page refresh
      setPendingAccounts((prev) => prev.filter((acc) => acc._id !== accountId));
      const rejectedUser = allUsers.find((u) => u._id === accountId);
      setAllUsers((prev) =>
        prev.map((user) =>
          user._id === accountId ? { ...user, status: 'rejected' } : user
        )
      );
      
      // Refresh agents list if rejected user is an agent
      if (rejectedUser && rejectedUser.role === 'agent') {
        await fetchActiveAgents();
      }
      
      setSuccess('Account rejected successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reject account');
    } finally {
      setRejecting('');
    }
  };

  // Deactivate account: update status to deactivated, refresh data immediately
  const handleDeactivateAccount = async (accountId) => {
    setError('');
    setSuccess('');
    setDeactivating(accountId);
    try {
      await api.put(`/admin/deactivate-account/${accountId}`);
      
      // Update UI immediately without page refresh
      setAllUsers((prev) =>
        prev.map((user) =>
          user._id === accountId ? { ...user, status: 'deactivated' } : user
        )
      );
      
      // Refresh agents list if deactivated user is an agent
      const deactivatedUser = allUsers.find((u) => u._id === accountId);
      if (deactivatedUser && deactivatedUser.role === 'agent') {
        await fetchActiveAgents();
      }
      
      setSuccess('Account deactivated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not deactivate account');
    } finally {
      setDeactivating('');
    }
  };

  // Reactivate account: update status to active, refresh data immediately
  const handleReactivateAccount = async (accountId) => {
    setError('');
    setSuccess('');
    setReactivating(accountId);
    try {
      await api.put(`/admin/reactivate-account/${accountId}`);
      
      // Update UI immediately without page refresh
      setAllUsers((prev) =>
        prev.map((user) =>
          user._id === accountId ? { ...user, status: 'active' } : user
        )
      );
      
      // Refresh agents list if reactivated user is an agent
      const reactivatedUser = allUsers.find((u) => u._id === accountId);
      if (reactivatedUser && reactivatedUser.role === 'agent') {
        await fetchActiveAgents();
      }
      
      setSuccess('Account reactivated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reactivate account');
    } finally {
      setReactivating('');
    }
  };

  const getStatusBadgeClass = (status) => {
    // User account statuses
    if (status === 'pending') return 'status-badge status-pending';
    if (status === 'active') return 'status-badge status-active';
    if (status === 'rejected') return 'status-badge status-rejected';
    if (status === 'deactivated') return 'status-badge status-deactivated';
    // Pickup request statuses (fallback)
    if (status === 'Requested') return 'status-badge status-Requested';
    if (status === 'Collected') return 'status-badge status-Collected';
    if (status === 'SentToRecycler') return 'status-badge status-SentToRecycler';
    if (status === 'Recycled') return 'status-badge status-Recycled';
    return 'status-badge';
  };

  // Determine which action buttons to show based on role and status
  const getActionButtons = (user) => {
    const isProcessing = approving === user._id || rejecting === user._id || 
                        deactivating === user._id || reactivating === user._id;
    const buttons = [];

    // Agent and Recycler: Show approve/reject/deactivate/reactivate based on status
    if (user.role === 'agent' || user.role === 'recycler') {
      if (user.status === 'pending') {
        // Pending: Show approve and reject
        buttons.push(
          <button
            key="approve"
            onClick={() => handleApproveAccount(user._id)}
            className="btn btn-success"
            disabled={isProcessing}
            style={{ marginRight: '0.5rem' }}
          >
            {approving === user._id ? 'Approving...' : 'Approve'}
          </button>
        );
        buttons.push(
          <button
            key="reject"
            onClick={() => handleRejectAccount(user._id)}
            className="btn btn-warning"
            disabled={isProcessing}
          >
            {rejecting === user._id ? 'Rejecting...' : 'Reject'}
          </button>
        );
      } else if (user.status === 'active') {
        buttons.push(
          <button
            key="deactivate"
            onClick={() => handleDeactivateAccount(user._id)}
            className="btn btn-warning"
            disabled={isProcessing}
          >
            {deactivating === user._id ? 'Deactivating...' : 'Deactivate'}
          </button>
        );
      } else if (user.status === 'rejected' || user.status === 'deactivated') {
        // Rejected or Deactivated: Show reactivate
        buttons.push(
          <button
            key="reactivate"
            onClick={() => handleReactivateAccount(user._id)}
            className="btn btn-success"
            disabled={isProcessing}
          >
            {reactivating === user._id ? 'Reactivating...' : 'Reactivate'}
          </button>
        );
      }
    } else if (user.role === 'user' || user.role === 'admin') {
      // User and Admin: Only show deactivate/reactivate (no approval actions)
      if (user.status === 'active') {
        buttons.push(
          <button
            key="deactivate"
            onClick={() => handleDeactivateAccount(user._id)}
            className="btn btn-warning"
            disabled={isProcessing}
          >
            {deactivating === user._id ? 'Deactivating...' : 'Deactivate'}
          </button>
        );
      } else if (user.status === 'deactivated') {
        buttons.push(
          <button
            key="reactivate"
            onClick={() => handleReactivateAccount(user._id)}
            className="btn btn-success"
            disabled={isProcessing}
          >
            {reactivating === user._id ? 'Reactivating...' : 'Reactivate'}
          </button>
        );
      }
    }

    return buttons.length > 0 ? buttons : <span style={{ color: '#999' }}>No actions</span>;
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
                      <th>Actions</th>
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
                        <td>{getActionButtons(user)}</td>
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
                  <div className="stats-grid">
                    {reports.statusCounts.map((s) => (
                      <div key={s._id} className="stat-card">
                        <h3>{s.count}</h3>
                        <p>
                          <span className={getStatusBadgeClass(s._id)}>
                            {s._id}
                          </span>
                        </p>
                      </div>
                    ))}
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
                    {requests.map((r) => {
                      // Determine if request is assignable (only 'Requested' status)
                      const isAssignable = r.status === 'Requested';
                      // Determine if request is terminal/read-only ('Recycled' status)
                      const isTerminal = r.status === 'Recycled';
                      const isDisabled = isTerminal || !isAssignable;

                      return (
                        <tr key={r._id} style={isDisabled ? { opacity: 0.6 } : {}}>
                          <td>
                            <input
                              type="radio"
                              name="request"
                              value={r._id}
                              checked={selectedRequestId === r._id}
                              onChange={() => {
                                // Only allow selection of assignable requests
                                if (isAssignable) {
                                  setSelectedRequestId(r._id);
                                } else {
                                  // Clear selection if trying to select non-assignable request
                                  setSelectedRequestId('');
                                  setError(
                                    isTerminal
                                      ? 'Cannot select completed request. Only "Requested" status requests can be assigned.'
                                      : `Cannot select request with status "${r.status}". Only "Requested" status requests can be assigned.`
                                  );
                                }
                              }}
                              disabled={isDisabled}
                              title={
                                isTerminal
                                  ? 'This request is completed and cannot be modified'
                                  : !isAssignable
                                  ? 'This request cannot be assigned in its current status'
                                  : 'Select this request to assign an agent'
                              }
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
                            {isTerminal && (
                              <span
                                style={{
                                  marginLeft: '0.5rem',
                                  fontSize: '0.75rem',
                                  color: '#666',
                                }}
                              >
                                
                              </span>
                            )}
                          </td>
                          <td>{r.assignedAgentId?.name || 'Not assigned'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <h3>Assign Agent to Selected Request</h3>
            {(() => {
              // Check if selected request is assignable
              const selectedRequest = requests.find((r) => r._id === selectedRequestId);
              const isSelectedTerminal = selectedRequest?.status === 'Recycled';
              const isSelectedAssignable = selectedRequest?.status === 'Requested';
              const isFormDisabled = !selectedRequestId || isSelectedTerminal || !isSelectedAssignable || submitting || activeAgents.length === 0;

              return (
                <form onSubmit={handleAssign} style={{ maxWidth: 500 }}>
                  {selectedRequestId && (
                    <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <strong>Selected Request:</strong> {selectedRequest?.items?.[0]?.description || 'N/A'} - Status: {selectedRequest?.status}
                      {isSelectedTerminal && (
                        <p style={{ marginTop: '0.5rem', color: '#721c24', fontSize: '0.875rem' }}>
                          ⚠️ This request is completed and cannot be assigned. Only 'Requested' status requests can be assigned.
                        </p>
                      )}
                      {selectedRequest && !isSelectedTerminal && !isSelectedAssignable && (
                        <p style={{ marginTop: '0.5rem', color: '#856404', fontSize: '0.875rem' }}>
                          ⚠️ This request cannot be assigned in its current status. Only 'Requested' status requests can be assigned.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="form-group">
                    <label>
                      Select Agent
                      <select
                        value={agentId}
                        onChange={(e) => setAgentId(e.target.value)}
                        required
                        disabled={isFormDisabled}
                      >
                        <option value="">
                          {activeAgents.length === 0
                            ? 'No active agents available'
                            : '-- Select an agent --'}
                        </option>
                        {activeAgents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} ({agent.email})
                          </option>
                        ))}
                      </select>
                    </label>
                    {activeAgents.length === 0 && (
                      <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                        No active agents available. Approve agent accounts to make them available for assignment.
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isFormDisabled}
                  >
                    {submitting ? 'Assigning...' : 'Assign Agent'}
                  </button>
                </form>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
