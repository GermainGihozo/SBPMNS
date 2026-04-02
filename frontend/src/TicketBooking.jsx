import React, { useState, useEffect } from 'react';

function TicketBooking() {
  const [passengers, setPassengers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tickets, setTickets] = useState([]);
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

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/tickets', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
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
      const response = await fetch('http://localhost:5001/api/sbpmns/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Ticket booked successfully!');
        setFormData({ passengerId: '', tripId: '', seatNumber: '' });
        fetchTickets();
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error booking ticket');
    }
  };

  return (
    <div>
      <h2>Ticket Booking</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Passenger:</label>
          <select name="passengerId" value={formData.passengerId} onChange={handleChange} required>
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
          <select name="tripId" value={formData.tripId} onChange={handleChange} required>
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
          />
        </div>
        <button type="submit">Book Ticket</button>
      </form>

      <h3>Booked Tickets</h3>
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
              <td>{ticket.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketBooking;