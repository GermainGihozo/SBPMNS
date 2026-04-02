import React, { useState, useEffect } from 'react';

function BorderControl() {
  const [passengers, setPassengers] = useState([]);
  const [borderEntries, setBorderEntries] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchPassengers();
    fetchBorderEntries();
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
        setBorderEntries(data);
      }
    } catch (error) {
      console.error('Error fetching border entries:', error);
    }
  };

  const handleEntry = async () => {
    if (!selectedPassenger) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/border-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          passengerId: selectedPassenger,
          notes: entryNotes,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.alerts) {
          setAlerts(data.alerts);
          alert('ALERTS DETECTED:\n' + data.alerts.join('\n'));
        } else {
          alert('Border entry recorded successfully');
        }
        setSelectedPassenger('');
        setEntryNotes('');
        fetchBorderEntries();
      } else {
        alert('Error recording entry');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording entry');
    }
  };

  const handleExit = async (entryId) => {
    const notes = prompt('Exit notes:');
    if (notes === null) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5001/api/sbpmns/border-entries/${entryId}/exit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      });
      if (response.ok) {
        alert('Border exit recorded successfully');
        fetchBorderEntries();
      } else {
        alert('Error recording exit');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error recording exit');
    }
  };

  return (
    <div>
      <h2>Border Control</h2>

      {alerts.length > 0 && (
        <div style={{ backgroundColor: '#ffcccc', padding: '10px', marginBottom: '20px' }}>
          <h3>Active Alerts:</h3>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3>Record Border Entry</h3>
        <select value={selectedPassenger} onChange={(e) => setSelectedPassenger(e.target.value)}>
          <option value="">Select Passenger</option>
          {passengers.map(passenger => (
            <option key={passenger.id} value={passenger.id}>
              {passenger.name} ({passenger.passport_number})
            </option>
          ))}
        </select>
        <textarea
          placeholder="Entry notes"
          value={entryNotes}
          onChange={(e) => setEntryNotes(e.target.value)}
        />
        <button onClick={handleEntry}>Record Entry</button>
      </div>

      <h3>Border Entries</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Passenger</th>
            <th>Passport</th>
            <th>Entry Time</th>
            <th>Exit Time</th>
            <th>Status</th>
            <th>Officer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {borderEntries.map(entry => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.name}</td>
              <td>{entry.passport_number}</td>
              <td>{entry.entry_time ? new Date(entry.entry_time).toLocaleString() : 'N/A'}</td>
              <td>{entry.exit_time ? new Date(entry.exit_time).toLocaleString() : 'N/A'}</td>
              <td>{entry.status}</td>
              <td>{entry.officer}</td>
              <td>
                {entry.status === 'entered' && (
                  <button onClick={() => handleExit(entry.id)}>Record Exit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BorderControl;