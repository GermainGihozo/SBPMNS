const db = require('../config/db');

const createVehicle = (req, res) => {
  const { plateNumber, type, capacity, driverName, driverPhone } = req.body;

  if (!plateNumber || !type || !capacity) {
    return res.status(400).json({ message: 'Plate number, type, and capacity are required' });
  }

  // Validate capacity is a positive number
  if (isNaN(capacity) || capacity <= 0) {
    return res.status(400).json({ message: 'Capacity must be a positive number' });
  }

  // Check if plate already exists
  const checkQuery = 'SELECT id FROM vehicles WHERE plate_number = ?';
  db.query(checkQuery, [plateNumber], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'Vehicle with this plate number already exists' });
    }

    const query = 'INSERT INTO vehicles (plate_number, type, capacity, driver_name, driver_phone) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [plateNumber, type, capacity, driverName, driverPhone], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Audit log
      const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
      db.query(logQuery, [req.user.id, 'CREATE_VEHICLE', `Created vehicle ${plateNumber} with driver ${driverName || 'N/A'}`], (logErr) => {
        if (logErr) console.error('Audit log error:', logErr);
      });

      res.status(201).json({ message: 'Vehicle created successfully', id: result.insertId });
    });
  });
};

const getVehicles = (req, res) => {
  const query = 'SELECT * FROM vehicles';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

module.exports = {
  createVehicle,
  getVehicles,
};