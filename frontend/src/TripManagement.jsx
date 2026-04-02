import React, { useState, useEffect } from 'react';
import { apiCall, handleApiError } from './api';

function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    vehicleId: '',
    departure: '',
    destination: '',
    departureDate: '',
  });

  useEffect(() => {
    fetchTrips();
    fetchVehicles();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/trips');
      setTrips(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await apiCall('/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.vehicleId) {
      setError('Vehicle selection is required');
      return false;
    }
    if (!formData.departure.trim()) {
      setError('Departure location is required');
      return false;
    }
    if (!formData.destination.trim()) {
      setError('Destination is required');
      return false;
    }
    if (!formData.departureDate) {
      setError('Departure date and time is required');
      return false;
    }
    if (new Date(formData.departureDate) <= new Date()) {
      setError('Departure date must be in the future');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      await apiCall('/trips', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      alert('Trip created successfully!');
      setFormData({ vehicleId: '', departure: '', destination: '', departureDate: '' });
      fetchTrips();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Trip Management</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle:</label>
          <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required disabled={loading}>
            <option value="">Select Vehicle</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate_number} ({vehicle.type})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Departure:</label>
          <input
            type="text"
            name="departure"
            value={formData.departure}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Destination:</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Departure Date & Time:</label>
          <input
            type="datetime-local"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Creating Trip...' : 'Create Trip'}</button>
      </form>

      <h3>Scheduled Trips</h3>
      {loading && <p>Loading trips...</p>}
      {trips.length === 0 && !loading && <p>No trips found.</p>}
      {trips.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trips.map(trip => (
              <tr key={trip.id}>
                <td>{trip.id}</td>
                <td>{trip.plate_number}</td>
                <td>{trip.departure} → {trip.destination}</td>
                <td>{new Date(trip.departure_date).toLocaleString()}</td>
                <td>{trip.status || 'Scheduled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TripManagement;