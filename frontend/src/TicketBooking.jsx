import React, { useState, useEffect } from 'react';
import { apiCall, handleApiError } from './api';

function TicketBooking() {
  const [passengers, setPassengers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    passengerId: '',
    tripId: '',
    seatNumber: '',
  });

  useEffect(() => {
    fetchPassengers();
    fetchTrips();
    fetchTickets();
  }, []);

  const fetchPassengers = async () => {
    try {
      const data = await apiCall('/passengers');
      setPassengers(data);
    } catch (err) {
      console.error('Error fetching passengers:', err);
    }
  };

  const fetchTrips = async () => {
    try {
      const data = await apiCall('/trips');
      setTrips(data);
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      const data = await apiCall('/tickets');
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
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
    if (!formData.passengerId) {
      setError('Passenger selection is required');
      return false;
    }
    if (!formData.tripId) {
      setError('Trip selection is required');
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
      await apiCall('/tickets', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      alert('Ticket booked successfully!');
      setFormData({ passengerId: '', tripId: '', seatNumber: '' });
      fetchTickets();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Ticket Booking</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Passenger:</label>
          <select name="passengerId" value={formData.passengerId} onChange={handleChange} required disabled={loading}>
            <option value="">Select Passenger</option>
            {passengers.map(passenger => (
              <option key={passenger.id} value={passenger.id}>
                {passenger.name} ({passenger.passport_number})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Trip:</label>
          <select name="tripId" value={formData.tripId} onChange={handleChange} required disabled={loading}>
            <option value="">Select Trip</option>
            {trips.map(trip => (
              <option key={trip.id} value={trip.id}>
                {trip.departure} → {trip.destination} ({new Date(trip.departure_date).toLocaleString()})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Seat Number:</label>
          <input
            type="text"
            name="seatNumber"
            value={formData.seatNumber}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Booking...' : 'Book Ticket'}</button>
      </form>

      <h3>Booked Tickets</h3>
      {tickets.length === 0 && <p>No tickets booked yet.</p>}
      {tickets.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Passenger</th>
              <th>Passport</th>
              <th>Trip</th>
              <th>Departure</th>
              <th>Seat</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.name}</td>
                <td>{ticket.passport_number}</td>
                <td>{ticket.departure} → {ticket.destination}</td>
                <td>{new Date(ticket.departure_date).toLocaleString()}</td>
                <td>{ticket.seat_number || 'N/A'}</td>
                <td>{ticket.status || 'Booked'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TicketBooking;