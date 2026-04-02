import React, { useState, useEffect } from 'react';
import { apiCall, handleApiError } from './api';

function BorderControl() {
  const [passengers, setPassengers] = useState([]);
  const [borderEntries, setBorderEntries] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPassengers();
    fetchBorderEntries();
  }, []);

  const fetchPassengers = async () => {
    try {
      const data = await apiCall('/passengers');
      setPassengers(data);
    } catch (err) {
      console.error('Error fetching passengers:', err);
    }
  };

  const fetchBorderEntries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/border-entries');
      setBorderEntries(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async () => {
    if (!selectedPassenger) {
      setError('Please select a passenger');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/border-entries', {
        method: 'POST',
        body: JSON.stringify({
          passengerId: selectedPassenger,
          notes: entryNotes,
        }),
      });
      if (data.alerts && data.alerts.length > 0) {
        setAlerts(data.alerts);
        alert('ALERTS DETECTED:\n' + data.alerts.join('\n'));
      } else {
        alert('Border entry recorded successfully');
      }
      setSelectedPassenger('');
      setEntryNotes('');
      fetchBorderEntries();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async (entryId) => {
    const notes = prompt('Exit notes:');
    if (notes === null) return;

    setLoading(true);
    setError('');
    try {
      await apiCall(`/border-entries/${entryId}/exit`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
      alert('Border exit recorded successfully');
      fetchBorderEntries();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Border Control</h2>

      {alerts.length > 0 && (
        <div className="alert-box">
          <h3>⚠️ Active Alerts:</h3>
          <ul>
            {alerts.map((alert, index) => (
              <li key={index}>{alert}</li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="border-entry-form">
        <h3>Record Border Entry</h3>
        <select 
          value={selectedPassenger} 
          onChange={(e) => setSelectedPassenger(e.target.value)}
          disabled={loading}
        >
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
          disabled={loading}
        />
        <button onClick={handleEntry} disabled={loading}>
          {loading ? 'Recording...' : 'Record Entry'}
        </button>
      </div>

      <h3>Border Entries</h3>
      {loading && <p>Loading border entries...</p>}
      {borderEntries.length === 0 && !loading && <p>No border entries found.</p>}
      {borderEntries.length > 0 && (
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
                <td>{entry.status || 'entered'}</td>
                <td>{entry.officer || 'N/A'}</td>
                <td>
                  {entry.status === 'entered' && (
                    <button onClick={() => handleExit(entry.id)} disabled={loading}>Record Exit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BorderControl;