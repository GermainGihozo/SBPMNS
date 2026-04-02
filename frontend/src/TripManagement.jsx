import React, { useState, useEffect } from 'react';

function TripManagement() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
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
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/trips', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

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
      const response = await fetch('http://localhost:5001/api/sbpmns/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Trip created successfully!');
        setFormData({ vehicleId: '', departure: '', destination: '', departureDate: '' });
        fetchTrips();
      } else {
        alert('Error creating trip');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating trip');
    }
  };

  return (
    <div>
      <h2>Trip Management</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle:</label>
          <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
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
          />
        </div>
        <button type="submit">Create Trip</button>
      </form>

      <h3>Scheduled Trips</h3>
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
              <td>{trip.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TripManagement;