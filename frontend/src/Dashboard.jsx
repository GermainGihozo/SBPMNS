import { useState, useEffect } from 'react';
import API_BASE_URL from './config';
import './Dashboard.css';

function Dashboard() {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [stats, setStats] = useState({
    totalPassengers: 0,
    todayEntries: 0,
    activeAlerts: 0,
    activeTrips: 0
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || '');
    const storedRole = localStorage.getItem('role');
    setRole(storedRole || '');
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getRoleDisplay = (role) => {
    const roleMap = {
      'superadmin': 'Super Admin',
      'companyadmin': 'Company Admin',
      'borderofficer': 'Border Officer',
      'healthofficer': 'Health Officer',
      'policeofficer': 'Police Officer',
      'immigrationofficer': 'Immigration Officer'
    };
    return roleMap[role] || role;
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        
        const passengers = data.passengers || [];
        const borderEntries = data.borderEntries || [];
        const trips = data.trips || [];
        const alertPassengers = passengers.filter(p => p.blacklist_reason || p.health_status !== 'healthy');
        
        setAlerts(alertPassengers);
        setRecentEntries(borderEntries.slice(0, 5));
        
        const today = new Date().toDateString();
        const todayCount = borderEntries.filter(e => {
          const entryDate = new Date(e.entry_time).toDateString();
          return entryDate === today;
        }).length;
        
        setStats({
          totalPassengers: passengers.length,
          todayEntries: todayCount,
          activeAlerts: alertPassengers.length,
          activeTrips: trips.filter(t => t.status === 'scheduled' || !t.status).length
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><h2>Loading Dashboard...</h2></div>;
  }

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h2>Welcome, {username}</h2>
          <p className="role-badge">{getRoleDisplay(role)}</p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="alert-box">
          <h3>⚠️ Active Alerts ({alerts.length})</h3>
          <div className="alert-list">
            {alerts.slice(0, 3).map(passenger => (
              <div key={passenger.id} className="alert-item">
                <strong>{passenger.name}</strong> ({passenger.passport_number})
                {passenger.blacklist_reason && <span className="alert-reason"> - Blacklisted: {passenger.blacklist_reason}</span>}
                {passenger.health_status !== 'healthy' && <span className="alert-reason"> - Health: {passenger.health_status}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalPassengers}</div>
            <div className="stat-label">Total Passengers</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.todayEntries}</div>
            <div className="stat-label">Today's Entries</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeAlerts}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🚌</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeTrips}</div>
            <div className="stat-label">Active Trips</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Border Activity</h3>
        {recentEntries.length === 0 ? (
          <p className="empty-state">No recent activity</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Passenger</th>
                  <th>Passport</th>
                  <th>Entry Time</th>
                  <th>Status</th>
                  <th>Officer</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.name}</td>
                    <td>{entry.passport_number}</td>
                    <td>{entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A'}</td>
                    <td>
                      <span className={`status-badge status-${entry.status || 'entered'}`}>
                        {entry.status || 'entered'}
                      </span>
                    </td>
                    <td>{entry.officer || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
