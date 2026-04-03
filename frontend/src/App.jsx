import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import VehicleManagement from './VehicleManagement';
import TripManagement from './TripManagement';
import TicketBooking from './TicketBooking';
import BorderControl from './BorderControl';
import './App.css';

function Registration() {
  const [formData, setFormData] = useState({
    name: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
    biometricData: null,
    healthStatus: 'healthy',
    blacklistReason: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBiometricScan = () => {
    // Simulate biometric scan
    setFormData({
      ...formData,
      biometricData: 'Simulated fingerprint template',
    });
    alert('Biometric scan simulated successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5001/api/sbpmns/passengers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Passenger registered successfully!');
        setFormData({
          name: '',
          passportNumber: '',
          nationality: '',
          dateOfBirth: '',
          biometricData: null,
        });
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error registering passenger');
    }
  };

  return (
    <div>
      <h2>Passenger Registration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Passport Number:</label>
          <input
            type="text"
            name="passportNumber"
            value={formData.passportNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nationality:</label>
          <input
            type="text"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Date of Birth:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Biometric Data:</label>
          <button type="button" onClick={handleBiometricScan}>
            Scan Fingerprint
          </button>
          {formData.biometricData && <p>Scanned: {formData.biometricData}</p>}
        </div>
        <div>
          <label>Health Status:</label>
          <select name="healthStatus" value={formData.healthStatus} onChange={handleChange}>
            <option value="healthy">Healthy</option>
            <option value="quarantined">Quarantined</option>
            <option value="infected">Infected</option>
          </select>
        </div>
        <div>
          <label>Blacklist Reason (if applicable):</label>
          <input
            type="text"
            name="blacklistReason"
            value={formData.blacklistReason}
            onChange={handleChange}
            placeholder="Leave empty if not blacklisted"
          />
        </div>
        <button type="submit">Register Passenger</button>
      </form>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (token && storedRole) {
      setIsLoggedIn(true);
      setRole(storedRole);
    }
  }, []);

  const handleLogin = (userRole) => {
    setIsLoggedIn(true);
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setRole('');
  };

  const canRegisterPassengers = ['superadmin','companyadmin'].includes(role);
  const canManageOps = ['superadmin','companyadmin'].includes(role);
  const canBorderScan = ['superadmin','borderofficer'].includes(role);
  const canSeeHealth = ['superadmin','healthofficer'].includes(role);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>SBPMNS - Smart Border Passenger Management</h1>
          {isLoggedIn ? (
            <nav>
              <Link to="/dashboard">Dashboard</Link>
              {canRegisterPassengers && <><span> | </span><Link to="/">Registration</Link></>}
              {canManageOps && <><span> | </span><Link to="/vehicles">Vehicles</Link></>}
              {canManageOps && <><span> | </span><Link to="/trips">Trips</Link></>}
              {canManageOps && <><span> | </span><Link to="/tickets">Tickets</Link></>}
              {canBorderScan && <><span> | </span><Link to="/border">Border Control</Link></>}
              {canSeeHealth && <><span> | </span><Link to="/dashboard?tab=health">Health</Link></>}
              <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
            </nav>
          ) : (
            <p>Please login to access the system.</p>
          )}
        </header>
        <main>
          {isLoggedIn ? null : (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Link to="/register" className="link-button">Register New User</Link>
            </div>
          )}
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                isLoggedIn
                  ? canRegisterPassengers
                    ? <Registration />
                    : <div><h3>Access denied: only COMPANY ADMIN / SUPER ADMIN may register passengers.</h3></div>
                  : <Navigate to="/login" />
              }
            />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/vehicles" element={isLoggedIn && canManageOps ? <VehicleManagement /> : <Navigate to="/" />} />
            <Route path="/trips" element={isLoggedIn && canManageOps ? <TripManagement /> : <Navigate to="/" />} />
            <Route path="/tickets" element={isLoggedIn && canManageOps ? <TicketBooking /> : <Navigate to="/" />} />
            <Route path="/border" element={isLoggedIn && canBorderScan ? <BorderControl /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;