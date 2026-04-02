const db = require('../config/db');

const bookTicket = (req, res) => {
  const { passengerId, tripId, seatNumber } = req.body;

  if (!passengerId || !tripId) {
    return res.status(400).json({ message: 'Passenger and trip required' });
  }

  // Check if passenger exists and is not blacklisted
  const checkPassenger = 'SELECT health_status, blacklist_reason FROM passengers WHERE id = ?';
  db.query(checkPassenger, [passengerId], (err, passengerResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (passengerResults.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    const passenger = passengerResults[0];
    if (passenger.blacklist_reason) {
      return res.status(403).json({ message: 'Passenger is blacklisted', reason: passenger.blacklist_reason });
    }
    if (passenger.health_status === 'quarantined') {
      return res.status(403).json({ message: 'Passenger is under quarantine' });
    }

    // Check if trip exists and has capacity
    const checkTrip = 'SELECT t.*, v.capacity, COUNT(tk.id) as booked FROM trips t LEFT JOIN vehicles v ON t.vehicle_id = v.id LEFT JOIN tickets tk ON t.id = tk.trip_id WHERE t.id = ? GROUP BY t.id';
    db.query(checkTrip, [tripId], (err, tripResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }
      if (tripResults.length === 0) {
        return res.status(404).json({ message: 'Trip not found' });
      }

      const trip = tripResults[0];
      if (trip.booked >= trip.capacity) {
        return res.status(400).json({ message: 'Trip is fully booked' });
      }

      // Book ticket
      const insertQuery = 'INSERT INTO tickets (passenger_id, trip_id, seat_number) VALUES (?, ?, ?)';
      db.query(insertQuery, [passengerId, tripId, seatNumber], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Database error' });
        }

        // Audit log
        const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
        db.query(logQuery, [req.user.id, 'BOOK_TICKET', `Booked ticket for passenger ${passengerId} on trip ${tripId}`], (logErr) => {
          if (logErr) console.error('Audit log error:', logErr);
        });

        res.status(201).json({ message: 'Ticket booked successfully', id: result.insertId });
      });
    });
  });
};

const getTickets = (req, res) => {
  const query = 'SELECT tk.*, p.name, p.passport_number, t.departure, t.destination, t.departure_date FROM tickets tk JOIN passengers p ON tk.passenger_id = p.id JOIN trips t ON tk.trip_id = t.id';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

module.exports = {
  bookTicket,
  getTickets,
};