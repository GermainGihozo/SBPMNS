const db = require('../config/db');

const createVehicle = (req, res) => {
  const { plateNumber, type, capacity } = req.body;

  if (!plateNumber || !type || !capacity) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const query = 'INSERT INTO vehicles (plate_number, type, capacity) VALUES (?, ?, ?)';
  db.query(query, [plateNumber, type, capacity], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Audit log
    const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
    db.query(logQuery, [req.user.id, 'CREATE_VEHICLE', `Created vehicle ${plateNumber}`]);

    res.status(201).json({ message: 'Vehicle created successfully', id: result.insertId });
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