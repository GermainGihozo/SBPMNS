import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [passengers, setPassengers] = useState([]);
  const [borderEntries, setBorderEntries] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchPassengers();
    fetchBorderEntries();
    const interval = setInterval(() => {
      fetchPassengers();
      fetchBorderEntries();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPassengers = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/passengers', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPassengers(data);
        // Check for alerts
        const newAlerts = data.filter(p => p.blacklist_reason || p.health_status !== 'healthy');
        setAlerts(newAlerts);
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const fetchBorderEntries = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/border-entries', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBorderEntries(data.slice(0, 10)); // Last 10 entries
      }
    } catch (error) {
      console.error('Error fetching border entries:', error);
    }
  };

  return (
    <div>
      <h2>Officer Dashboard</h2>

      {alerts.length > 0 && (
        <div style={{ backgroundColor: '#ffcccc', padding: '10px', marginBottom: '20px' }}>
          <h3>⚠️ Active Alerts</h3>
          {alerts.map(passenger => (
            <div key={passenger.id}>
              <strong>{passenger.name}</strong> ({passenger.passport_number}):
              {passenger.blacklist_reason && ` Blacklisted: ${passenger.blacklist_reason}`}
              {passenger.health_status !== 'healthy' && ` Health: ${passenger.health_status}`}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <h3>Recent Passengers ({passengers.length})</h3>
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
                  <td>{passenger.blacklist_reason ? 'Blacklisted' : 'Clear'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3>Recent Border Activity</h3>
          <table>
            <thead>
              <tr>
                <th>Passenger</th>
                <th>Entry Time</th>
                <th>Status</th>
                <th>Officer</th>
              </tr>
            </thead>
            <tbody>
              {borderEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.name}</td>
                  <td>{entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A'}</td>
                  <td>{entry.status}</td>
                  <td>{entry.officer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;