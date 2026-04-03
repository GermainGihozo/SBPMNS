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

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);
    fetchDashboardData(storedRole);
  }, []);

  const fetchDashboardData = async (userRole) => {
    const token = localStorage.getItem('token');
    setLoading(true);

    try {
      // Fetch passengers - all roles can see
      const passResponse = await fetch(`${API_BASE_URL}/passengers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (passResponse.ok) {
        const data = await passResponse.json();
        setPassengers(data);
        const newAlerts = data.filter(p => p.blacklist_reason || p.health_status !== 'healthy');
        setAlerts(newAlerts);
      }

      // Fetch border entries - officer, health, superadmin can see
      if (['superadmin', 'borderofficer', 'healthofficer'].includes(userRole)) {
        const borderResponse = await fetch(`${API_BASE_URL}/border-entries`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (borderResponse.ok) {
          const data = await borderResponse.json();
          setBorderEntries(data.slice(0, 10));
        }
      }

      // Fetch trips - company and super admin
      if (['superadmin', 'companyadmin'].includes(userRole)) {
        const tripResponse = await fetch(`${API_BASE_URL}/trips`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (tripResponse.ok) {
          const data = await tripResponse.json();
          setTrips(data);
        }
      }

      // Fetch vehicles - company and super admin
      if (['superadmin', 'companyadmin'].includes(userRole)) {
        const vehicleResponse = await fetch(`${API_BASE_URL}/vehicles`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (vehicleResponse.ok) {
          const data = await vehicleResponse.json();
          setVehicles(data);
        }
      }

      // Fetch tickets - company and super admin
      if (['superadmin', 'companyadmin'].includes(userRole)) {
        const ticketResponse = await fetch(`${API_BASE_URL}/tickets`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (ticketResponse.ok) {
          const data = await ticketResponse.json();
          setTickets(data);
        }
      }

      // Fetch users - superadmin only
      if (userRole === 'superadmin') {
        const userResponse = await fetch(`${API_BASE_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (userResponse.ok) {
          const data = await userResponse.json();
          setUsers(data);
        }

        const auditResponse = await fetch(`${API_BASE_URL}/audit-logs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (auditResponse.ok) {
          const data = await auditResponse.json();
          setAuditLogs(data.slice(0, 10));
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
              <table>
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map(user => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.role}</td>
                      <td>{user.is_active ? '✅ Active' : '❌ Inactive'}</td>
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