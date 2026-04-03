const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const validRoles = ['superadmin', 'companyadmin', 'borderofficer', 'healthofficer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  // Public register only allows non-super roles to prevent elevation abuse.
  if (role === 'superadmin') {
    return res.status(403).json({ message: 'Cannot register superadmin over public endpoint' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  db.query(query, [username, hashedPassword, role], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    if (user.is_active === 0) {
      return res.status(403).json({ message: 'User account is deactivated' });
    }

    const roleMap = {
      admin: 'companyadmin',
      officer: 'borderofficer',
      health: 'healthofficer',
    };
    const userRole = roleMap[user.role] || user.role;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: userRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: userRole });
  });
};

module.exports = {
  registerUser,
  loginUser,
};