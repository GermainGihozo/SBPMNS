const db = require('../config/db');

const createTrip = (req, res) => {
  const { vehicleId, departure, destination, departureDate } = req.body;

  if (!vehicleId || !departure || !destination || !departureDate) {
    return res.status(400).json({ message: 'All fields required' });
  }

  // Validate that vehicleId is a positive number
  if (isNaN(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ message: 'Invalid vehicle ID' });
  }

  // Validate departure date is in the future
  const tripDate = new Date(departureDate);
  if (tripDate < new Date()) {
    return res.status(400).json({ message: 'Departure date must be in the future' });
  }

  // Check if vehicle exists
  const checkVehicle = 'SELECT id FROM vehicles WHERE id = ?';
  db.query(checkVehicle, [vehicleId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const query = 'INSERT INTO trips (vehicle_id, departure, destination, departure_date) VALUES (?, ?, ?, ?)';
    db.query(query, [vehicleId, departure, destination, departureDate], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Audit log
      const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
      db.query(logQuery, [req.user.id, 'CREATE_TRIP', `Created trip from ${departure} to ${destination}`], (logErr) => {
        if (logErr) console.error('Audit log error:', logErr);
      });

      res.status(201).json({ message: 'Trip created successfully', id: result.insertId });
    });
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