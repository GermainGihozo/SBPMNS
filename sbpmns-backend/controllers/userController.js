const db = require('../config/db');

const getUsers = (req, res) => {
  const query = 'SELECT id, username, role, is_active FROM users';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
};

const updateUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['superadmin', 'companyadmin', 'borderofficer', 'healthofficer'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const query = 'UPDATE users SET role = ? WHERE id = ?';
  db.query(query, [role, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Role updated successfully' });
  });
};

const createUser = async (req, res) => {
  const { username, password, role } = req.body;
  const validRoles = ['superadmin', 'companyadmin', 'borderofficer', 'healthofficer'];

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields required' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only superadmin can create users' });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';

  db.query(query, [username, hashedPassword, role], (err, result) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'User created successfully' });
  });
};

const toggleUserActive = (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const query = 'UPDATE users SET is_active = ? WHERE id = ?';
  db.query(query, [is_active ? 1 : 0, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User status updated successfully' });
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
};

const getDashboardData = (req, res) => {
  const role = req.user.role;

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

  const response = {
    role,
    passengers: [],
    borderEntries: [],
    trips: [],
    vehicles: [],
    tickets: [],
    users: [],
    auditLogs: [],
    alerts: [],
  };

  Promise.all([
    query('SELECT * FROM passengers'),
    ['superadmin', 'borderofficer', 'healthofficer'].includes(role) ? query('SELECT be.*, p.name FROM border_entries be LEFT JOIN passengers p ON be.passenger_id = p.id ORDER BY be.entry_time DESC LIMIT 20') : Promise.resolve([]),
    ['superadmin', 'companyadmin'].includes(role) ? query('SELECT * FROM trips') : Promise.resolve([]),
    ['superadmin', 'companyadmin'].includes(role) ? query('SELECT * FROM vehicles') : Promise.resolve([]),
    ['superadmin', 'companyadmin'].includes(role) ? query('SELECT * FROM tickets') : Promise.resolve([]),
    role === 'superadmin' ? query('SELECT id, username, role, is_active FROM users') : Promise.resolve([]),
    role === 'superadmin' ? query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20') : Promise.resolve([]),
  ])
    .then(([passengers, borderEntries, trips, vehicles, tickets, users, auditLogs]) => {
      response.passengers = passengers;
      response.borderEntries = borderEntries;
      response.trips = trips;
      response.vehicles = vehicles;
      response.tickets = tickets;
      response.users = users;
      response.auditLogs = auditLogs;
      response.alerts = passengers.filter(p => p.blacklist_reason || p.health_status !== 'healthy');

      res.json(response);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ message: 'Error fetching dashboard data' });
    });
};

module.exports = {
  getUsers,
  createUser,
  updateUserRole,
  toggleUserActive,
  deleteUser,
  getDashboardData,
};