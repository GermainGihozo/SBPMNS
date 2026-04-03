import { useState, useEffect } from 'react';
import API_BASE_URL from './config';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'companyadmin' });
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setAuditLogs((data.auditLogs || []).slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setCreateError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateMessage('');

    if (!newUser.username || !newUser.password) {
      setCreateError('Username and password are required');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Unable to create user');
      }

      setCreateMessage('User created successfully');
      setNewUser({ username: '', password: '', role: 'companyadmin' });
      fetchData();
    } catch (err) {
      console.error('User creation error:', err);
      setCreateError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Cannot update role');
      }
      fetchData();
    } catch (err) {
      console.error('Role update error:', err);
      setCreateError(err.message);
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}/active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: isActive }),
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Cannot update status');
      }
      fetchData();
    } catch (err) {
      console.error('Status toggle error:', err);
      setCreateError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error((await response.json()).message || 'Cannot delete user');
      }
      fetchData();
    } catch (err) {
      console.error('Delete user error:', err);
      setCreateError(err.message);
    }
  };

  return (
    <div>
      <h2>User Management</h2>

      {createMessage && <div className="success-message">{createMessage}</div>}
      {createError && <div className="error-message">{createError}</div>}

      <div className="user-management-grid">
        <div className="management-card">
          <h3>Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <div>
              <label>Username:</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label>Role:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                disabled={loading}
              >
                <option value="superadmin">Super Admin</option>
                <option value="companyadmin">Company Admin</option>
                <option value="borderofficer">Border Officer</option>
                <option value="healthofficer">Health Officer</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        <div className="management-card">
          <h3>System Users ({users.length})</h3>
          {loading && <p>Loading users...</p>}
          {users.length === 0 && !loading && <p>No users found.</p>}
          {users.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="companyadmin">Company Admin</option>
                        <option value="borderofficer">Border Officer</option>
                        <option value="healthofficer">Health Officer</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-small"
                          onClick={() => handleToggleActive(user.id, !user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          className="btn-small btn-danger" 
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="audit-section">
        <h3>Recent Audit Logs</h3>
        {auditLogs.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No audit logs available</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.username}</td>
                  <td>{log.action}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
