const express = require("express");
const router = express.Router();
const db = require('../config/db');
const { registerPassenger, getPassengers } = require('../controllers/passengerController');
const { registerUser, loginUser } = require('../controllers/authController');
const { createVehicle, getVehicles } = require('../controllers/vehicleController');
const { createTrip, getTrips } = require('../controllers/tripController');
const { bookTicket, getTickets } = require('../controllers/ticketController');
const { createBorderEntry, updateBorderExit, getBorderEntries } = require('../controllers/borderEntryController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.post('/passengers', authenticateToken, authorizeRole(['officer', 'admin']), registerPassenger);
router.get('/passengers', authenticateToken, authorizeRole(['officer', 'admin', 'health']), getPassengers);

router.post('/vehicles', authenticateToken, authorizeRole(['admin']), createVehicle);
router.get('/vehicles', authenticateToken, authorizeRole(['officer', 'admin']), getVehicles);

router.post('/trips', authenticateToken, authorizeRole(['admin']), createTrip);
router.get('/trips', authenticateToken, authorizeRole(['officer', 'admin']), getTrips);

router.post('/tickets', authenticateToken, authorizeRole(['officer', 'admin']), bookTicket);
router.get('/tickets', authenticateToken, authorizeRole(['officer', 'admin']), getTickets);

router.post('/border-entries', authenticateToken, authorizeRole(['officer', 'admin']), createBorderEntry);
router.put('/border-entries/:id/exit', authenticateToken, authorizeRole(['officer', 'admin']), updateBorderExit);
router.get('/border-entries', authenticateToken, authorizeRole(['officer', 'admin', 'health']), getBorderEntries);

router.get('/audit-logs', authenticateToken, authorizeRole(['admin']), (req, res) => {
  const query = 'SELECT al.*, u.username FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.timestamp DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

module.exports = router;