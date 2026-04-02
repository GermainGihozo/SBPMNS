const db = require('../config/db');

const createTrip = (req, res) => {
  const { vehicleId, departure, destination, departureDate } = req.body;

  if (!vehicleId || !departure || !destination || !departureDate) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const query = 'INSERT INTO trips (vehicle_id, departure, destination, departure_date) VALUES (?, ?, ?, ?)';
  db.query(query, [vehicleId, departure, destination, departureDate], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Audit log
    const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
    db.query(logQuery, [req.user.id, 'CREATE_TRIP', `Created trip from ${departure} to ${destination}`]);

    res.status(201).json({ message: 'Trip created successfully', id: result.insertId });
  });
};

const getTrips = (req, res) => {
  const query = 'SELECT t.*, v.plate_number, v.type FROM trips t LEFT JOIN vehicles v ON t.vehicle_id = v.id';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

module.exports = {
  createTrip,
  getTrips,
};