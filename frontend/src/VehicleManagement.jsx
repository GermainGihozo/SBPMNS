import React, { useState, useEffect } from 'react';
import { apiCall, handleApiError } from './api';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'bus',
    capacity: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/vehicles');
      setVehicles(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
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
    if (!formData.plateNumber.trim()) {
      setError('Plate number is required');
      return false;
    }
    if (!formData.capacity) {
      setError('Capacity is required');
      return false;
    }
    if (isNaN(formData.capacity) || formData.capacity <= 0) {
      setError('Capacity must be a positive number');
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
      await apiCall('/vehicles', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      alert('Vehicle created successfully!');
      setFormData({ plateNumber: '', type: 'bus', capacity: '' });
      fetchVehicles();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Vehicle Management</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Plate Number:</label>
          <input
            type="text"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label>Type:</label>
          <select name="type" value={formData.type} onChange={handleChange} disabled={loading}>
            <option value="bus">Bus</option>
            <option value="truck">Truck</option>
            <option value="car">Car</option>
          </select>
        </div>
        <div>
          <label>Capacity:</label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Adding Vehicle...' : 'Add Vehicle'}</button>
      </form>

      <h3>Existing Vehicles</h3>
      {loading && <p>Loading vehicles...</p>}
      {vehicles.length === 0 && !loading && <p>No vehicles found.</p>}
      {vehicles.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(vehicle => (
              <tr key={vehicle.id}>
                <td>{vehicle.id}</td>
                <td>{vehicle.plate_number}</td>
                <td>{vehicle.type}</td>
                <td>{vehicle.capacity}</td>
                <td>{vehicle.status || 'Active'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VehicleManagement;