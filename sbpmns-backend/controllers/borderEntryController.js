const db = require('../config/db');

const createBorderEntry = (req, res) => {
  const { passengerId, entryTime, notes } = req.body;

  if (!passengerId) {
    return res.status(400).json({ message: 'Passenger ID required' });
  }

  // Check passenger
  const checkPassenger = 'SELECT name, health_status, blacklist_reason FROM passengers WHERE id = ?';
  db.query(checkPassenger, [passengerId], (err, passengerResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (passengerResults.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    const passenger = passengerResults[0];
    let alerts = [];

    if (passenger.blacklist_reason) {
      alerts.push(`BLACKLIST ALERT: ${passenger.blacklist_reason}`);
    }
    if (passenger.health_status !== 'healthy') {
      alerts.push(`HEALTH ALERT: ${passenger.health_status}`);
    }

    const insertQuery = 'INSERT INTO border_entries (passenger_id, entry_time, officer_id, notes) VALUES (?, ?, ?, ?)';
    db.query(insertQuery, [passengerId, entryTime || new Date(), req.user.id, notes], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Audit log
      const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
      db.query(logQuery, [req.user.id, 'BORDER_ENTRY', `Border entry for passenger ${passenger.name}`]);

      res.status(201).json({
        message: 'Border entry recorded',
        id: result.insertId,
        alerts: alerts.length > 0 ? alerts : null
      });
    });
  });
};

const updateBorderExit = (req, res) => {
  const { id, exitTime, notes } = req.body;

  const query = 'UPDATE border_entries SET exit_time = ?, notes = CONCAT(IFNULL(notes, ""), ?), status = "exited" WHERE id = ?';
  db.query(query, [exitTime || new Date(), notes ? ` | Exit notes: ${notes}` : '', id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }

    // Audit log
    const logQuery = 'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)';
    db.query(logQuery, [req.user.id, 'BORDER_EXIT', `Border exit for entry ${id}`]);

    res.json({ message: 'Border exit recorded' });
  });
};

const getBorderEntries = (req, res) => {
  const query = 'SELECT be.*, p.name, p.passport_number, u.username as officer FROM border_entries be JOIN passengers p ON be.passenger_id = p.id LEFT JOIN users u ON be.officer_id = u.id ORDER BY be.entry_time DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

module.exports = {
  createBorderEntry,
  updateBorderExit,
  getBorderEntries,
};