const express = require("express");
const router = express.Router();
const db = require('../config/db');
const { registerPassenger, getPassengers } = require('../controllers/passengerController');
const { registerUser, loginUser } = require('../controllers/authController');
const { createVehicle, getVehicles } = require('../controllers/vehicleController');
const { createTrip, getTrips } = require('../controllers/tripController');
const { bookTicket, getTickets } = require('../controllers/ticketController');
const { createBorderEntry, updateBorderExit, getBorderEntries } = require('../controllers/borderEntryController');
const { getUsers, createUser, updateUserRole, toggleUserActive, deleteUser, getDashboardData } = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/passengers', authenticateToken, authorizeRole(['superadmin','companyadmin']), registerPassenger);
router.get('/passengers', authenticateToken, authorizeRole(['superadmin','companyadmin','borderofficer','healthofficer']), getPassengers);

router.post('/vehicles', authenticateToken, authorizeRole(['superadmin','companyadmin']), createVehicle);
router.get('/vehicles', authenticateToken, authorizeRole(['superadmin','companyadmin','borderofficer']), getVehicles);

router.post('/trips', authenticateToken, authorizeRole(['superadmin','companyadmin']), createTrip);
router.get('/trips', authenticateToken, authorizeRole(['superadmin','companyadmin','borderofficer']), getTrips);

router.post('/tickets', authenticateToken, authorizeRole(['superadmin','companyadmin']), bookTicket);
router.get('/tickets', authenticateToken, authorizeRole(['superadmin','companyadmin','borderofficer']), getTickets);

router.post('/border-entries', authenticateToken, authorizeRole(['superadmin','borderofficer']), createBorderEntry);
router.put('/border-entries/:id/exit', authenticateToken, authorizeRole(['superadmin','borderofficer']), updateBorderExit);
router.get('/border-entries', authenticateToken, authorizeRole(['superadmin','borderofficer','healthofficer']), getBorderEntries);

router.get('/dashboard', authenticateToken, getDashboardData);

router.get('/audit-logs', authenticateToken, authorizeRole(['superadmin']), (req, res) => {
  const query = 'SELECT al.*, u.username FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.timestamp DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Superadmin user management endpoints
router.post('/users', authenticateToken, authorizeRole(['superadmin']), createUser);
router.get('/users', authenticateToken, authorizeRole(['superadmin']), getUsers);
router.put('/users/:id/role', authenticateToken, authorizeRole(['superadmin']), updateUserRole);
router.put('/users/:id/active', authenticateToken, authorizeRole(['superadmin']), toggleUserActive);
router.delete('/users/:id', authenticateToken, authorizeRole(['superadmin']), deleteUser);

module.exports = router;