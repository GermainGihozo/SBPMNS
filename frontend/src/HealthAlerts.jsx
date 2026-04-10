import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './HealthAlerts.css';

function HealthAlerts() {
  const [passengers, setPassengers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const passengersData = await apiCall('/passengers');
      setPassengers(passengersData);
      generateNotifications(passengersData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (passengersData) => {
    const alerts = [];

    passengersData.forEach(passenger => {
      if (passenger.health_status === 'quarantined') {
        alerts.push({
          id: `health-${passenger.id}`,
          type: 'warning',
          title: 'Quarantine Alert',
          message: `${passenger.name} (${passenger.passport_number}) is currently in quarantine`,
          details: passenger.blacklist_reason || 'No additional details provided',
          timestamp: new Date(passenger.created_at),
          passenger: passenger
        });
      } else if (passenger.health_status === 'infected') {
        alerts.push({
          id: `health-${passenger.id}`,
          type: 'critical',
          title: 'Critical Health Alert',
          message: `${passenger.name} (${passenger.passport_number}) has been marked as infected`,
          details: passenger.blacklist_reason || 'Immediate attention required',
          timestamp: new Date(passenger.created_at),
          passenger: passenger
        });
      }

      if (passenger.blacklist_reason && passenger.blacklist_reason.toLowerCase().includes('health')) {
        alerts.push({
          id: `blacklist-${passenger.id}`,
          type: 'warning',
          title: 'Health-Related Restriction',
          message: `${passenger.name} has health-related travel restrictions`,
          details: passenger.blacklist_reason,
          timestamp: new Date(passenger.created_at),
          passenger: passenger
        });
      }
    });

    alerts.sort((a, b) => b.timestamp - a.timestamp);
    setNotifications(alerts);
  };

  const getFilteredNotifications = () => {
    if (filterType === 'all') return notifications;
    return notifications.filter(n => n.type === filterType);
  };

  const filteredNotifications = getFilteredNotifications();

  const getAlertStats = () => {
    const critical = notifications.filter(n => n.type === 'critical').length;
    const warning = notifications.filter(n => n.type === 'warning').length;
    const total = notifications.length;

    return { critical, warning, total };
  };

  const stats = getAlertStats();

  return (
    <div className="health-alerts">
      <div className="page-header">
        <h2>🔔 Health Alerts & Notifications</h2>
        <p>Monitor critical health alerts and cautions in real-time</p>
      </div>

      <div className="alert-stats">
        <div className="stat-card total">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Alerts</div>
          </div>
        </div>
        
        <div className="stat-card critical">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.warning}</div>
            <div className="stat-label">Warnings</div>
          </div>
        </div>
        
        <div className="stat-card refresh">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-value">30s</div>
            <div className="stat-label">Auto Refresh</div>
          </div>
        </div>
      </div>

      <div className="alerts-container">
        <div className="alerts-header">
          <h3>Active Health Alerts</h3>
          <div className="alerts-controls">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings Only</option>
            </select>
            <button onClick={fetchData} className="refresh-btn" disabled={loading}>
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="no-alerts">
            <span className="icon">✓</span>
            <h3>No Active Alerts</h3>
            <p>All passengers are in good health status</p>
          </div>
        ) : (
          <div className="alerts-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`alert-card ${notification.type}`}
                onClick={() => setSelectedPassenger(notification.passenger)}
              >
                <div className="alert-icon-wrapper">
                  {notification.type === 'critical' ? '🚨' : '⚠️'}
                </div>
                
                <div className="alert-content">
                  <div className="alert-header">
                    <div className="alert-title-section">
                      <h4>{notification.title}</h4>
                      <span className={`alert-badge ${notification.type}`}>
                        {notification.type}
                      </span>
                    </div>
                    <span className="alert-time">
                      {notification.timestamp.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="alert-message">{notification.message}</p>
                  
                  <div className="alert-details">
                    <strong>Details:</strong> {notification.details}
                  </div>
                  
                  <div className="alert-footer">
                    <div className="passenger-info">
                      <span>Blood Type: {notification.passenger.blood_type || 'N/A'}</span>
                      <span>Nationality: {notification.passenger.nationality}</span>
                    </div>
                    <button className="view-details-btn">
                      View Full Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedPassenger && (
        <div className="modal-overlay" onClick={() => setSelectedPassenger(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Passenger Health Details</h3>
              <button className="close-btn" onClick={() => setSelectedPassenger(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{selectedPassenger.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Passport Number:</label>
                    <span>{selectedPassenger.passport_number}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nationality:</label>
                    <span>{selectedPassenger.nationality}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{selectedPassenger.date_of_birth}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Health Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Blood Type:</label>
                    <span className="blood-type-large">
                      {selectedPassenger.blood_type || 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Health Status:</label>
                    <span className={`health-badge status-${selectedPassenger.health_status}`}>
                      {selectedPassenger.health_status}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Disease/Condition:</label>
                    <span>{selectedPassenger.blacklist_reason || 'None reported'}</span>
                  </div>
                </div>
              </div>

              {selectedPassenger.reference_name && (
                <div className="detail-section">
                  <h4>Emergency Contact</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Contact Name:</label>
                      <span>{selectedPassenger.reference_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Contact Phone:</label>
                      <span>{selectedPassenger.reference_contact}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthAlerts;
