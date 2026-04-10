import React, { useState, useEffect } from 'react';
import { apiCall, handleApiError } from './api';
import './VehicleManagement.css';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'bus',
    capacity: '',
    driverName: '',
    driverPhone: '',
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
    setSuccess('');
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
    if (formData.driverPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.driverPhone)) {
      setError('Invalid phone number format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiCall('/vehicles', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSuccess('Vehicle added successfully!');
      setFormData({ plateNumber: '', type: 'bus', capacity: '', driverName: '', driverPhone: '' });
      fetchVehicles();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-management">
      <div className="vehicle-header">
        <h2>Vehicle Management</h2>
        <p>Manage fleet vehicles and driver assignments</p>
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="vehicle-form-container">
        <h3>Add New Vehicle</h3>
        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label>Plate Number <span className="required">*</span></label>
              <input
                type="text"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                placeholder="e.g., RAB 123A"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Vehicle Type <span className="required">*</span></label>
              <select name="type" value={formData.type} onChange={handleChange} disabled={loading}>
                <option value="bus">Bus</option>
                <option value="truck">Truck</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="minibus">Minibus</option>
              </select>
            </div>

            <div className="form-group">
              <label>Capacity <span className="required">*</span></label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Number of seats"
                required
                disabled={loading}
                min="1"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Driver Name</label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="Enter driver's full name"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Driver Phone</label>
              <input
                type="tel"
                name="driverPhone"
                value={formData.driverPhone}
                onChange={handleChange}
                placeholder="e.g., +250 788 123 456"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding Vehicle...' : '+ Add Vehicle'}
          </button>
        </form>
      </div>

      <div className="vehicle-list-container">
        <h3>Fleet Vehicles ({vehicles.length})</h3>
        {loading && <p className="loading-text">Loading vehicles...</p>}
        {vehicles.length === 0 && !loading && <p className="empty-text">No vehicles found. Add your first vehicle above.</p>}
        {vehicles.length > 0 && (
          <div className="table-wrapper">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Driver Name</th>
                  <th>Driver Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td className="plate-number">{vehicle.plate_number}</td>
                    <td>
                      <span className={`vehicle-type ${vehicle.type}`}>
                        {vehicle.type}
                      </span>
                    </td>
                    <td>{vehicle.capacity} seats</td>
                    <td>{vehicle.driver_name || <span className="no-data">Not assigned</span>}</td>
                    <td>{vehicle.driver_phone || <span className="no-data">-</span>}</td>
                    <td>
                      <span className={`status-badge ${vehicle.status || 'active'}`}>
                        {vehicle.status || 'active'}
                      </span>
                    </td>
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

export default VehicleManagement;