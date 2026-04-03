import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import VehicleManagement from './VehicleManagement';
import TripManagement from './TripManagement';
import TicketBooking from './TicketBooking';
import BorderControl from './BorderControl';
import UserManagement from './UserManagement';
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
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setRole('');
  };

  const canRegisterPassengers = ['superadmin','companyadmin'].includes(role);
  const canManageOps = ['superadmin','companyadmin'].includes(role);
  const canBorderScan = ['superadmin','borderofficer'].includes(role);
  const canSeeHealth = ['superadmin','healthofficer'].includes(role);
  const isSuperAdmin = role === 'superadmin';

  return (
    <Router>
      <div className="App">
        <header className={`App-header ${isLoggedIn ? 'with-sidebar' : ''}`}>
          <h1>SBPMNS - Smart Border Passenger Management</h1>
          {!isLoggedIn && <p>Please login to access the system.</p>}
        </header>
        
        {isLoggedIn && (
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <span className="sidebar-logo-icon">🛂</span>
                <span>SBPMNS</span>
              </div>
            </div>
            <nav className="sidebar-nav">
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <span className="sidebar-icon">📊</span>
                <span>Dashboard</span>
              </NavLink>
              {canRegisterPassengers && (
                <NavLink to="/" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'} end>
                  <span className="sidebar-icon">📝</span>
                  <span>Registration</span>
                </NavLink>
              )}
              {canManageOps && (
                <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                  <span className="sidebar-icon">🚌</span>
                  <span>Vehicles</span>
                </NavLink>
              )}
              {canManageOps && (
                <NavLink to="/trips" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                  <span className="sidebar-icon">🗺️</span>
                  <span>Trips</span>
                </NavLink>
              )}
              {canManageOps && (
                <NavLink to="/tickets" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                  <span className="sidebar-icon">🎫</span>
                  <span>Tickets</span>
                </NavLink>
              )}
              {canBorderScan && (
                <NavLink to="/border" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                  <span className="sidebar-icon">🛂</span>
                  <span>Border Control</span>
                </NavLink>
              )}
              {isSuperAdmin && (
                <NavLink to="/users" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                  <span className="sidebar-icon">👥</span>
                  <span>User Management</span>
                </NavLink>
              )}
            </nav>
            <div className="sidebar-footer">
              <button onClick={handleLogout} className="logout-btn">
                <span className="sidebar-icon">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </aside>
        )}
        
        <main className={isLoggedIn ? 'main-with-sidebar' : ''}>
          {isLoggedIn ? null : (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <NavLink to="/register" className="link-button">Register New User</NavLink>
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
            <Route path="/users" element={isLoggedIn && isSuperAdmin ? <UserManagement /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;