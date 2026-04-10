import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import PassengerRegistration from './PassengerRegistration';
import VehicleManagement from './VehicleManagement';
import TripManagement from './TripManagement';
import TicketBooking from './TicketBooking';
import FingerprintVerification from './FingerprintVerification';
import TicketVerification from './TicketVerification';
import VehicleCrossing from './VehicleCrossing';
import HealthRecords from './HealthRecords';
import HealthAlerts from './HealthAlerts';
import UserManagement from './UserManagement';
import Reports from './Reports';
import './App.css';

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
        {isLoggedIn && (
          <header className="App-header with-sidebar">
            <h1>SBPMNS - Smart Border Passenger Management</h1>
          </header>
        )}
        
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
                <NavLink to="/registration" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
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
                <>
                  <NavLink to="/fingerprint" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="sidebar-icon">👆</span>
                    <span>Fingerprint</span>
                  </NavLink>
                  <NavLink to="/ticket-verify" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="sidebar-icon">🎫</span>
                    <span>Ticket Verify</span>
                  </NavLink>
                  <NavLink to="/vehicle-crossing" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="sidebar-icon">🚌</span>
                    <span>Vehicle Crossing</span>
                  </NavLink>
                </>
              )}
              {canSeeHealth && (
                <>
                  <NavLink to="/health-records" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="sidebar-icon">📋</span>
                    <span>Health Records</span>
                  </NavLink>
                  <NavLink to="/health-alerts" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                    <span className="sidebar-icon">🔔</span>
                    <span>Health Alerts</span>
                  </NavLink>
                </>
              )}
              <NavLink to="/reports" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <span className="sidebar-icon">📊</span>
                <span>Reports</span>
              </NavLink>
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
          <Routes>
            <Route path="/" element={!isLoggedIn ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
            <Route
              path="/registration"
              element={
                isLoggedIn
                  ? canRegisterPassengers
                    ? <PassengerRegistration />
                    : <div><h3>Access denied: only COMPANY ADMIN / SUPER ADMIN may register passengers.</h3></div>
                  : <Navigate to="/" />
              }
            />
            <Route path="/vehicles" element={isLoggedIn && canManageOps ? <VehicleManagement /> : <Navigate to="/" />} />
            <Route path="/trips" element={isLoggedIn && canManageOps ? <TripManagement /> : <Navigate to="/" />} />
            <Route path="/tickets" element={isLoggedIn && canManageOps ? <TicketBooking /> : <Navigate to="/" />} />
            <Route path="/fingerprint" element={isLoggedIn && canBorderScan ? <FingerprintVerification /> : <Navigate to="/" />} />
            <Route path="/ticket-verify" element={isLoggedIn && canBorderScan ? <TicketVerification /> : <Navigate to="/" />} />
            <Route path="/vehicle-crossing" element={isLoggedIn && canBorderScan ? <VehicleCrossing /> : <Navigate to="/" />} />
            <Route path="/health-records" element={isLoggedIn && canSeeHealth ? <HealthRecords /> : <Navigate to="/" />} />
            <Route path="/health-alerts" element={isLoggedIn && canSeeHealth ? <HealthAlerts /> : <Navigate to="/" />} />
            <Route path="/reports" element={isLoggedIn ? <Reports /> : <Navigate to="/" />} />
            <Route path="/users" element={isLoggedIn && isSuperAdmin ? <UserManagement /> : <Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;