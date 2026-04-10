const db = require('../config/db');

const registerPassenger = (req, res) => {
  const { name, passportNumber, nationality, dateOfBirth, bloodType, referenceName, referenceContact, biometricData, healthStatus, blacklistReason } = req.body;

  // Validation
  if (!name || !passportNumber || !nationality || !dateOfBirth) {
    return res.status(400).json({ message: 'Name, passport number, nationality, and date of birth are required' });
  }
  if (name.length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }
  if (!/^[A-Z0-9]{6,}$/i.test(passportNumber)) {
    return res.status(400).json({ message: 'Invalid passport number format (minimum 6 alphanumeric characters)' });
  }
  
  // Check if passport already exists
  const checkQuery = 'SELECT id FROM passengers WHERE passport_number = ?';
  db.query(checkQuery, [passportNumber], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'Passenger with this passport already registered' });
    }

    const insertQuery = 'INSERT INTO passengers (name, passport_number, nationality, date_of_birth, blood_type, reference_name, reference_contact, biometric_data, health_status, blacklist_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [name, passportNumber, nationality, dateOfBirth, bloodType, referenceName, referenceContact, biometricData, healthStatus || 'healthy', blacklistReason], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Log the action
      const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
      db.query(logQuery, [req.user.id, 'REGISTER_PASSENGER', `Registered passenger ${name} with passport ${passportNumber}`], (logErr) => {
        if (logErr) console.error('Audit log error:', logErr);
      });

      res.status(201).json({ message: 'Passenger registered successfully', id: result.insertId });
    });
  });
};

const getPassengers = (req, res) => {
  const query = 'SELECT * FROM passengers';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

module.exports = {
  registerPassenger,
  getPassengers,
};