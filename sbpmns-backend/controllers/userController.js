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

module.exports = {
  getUsers,
  updateUserRole,
  toggleUserActive,
  deleteUser,
};