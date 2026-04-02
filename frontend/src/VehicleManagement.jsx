import React, { useState, useEffect } from 'react';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: 'bus',
    capacity: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/vehicles', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Vehicle created successfully!');
        setFormData({ plateNumber: '', type: 'bus', capacity: '' });
        fetchVehicles();
      } else {
        alert('Error creating vehicle');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating vehicle');
    }
  };

  return (
    <div>
      <h2>Vehicle Management</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Plate Number:</label>
          <input
            type="text"
            name="plateNumber"
            value={formData.plateNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Type:</label>
          <select name="type" value={formData.type} onChange={handleChange}>
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
          />
        </div>
        <button type="submit">Add Vehicle</button>
      </form>

      <h3>Existing Vehicles</h3>
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
              <td>{vehicle.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default VehicleManagement;