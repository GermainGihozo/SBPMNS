import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';

function Dashboard() {
  const [role, setRole] = useState('');
  const [passengers, setPassengers] = useState([]);
  const [borderEntries, setBorderEntries] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'companyadmin' });
  const [createMessage, setCreateMessage] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || 'Failed to load dashboard data');
      }

      const data = await response.json();

      setRole(data.role || localStorage.getItem('role') || '');
      setPassengers(data.passengers || []);
      setBorderEntries((data.borderEntries || []).slice(0, 20));
      setTrips(data.trips || []);
      setVehicles(data.vehicles || []);
      setTickets(data.tickets || []);
      setUsers(data.users || []);
      setAuditLogs((data.auditLogs || []).slice(0, 20));
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateMessage('');

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
      refreshDashboard();
    } catch (err) {
      console.error('User creation error:', err);
      setCreateError(err.message);
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
      refreshDashboard();
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
      refreshDashboard();
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
      refreshDashboard();
    } catch (err) {
      console.error('Delete user error:', err);
      setCreateError(err.message);
    }
  };

  const getRoleTitle = () => {
    const titles = {
      superadmin: '👑 SUPER ADMIN Dashboard',
      companyadmin: '🏢 COMPANY ADMIN Dashboard',
      borderofficer: '🛃 BORDER OFFICER Dashboard',
      healthofficer: '🏥 HEALTH OFFICER Dashboard',
    };
    return titles[role] || 'Dashboard';
  };

  if (loading) {
    return <div><h2>Loading Dashboard...</h2></div>;
  }

  return (
    <div className="dashboard-container">
      <h2>{getRoleTitle()}</h2>

      {/* Alert Box - visible to all */}
      {alerts.length > 0 && (
        <div className="alert-box">
          <h3>⚠️ Active Alerts</h3>
          {alerts.slice(0, 5).map(passenger => (
            <div key={passenger.id}>
              <strong>{passenger.name}</strong> ({passenger.passport_number}):
              {passenger.blacklist_reason && ` 🚫 Blacklisted: ${passenger.blacklist_reason}`}
              {passenger.health_status !== 'healthy' && ` 🏥 Health: ${passenger.health_status}`}
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        {/* SUPERADMIN View */}
        {role === 'superadmin' && (
          <>
            {/* System Overview */}
            <div className="dashboard-card">
              <h3>📊 System Overview</h3>
              <div className="metrics">
                <div className="metric">
                  <label>Total Users:</label>
                  <span className="metric-value">{users.length}</span>
                </div>
                <div className="metric">
                  <label>Total Passengers:</label>
                  <span className="metric-value">{passengers.length}</span>
                </div>
                <div className="metric">
                  <label>Active Alerts:</label>
                  <span className="metric-value alert">{alerts.length}</span>
                </div>
                <div className="metric">
                  <label>Border Entries:</label>
                  <span className="metric-value">{borderEntries.length}</span>
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="dashboard-card">
              <h3>👥 User Management</h3>

              {/* Create new user */}
              <form onSubmit={handleCreateUser} className="user-form">
                <div>
                  <label>Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="superadmin">superadmin</option>
                    <option value="companyadmin">companyadmin</option>
                    <option value="borderofficer">borderofficer</option>
                    <option value="healthofficer">healthofficer</option>
                  </select>
                </div>
                <button type="submit">Create User</button>
                {createMessage && <p className="success-message">{createMessage}</p>}
                {createError && <p className="error-message">{createError}</p>}
              </form>

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
                        >
                          <option value="superadmin">superadmin</option>
                          <option value="companyadmin">companyadmin</option>
                          <option value="borderofficer">borderofficer</option>
                          <option value="healthofficer">healthofficer</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="small-button"
                          onClick={() => handleToggleActive(user.id, !user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                      <td>
                        <button className="small-button danger" onClick={() => handleDeleteUser(user.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Audit Logs */}
            <div className="dashboard-card">
              <h3>📋 Recent Audit Logs</h3>
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Time</th>
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
            </div>

            {/* All Passengers */}
            <div className="dashboard-card">
              <h3>👤 All Passengers</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Passport</th>
                    <th>Nationality</th>
                    <th>Health</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.slice(0, 10).map(passenger => (
                    <tr key={passenger.id}>
                      <td>{passenger.name}</td>
                      <td>{passenger.passport_number}</td>
                      <td>{passenger.nationality}</td>
                      <td>{passenger.health_status}</td>
                      <td>{passenger.blacklist_reason ? '🚫 Blacklisted' : '✅ Clear'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Border Activity */}
            <div className="dashboard-card">
              <h3>🛃 Border Activity</h3>
              <table>
                <thead>
                  <tr>
                    <th>Passenger</th>
                    <th>Entry Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borderEntries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.name}</td>
                      <td>{entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A'}</td>
                      <td>{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* COMPANY ADMIN View */}
        {role === 'companyadmin' && (
          <>
            {/* Operations Overview */}
            <div className="dashboard-card">
              <h3>📊 Operations Overview</h3>
              <div className="metrics">
                <div className="metric">
                  <label>Active Trips:</label>
                  <span className="metric-value">{trips.filter(t => t.status === 'scheduled').length}</span>
                </div>
                <div className="metric">
                  <label>Vehicles:</label>
                  <span className="metric-value">{vehicles.length}</span>
                </div>
                <div className="metric">
                  <label>Total Passengers:</label>
                  <span className="metric-value">{passengers.length}</span>
                </div>
                <div className="metric">
                  <label>Booked Tickets:</label>
                  <span className="metric-value">{tickets.length}</span>
                </div>
              </div>
            </div>

            {/* Trips */}
            <div className="dashboard-card">
              <h3>🚌 Active Trips</h3>
              <table>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(0, 8).map(trip => (
                    <tr key={trip.id}>
                      <td>{trip.departure}</td>
                      <td>{trip.destination}</td>
                      <td>{new Date(trip.departure_date).toLocaleDateString()}</td>
                      <td>{trip.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vehicles */}
            <div className="dashboard-card">
              <h3>🚗 Fleet Status</h3>
              <table>
                <thead>
                  <tr>
                    <th>Plate</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.slice(0, 8).map(vehicle => (
                    <tr key={vehicle.id}>
                      <td>{vehicle.plate_number}</td>
                      <td>{vehicle.type}</td>
                      <td>{vehicle.capacity}</td>
                      <td>{vehicle.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Passengers */}
            <div className="dashboard-card">
              <h3>👥 Registered Passengers</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Passport</th>
                    <th>Health</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.slice(0, 8).map(passenger => (
                    <tr key={passenger.id}>
                      <td>{passenger.name}</td>
                      <td>{passenger.passport_number}</td>
                      <td>{passenger.health_status}</td>
                      <td>{passenger.blacklist_reason ? '🚫 Blacklisted' : '✅ Clear'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* BORDER OFFICER View */}
        {role === 'borderofficer' && (
          <>
            {/* Border Status */}
            <div className="dashboard-card">
              <h3>🛃 Border Status</h3>
              <div className="metrics">
                <div className="metric">
                  <label>Today's Entries:</label>
                  <span className="metric-value">{borderEntries.length}</span>
                </div>
                <div className="metric">
                  <label>Flagged Passengers:</label>
                  <span className="metric-value alert">{alerts.length}</span>
                </div>
                <div className="metric">
                  <label>Blacklisted:</label>
                  <span className="metric-value">{passengers.filter(p => p.blacklist_reason).length}</span>
                </div>
              </div>
            </div>

            {/* Passenger Verification */}
            <div className="dashboard-card">
              <h3>👤 Passengers to Verify</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Passport</th>
                    <th>Nationality</th>
                    <th>Health</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.slice(0, 10).map(passenger => (
                    <tr key={passenger.id} className={passenger.blacklist_reason ? 'flagged-row' : ''}>
                      <td>{passenger.name}</td>
                      <td>{passenger.passport_number}</td>
                      <td>{passenger.nationality}</td>
                      <td>{passenger.health_status}</td>
                      <td>{passenger.blacklist_reason ? '🚫 Blacklisted' : '✅ Clear'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Border Entry History */}
            <div className="dashboard-card">
              <h3>📋 Recent Border Activity</h3>
              <table>
                <thead>
                  <tr>
                    <th>Passenger</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {borderEntries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.name}</td>
                      <td>{entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A'}</td>
                      <td>{entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'Pending'}</td>
                      <td>{entry.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="dashboard-card alert-card">
                <h3>⚠️ High Priority Alerts</h3>
                {alerts.map(passenger => (
                  <div key={passenger.id} className="alert-item">
                    <strong>{passenger.name}</strong>
                    {passenger.blacklist_reason && <p>🚫 Blacklisted: {passenger.blacklist_reason}</p>}
                    {passenger.health_status !== 'healthy' && <p>🏥 Health Status: {passenger.health_status}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* HEALTH OFFICER View */}
        {role === 'healthofficer' && (
          <>
            {/* Health Status Overview */}
            <div className="dashboard-card">
              <h3>🏥 Health Status Overview</h3>
              <div className="metrics">
                <div className="metric">
                  <label>Healthy:</label>
                  <span className="metric-value">{passengers.filter(p => p.health_status === 'healthy').length}</span>
                </div>
                <div className="metric">
                  <label>Quarantined:</label>
                  <span className="metric-value warning">{passengers.filter(p => p.health_status === 'quarantined').length}</span>
                </div>
                <div className="metric">
                  <label>Infected:</label>
                  <span className="metric-value alert">{passengers.filter(p => p.health_status === 'infected').length}</span>
                </div>
              </div>
            </div>

            {/* At-Risk Passengers */}
            <div className="dashboard-card">
              <h3>⚠️ At-Risk Passengers</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Passport</th>
                    <th>Health Status</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers
                    .filter(p => p.health_status !== 'healthy')
                    .map(passenger => (
                      <tr key={passenger.id} className="risk-row">
                        <td>{passenger.name}</td>
                        <td>{passenger.passport_number}</td>
                        <td>{passenger.health_status}</td>
                        <td>
                          {passenger.health_status === 'infected' ? '🔴 High' : '🟡 Medium'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Health Alerts */}
            <div className="dashboard-card alert-card">
              <h3>🏥 Health Alerts</h3>
              {alerts.length > 0 ? (
                alerts
                  .filter(a => a.health_status !== 'healthy')
                  .map(passenger => (
                    <div key={passenger.id} className="alert-item">
                      <strong>{passenger.name}</strong>
                      <p>Status: {passenger.health_status}</p>
                    </div>
                  ))
              ) : (
                <p>No health alerts</p>
              )}
            </div>

            {/* All Passengers with Health Info */}
            <div className="dashboard-card">
              <h3>👥 All Passenger Health Records</h3>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Passport</th>
                    <th>Health Status</th>
                    <th>Nationality</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.slice(0, 15).map(passenger => (
                    <tr key={passenger.id}>
                      <td>{passenger.name}</td>
                      <td>{passenger.passport_number}</td>
                      <td>
                        <span className={`health-badge ${passenger.health_status}`}>
                          {passenger.health_status}
                        </span>
                      </td>
                      <td>{passenger.nationality}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;