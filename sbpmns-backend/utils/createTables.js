const db = require('../config/db');

// Create tables
const createTables = () => {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('superadmin','companyadmin','borderofficer','healthofficer','policeofficer','immigrationofficer','admin','officer','health') NOT NULL,
      is_active TINYINT(1) DEFAULT 1
    )
  `;

  const passengersTable = `
    CREATE TABLE IF NOT EXISTS passengers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      passport_number VARCHAR(255) UNIQUE NOT NULL,
      nationality VARCHAR(255) NOT NULL,
      date_of_birth DATE NOT NULL,
      blood_type VARCHAR(10),
      reference_name VARCHAR(255),
      reference_contact VARCHAR(50),
      biometric_data TEXT,
      health_status VARCHAR(50) DEFAULT 'healthy',
      blacklist_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const vehiclesTable = `
    CREATE TABLE IF NOT EXISTS vehicles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plate_number VARCHAR(50) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL,
      capacity INT NOT NULL,
      driver_name VARCHAR(255),
      driver_phone VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active'
    )
  `;

  const tripsTable = `
    CREATE TABLE IF NOT EXISTS trips (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vehicle_id INT,
      departure VARCHAR(255) NOT NULL,
      destination VARCHAR(255) NOT NULL,
      departure_date DATETIME NOT NULL,
      status VARCHAR(50) DEFAULT 'scheduled',
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    )
  `;

  const ticketsTable = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      passenger_id INT,
      trip_id INT,
      seat_number VARCHAR(10),
      status VARCHAR(50) DEFAULT 'booked',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (passenger_id) REFERENCES passengers(id),
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    )
  `;

  const borderEntriesTable = `
    CREATE TABLE IF NOT EXISTS border_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      passenger_id INT,
      entry_time DATETIME,
      exit_time DATETIME,
      status VARCHAR(50) DEFAULT 'entered',
      officer_id INT,
      notes TEXT,
      FOREIGN KEY (passenger_id) REFERENCES passengers(id),
      FOREIGN KEY (officer_id) REFERENCES users(id)
    )
  `;

  const auditLogsTable = `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      action VARCHAR(255) NOT NULL,
      details TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `;

  const queries = [usersTable, passengersTable, vehiclesTable, tripsTable, ticketsTable, borderEntriesTable, auditLogsTable];

  let completedQueries = 0;
  const totalQueries = queries.length;

  queries.forEach(query => {
    db.query(query, (err) => {
      if (err) {
        console.error('Error creating table:', err.sql);
        console.error('Error details:', err);
      }
      completedQueries++;
      if (completedQueries === totalQueries) {
        console.log('All tables verified/created successfully');
        
        // Only seed users if the users table is empty
        db.query('SELECT COUNT(*) as count FROM users', (err, results) => {
          if (err) {
            console.error('Error checking users table:', err);
            return;
          }
          
          const userCount = results[0].count;
          
          if (userCount === 0) {
            console.log('Users table is empty. Seeding default users...');
            const bcrypt = require('bcryptjs');

            const seedUsers = [
              { username: 'superadmin', password: 'admin123', role: 'superadmin' },
              { username: 'companyadmin', password: 'company123', role: 'companyadmin' },
              { username: 'borderofficer', password: 'border123', role: 'borderofficer' },
              { username: 'healthofficer', password: 'health123', role: 'healthofficer' },
              { username: 'policeofficer', password: 'police123', role: 'policeofficer' },
              { username: 'immigrationofficer', password: 'immigration123', role: 'immigrationofficer' },
            ];

            seedUsers.forEach(user => {
              bcrypt.hash(user.password, 10, (err, hashedPassword) => {
                if (err) {
                  console.error('Error hashing password for', user.username, err);
                  return;
                }
                const insertUser = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
                db.query(insertUser, [user.username, hashedPassword, user.role], (err) => {
                  if (err) {
                    console.error(`Error inserting ${user.username} user:`, err);
                  } else {
                    console.log(`Default ${user.username} user created successfully`);
                  }
                });
              });
            });
          } else {
            console.log(`Users table already has ${userCount} user(s). Skipping seed.`);
          }
        });
      }
    });
  });
};

module.exports = createTables;