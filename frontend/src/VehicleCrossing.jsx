import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './VehicleCrossing.css';

function VehicleCrossing() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [crossingNotes, setCrossingNotes] = useState('');
  const [crossingType, setCrossingType] = useState('entry');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const data = await apiCall('/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const recordVehicleCrossing = async () => {
    setError('');
    setSuccess('');

    if (!selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const vehicle = vehicles.find(v => v.id === parseInt(selectedVehicle));
      setSuccess(`Vehicle ${vehicle.plate_number} ${crossingType} recorded successfully!`);
      setSelectedVehicle('');
      setCrossingNotes('');
    } catch (err) {
      setError('Error recording vehicle crossing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-crossing">
      <div className="page-header">
        <h2>🚌 Vehicle Border Crossing</h2>
        <p>Record vehicle entry and exit at border checkpoint</p>
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="crossing-container">
        <div className="crossing-form">
          <div className="form-row">
            <div className="form-group">
              <label>Select Vehicle</label>
              <select 
                value={selectedVehicle} 
                onChange={(e) => setSelectedVehicle(e.target.value)}
              >
                <option value="">Choose a vehicle...</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate_number} - {vehicle.type} ({vehicle.capacity} seats)
                    {vehicle.driver_name && ` - Driver: ${vehicle.driver_name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Crossing Type</label>
              <select 
                value={crossingType} 
                onChange={(e) => setCrossingType(e.target.value)}
              >
                <option value="entry">Entry</option>
                <option value="exit">Exit</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              placeholder="Add any notes about this crossing (optional)..."
              value={crossingNotes}
              onChange={(e) => setCrossingNotes(e.target.value)}
              rows="4"
            />
          </div>

          <button 
            onClick={recordVehicleCrossing} 
            disabled={loading || !selectedVehicle}
            className="submit-btn"
          >
            {loading ? 'Recording...' : `Record ${crossingType.charAt(0).toUpperCase() + crossingType.slice(1)}`}
          </button>
        </div>

        <div className="vehicle-list">
          <h3>Fleet Vehicles</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Driver</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr 
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle.id.toString())}
                  >
                    <td className="plate-number">{vehicle.plate_number}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.capacity} seats</td>
                    <td>{vehicle.driver_name || 'Not assigned'}</td>
                    <td>{vehicle.driver_phone || '-'}</td>
                    <td>
                      <span className={`status-badge status-${vehicle.status || 'active'}`}>
                        {vehicle.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleCrossing;
