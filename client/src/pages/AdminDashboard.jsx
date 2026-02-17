import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import AdminLayout from '../components/AdminLayout';

function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [appeals, setAppeals] = useState([]); // User appeals/contact requests
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
  const [appealProcessing, setAppealProcessing] = useState(''); // id of appeal being processed
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

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
      const [reqRes, repRes, usersRes, pendingRes, appealsRes] = await Promise.all([
        api.get('/admin/requests'),
        api.get('/admin/reports'),
        api.get('/admin/users'),
        api.get('/admin/pending-accounts'),
        api.get('/appeals'),
      ]);
      setRequests(reqRes.data);
      setReports(repRes.data);
      setAllUsers(usersRes.data);
      setPendingAccounts(pendingRes.data);
      setAppeals(appealsRes.data || []);
      
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

  // Handle resolving appeals (approve => reactivate user + resolve appeal, reject => resolve appeal only)
  const handleResolveAppeal = async (appealId, action) => {
    setError('');
    setSuccess('');
    setAppealProcessing(appealId);
    try {
      await api.put(`/appeals/${appealId}/resolve`, { action });

      // Update appeals list locally
      setAppeals((prev) => prev.map((a) => (a._id === appealId ? { ...a, resolved: true } : a)));

      if (action === 'approve') {
        // If approved, set the user's status to active in allUsers
        const appeal = appeals.find((a) => a._id === appealId);
        const userId = appeal?.userId?._id || appeal?.userId;
        if (userId) {
          setAllUsers((prev) =>
            prev.map((u) => (u._id === userId ? { ...u, status: 'active' } : u))
          );
          // Remove from pendingAccounts if present
          setPendingAccounts((prev) => prev.filter((p) => p._id !== userId));
          // Refresh active agents if role is agent
          if (appeal?.userId?.role === 'agent' || appeal?.role === 'agent') {
            await fetchActiveAgents();
          }
        }
      }

      setSuccess('Appeal resolved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resolve appeal');
    } finally {
      setAppealProcessing('');
    }
  };

  // --- Add Recycler (admin only) ---
  const [newRecycler, setNewRecycler] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    materials: [], // array of selected materials
  });
  const [showPasswordAdmin, setShowPasswordAdmin] = useState(false);
  const [showConfirmPasswordAdmin, setShowConfirmPasswordAdmin] = useState(false);
  const [newRecyclerErrors, setNewRecyclerErrors] = useState({});
  const [creatingRecycler, setCreatingRecycler] = useState(false);

  const handleNewRecyclerChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      // materials checkboxes
      setNewRecycler((prev) => {
        const materials = new Set(prev.materials || []);
        if (checked) materials.add(value);
        else materials.delete(value);
        return { ...prev, materials: Array.from(materials) };
      });
    } else {
      setNewRecycler((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateRecycler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatingRecycler(true);
    try {
      // Create recycler via public register endpoint (role fixed to 'recycler')
      // Frontend validation
      const errs = {};
      if (!newRecycler.name || newRecycler.name.trim() === '') errs.name = 'Name is required';
      if (!newRecycler.email || newRecycler.email.trim() === '') errs.email = 'Email is required';
      if (!newRecycler.password) errs.password = 'Password is required';
      if (!newRecycler.password || newRecycler.password.length < 8) errs.password = 'Password must be at least 8 characters';
      if (!newRecycler.confirmPassword) errs.confirmPassword = 'Please confirm password';
      if (newRecycler.password !== newRecycler.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (newRecycler.phone && !/^[0-9]{10}$/.test(newRecycler.phone)) errs.phone = 'Phone must be 10 digits';
      setNewRecyclerErrors(errs);
      if (Object.keys(errs).length > 0) {
        // show inline errors only
        setCreatingRecycler(false);
        return;
      }

      const payload = {
        name: newRecycler.name,
        email: newRecycler.email,
        password: newRecycler.password,
        confirmPassword: newRecycler.confirmPassword,
        role: 'recycler',
        address: newRecycler.address,
        phone: newRecycler.phone,
        materials: Array.isArray(newRecycler.materials) ? newRecycler.materials.join(',') : (newRecycler.materials || '').trim(),
      };

      const res = await api.post('/auth/register', payload);

      // Get created user id from response (supports both pending and active responses)
      const createdId =
        res.data?.user?.id || res.data?.user?._id || res.data?.user?.id;

      if (!createdId) {
        // Fallback: refresh data and inform admin
        await fetchData();
        setSuccess('Recycler created (could not determine id) — refreshed list.');
        setNewRecycler({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '', materials: [] });
        return;
      }

      // Approve the recycler to make it active immediately
      await api.put(`/admin/approve-account/${createdId}`);

      // Refresh admin lists
      await fetchData();

      setSuccess('Recycler account created and activated successfully.');
      setNewRecycler({ name: '', email: '', phone: '', address: '', password: '', confirmPassword: '', materials: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create recycler account');
    } finally {
      setCreatingRecycler(false);
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
    const isSelf = currentUser && currentUser._id === user._id;

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
      // For non-admin roles allow delete (cannot delete self)
      buttons.push(
        <button
          key="delete"
          onClick={() => openDeleteModal(user)}
          className="btn btn-danger"
          disabled={isProcessing}
          style={{ marginLeft: '0.5rem' }}
        >
          Delete
        </button>
      );
    } else if (user.role === 'user' || user.role === 'admin') {
      // User and Admin: show deactivate/reactivate, but prevent self-deactivation and never show delete for admins
      if (user.status === 'active') {
        // Prevent admin from deactivating their own account
        if (!isSelf) {
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
        }
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
      // Show delete for non-admin users only (and not self)
      if (user.role !== 'admin' && !isSelf) {
        buttons.push(
          <button
            key="delete"
            onClick={() => openDeleteModal(user)}
            className="btn btn-danger"
            disabled={isProcessing}
            style={{ marginLeft: '0.5rem' }}
          >
            Delete
          </button>
        );
      }
    }

    return buttons.length > 0 ? buttons : <span style={{ color: '#999' }}>No actions</span>;
  };

  const openDeleteModal = (user) => {
    setDeleteTarget(user);
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/admin/delete-account/${deleteTarget._id}`);
      setSuccess('Account deleted successfully');
      closeDeleteModal();
      await fetchData();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
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
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="container-fluid">
        <div className="card mb-3">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-0">Admin Dashboard</h2>
              <small className="text-muted">Monitor system flow and manage users and requests</small>
            </div>
            <div>
              {error && <div className="message message-error me-2">{error}</div>}
              {success && <div className="message message-success">{success}</div>}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : (
          <>
            {/* Overview */}
            <div style={{ display: activeTab === 'overview' ? 'block' : 'none' }}>
              {reports && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h3>Overview</h3>
                    <div className="admin-stats-grid">
                      <div className="admin-stat-card">
                        <h4>{reports.totalRequests}</h4>
                        <p>Total Requests</p>
                      </div>
                      <div className="admin-stat-card">
                        <h4>{reports.totalUsers}</h4>
                        <p>Total Users</p>
                      </div>
                      <div className="admin-stat-card">
                        <h4>{reports.totalAgents}</h4>
                        <p>Total Agents</p>
                      </div>
                      <div className="admin-stat-card">
                        <h4>{reports.totalRecyclers}</h4>
                        <p>Total Recyclers</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Approvals */}
            <div style={{ display: activeTab === 'pending' ? 'block' : 'none' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h3>Pending Account Approvals</h3>
                  <p className="text-muted">Collection agents and recyclers require admin approval before they can login.</p>
                  {pendingAccounts.length === 0 ? (
                    <p>No pending accounts waiting for approval.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Address</th><th>Registered At</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {pendingAccounts.map((account) => (
                            <tr key={account._id}>
                              <td>{account.name}</td>
                              <td>{account.email}</td>
                              <td><span className={getRoleBadgeClass(account.role)}>{account.role}</span></td>
                              <td>{account.phone || 'N/A'}</td>
                              <td>{account.address || 'N/A'}</td>
                              <td>{new Date(account.createdAt).toLocaleString()}</td>
                              <td>
                                <button onClick={() => handleApproveAccount(account._id)} className="btn btn-success btn-sm me-2" disabled={approving === account._id || rejecting === account._id}>{approving === account._id ? 'Approving...' : 'Approve'}</button>
                                <button onClick={() => handleRejectAccount(account._1d)} className="btn btn-warning btn-sm" disabled={approving === account._id || rejecting === account._id}>{rejecting === account._id ? 'Rejecting...' : 'Reject'}</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* All Users */}
            <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h3>All System Users</h3>
                  <p className="text-muted">View all registered users. Normal users are active immediately and do not require approval.</p>
                  {allUsers.length === 0 ? <p>No users found.</p> : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Phone</th><th>Address</th><th>Registered At</th><th>Actions</th></tr></thead>
                        <tbody>{allUsers.map((user) => (
                          <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><span className={getRoleBadgeClass(user.role)}>{user.role}</span></td>
                            <td><span className={getStatusBadgeClass(user.status)}>{user.status}</span></td>
                            <td>{user.phone || 'N/A'}</td>
                            <td>{user.address || 'N/A'}</td>
                            <td>{new Date(user.createdAt).toLocaleString()}</td>
                            <td>{getActionButtons(user)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appeals */}
            <div style={{ display: activeTab === 'appeals' ? 'block' : 'none' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h3>User Appeals / Contact Requests</h3>
                  {appeals.length === 0 ? <p>No appeals found.</p> : (
                    <div className="table-responsive">
                      <table className="table"><thead><tr><th>User</th><th>Role</th><th>Subject</th><th>Message</th><th>Created</th><th>Actions</th></tr></thead>
                        <tbody>{appeals.map((a) => (
                          <tr key={a._id}><td>{a.userId?.name || 'N/A'}</td><td>{a.role}</td><td>{a.subject || '—'}</td><td>{a.message}</td><td>{new Date(a.createdAt).toLocaleString()}</td><td>{a.resolved ? <span className="text-muted">Resolved</span> : <>
                            <button className="btn btn-success btn-sm me-2" onClick={() => handleResolveAppeal(a._id, 'approve')}>Approve</button>
                            <button className="btn btn-warning btn-sm" onClick={() => handleResolveAppeal(a._id, 'reject')}>Reject</button>
                          </>}</td></tr>
                        ))}</tbody></table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add Recycler */}
            <div style={{ display: activeTab === 'add-recycler' ? 'block' : 'none' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h3>Add Recycler (admin)</h3>
                  <p className="text-muted">Create a recycler account manually. Recycler accounts created here are activated immediately.</p>
                  <form onSubmit={handleCreateRecycler} style={{ maxWidth: 800 }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Recycler Name (facility/company)</label>
                        <input type="text" name="name" value={newRecycler.name} onChange={handleNewRecyclerChange} required className={`form-control rounded-pill ${newRecyclerErrors.name ? 'is-invalid' : ''}`} />
                        {newRecyclerErrors.name && <div className="invalid-feedback d-block">{newRecyclerErrors.name}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input type="email" name="email" value={newRecycler.email} onChange={handleNewRecyclerChange} required className={`form-control rounded-pill ${newRecyclerErrors.email ? 'is-invalid' : ''}`} />
                        {newRecyclerErrors.email && <div className="invalid-feedback d-block">{newRecyclerErrors.email}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone (10 digits)</label>
                        <input type="text" name="phone" value={newRecycler.phone} onChange={handleNewRecyclerChange} placeholder="1234567890" maxLength={10} className={`form-control rounded-pill ${newRecyclerErrors.phone ? 'is-invalid' : ''}`} />
                        {newRecyclerErrors.phone && <div className="invalid-feedback d-block">{newRecyclerErrors.phone}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                          <input type={showPasswordAdmin ? 'text' : 'password'} name="password" value={newRecycler.password} onChange={handleNewRecyclerChange} required className="form-control rounded-pill" />
                          <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPasswordAdmin(!showPasswordAdmin)}>{showPasswordAdmin ? 'Hide' : 'Show'}</button>
                        </div>
                        {newRecyclerErrors.password && <div className="invalid-feedback d-block">{newRecyclerErrors.password}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-group">
                          <input type={showConfirmPasswordAdmin ? 'text' : 'password'} name="confirmPassword" value={newRecycler.confirmPassword || ''} onChange={handleNewRecyclerChange} required className="form-control rounded-pill" />
                          <button type="button" className="btn btn-outline-secondary" onClick={() => setShowConfirmPasswordAdmin(!showConfirmPasswordAdmin)}>{showConfirmPasswordAdmin ? 'Hide' : 'Show'}</button>
                        </div>
                        {newRecyclerErrors.confirmPassword && <div className="invalid-feedback d-block">{newRecyclerErrors.confirmPassword}</div>}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Full Address</label>
                        <textarea name="address" value={newRecycler.address} onChange={handleNewRecyclerChange} rows={2} className={`form-control rounded ${newRecyclerErrors.address ? 'is-invalid' : ''}`} />
                        {newRecyclerErrors.address && <div className="invalid-feedback d-block">{newRecyclerErrors.address}</div>}
                      </div>
                      <div className="col-12 d-grid">
                        <button type="submit" className="btn btn-success rounded-pill" disabled={creatingRecycler}>{creatingRecycler ? 'Creating...' : 'Create Recycler'}</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Reports */}
            <div style={{ display: activeTab === 'reports' ? 'block' : 'none' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h3>System Reports</h3>
                  {reports && (
                    <div className="admin-stats-grid">
                      <div className="admin-stat-card">
                        <h4>{reports.totalRequests}</h4>
                        <p>Total Requests</p>
                      </div>
                      <div className="admin-stat-card">
                        <h4>{reports.totalUsers}</h4>
                        <p>Total Users</p>
                      </div>
                      <div className="admin-stat-card">
                        <h4>{reports.totalAgents}</h4>
                        <p>Total Agents</p>
                      </div>
                      <div className="admin-stat-card">
                        <h4>{reports.totalRecyclers}</h4>
                        <p>Total Recyclers</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pickup Requests */}
            <div style={{ display: activeTab === 'requests' ? 'block' : 'none' }}>
              <div className="card mb-3">
                <div className="card-body">
                  <h3>All Pickup Requests</h3>
                  {requests.length === 0 ? <p>No pickup requests found.</p> : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead><tr><th>Select</th><th>Created At</th><th>User</th><th>Address</th><th>Item</th><th>Quantity</th><th>Status</th><th>Assigned Agent</th></tr></thead>
                        <tbody>{requests.map((r) => {
                          const isAssignable = r.status === 'Requested';
                          const isTerminal = r.status === 'Recycled';
                          const isDisabled = isTerminal || !isAssignable;
                          return (<tr key={r._id} style={isDisabled ? { opacity: 0.6 } : {}}><td><input type="radio" name="request" value={r._id} checked={selectedRequestId === r._id} onChange={() => { if (isAssignable) setSelectedRequestId(r._id); else { setSelectedRequestId(''); setError(isTerminal ? 'Cannot select completed request.' : `Cannot select request with status \"${r.status}\"`); } }} disabled={isDisabled} /></td><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.userId?.name || 'N/A'}</td><td>{r.pickupAddress}</td><td>{r.items?.[0]?.description || 'N/A'}</td><td>{r.items?.[0]?.quantity || 0}</td><td><span className={getStatusBadgeClass(r.status)}>{r.status}</span></td><td>{r.assignedAgentId?.name || 'Not assigned'}</td></tr>);
                        })}</tbody>
                      </table>
                    </div>
                  )}

                  {/* Assign Agent to Selected Request - restored */}
                  <div className="card mt-3">
                    <div className="card-body">
                      <h5>Assign Agent to Selected Request</h5>
                      {(() => {
                        const selectedRequest = requests.find((r) => r._id === selectedRequestId);
                        const isSelectedTerminal = selectedRequest?.status === 'Recycled';
                        const isSelectedAssignable = selectedRequest?.status === 'Requested';
                        const alreadyAssigned = !!selectedRequest?.assignedAgentId;
                        const isFormDisabled = !selectedRequestId || isSelectedTerminal || !isSelectedAssignable || submitting || activeAgents.length === 0 || alreadyAssigned;

                        return (
                          <form onSubmit={handleAssign} style={{ maxWidth: 600 }}>
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
                                {alreadyAssigned && (
                                  <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.875rem' }}>
                                    ℹ️ This request is already assigned to {selectedRequest.assignedAgentId?.name || 'an agent'}.
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="mb-3">
                              <label className="form-label">Select Agent</label>
                              <select
                                value={agentId}
                                onChange={(e) => setAgentId(e.target.value)}
                                required
                                disabled={isFormDisabled}
                                className="form-select"
                              >
                                <option value="">
                                  {activeAgents.length === 0 ? 'No active agents available' : '-- Select an agent --'}
                                </option>
                                {activeAgents.map((agent) => (
                                  <option key={agent._id} value={agent._id}>
                                    {agent.name} ({agent.email})
                                  </option>
                                ))}
                              </select>
                              {activeAgents.length === 0 && (
                                <p className="text-muted small mt-2">No active agents available. Approve agent accounts to make them available for assignment.</p>
                              )}
                            </div>

                            <button type="submit" className="btn btn-primary" disabled={isFormDisabled}>
                              {submitting ? 'Assigning...' : 'Assign Agent'}
                            </button>
                          </form>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
