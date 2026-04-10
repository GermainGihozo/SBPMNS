import React, { useState } from 'react';
import API_BASE_URL from './config';
import './PassengerRegistration.css';

function PassengerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
    bloodType: '',
    referenceName: '',
    referenceContact: '',
    biometricData: null,
    healthStatus: 'healthy',
    blacklistReason: '',
  });

  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setMessage({ type: '', text: '' });
  };

  const handleBiometricScan = () => {
    setIsScanning(true);
    // Simulate biometric scan with progress
    setTimeout(() => {
      const fingerprintTemplate = `FP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFormData({
        ...formData,
        biometricData: fingerprintTemplate,
      });
      setIsScanning(false);
      setMessage({ type: 'success', text: 'Fingerprint captured successfully!' });
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.biometricData) {
      setMessage({ type: 'error', text: 'Please scan fingerprint before submitting' });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/passengers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Passenger registered successfully!' });
        // Reset form
        setFormData({
          name: '',
          passportNumber: '',
          nationality: '',
          dateOfBirth: '',
          bloodType: '',
          referenceName: '',
          referenceContact: '',
          biometricData: null,
          healthStatus: 'healthy',
          blacklistReason: '',
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error connecting to server' });
    }
  };

  return (
    <div className="passenger-registration">
      <div className="registration-header">
        <h2>Passenger Registration</h2>
        <p>Register new passengers with biometric data</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Passport Number <span className="required">*</span></label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="e.g., AB123456"
                required
              />
            </div>

            <div className="form-group">
              <label>Nationality <span className="required">*</span></label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Enter nationality"
                required
              />
            </div>

            <div className="form-group">
              <label>Date of Birth <span className="required">*</span></label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Blood Type</label>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Reference Person</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Reference Name</label>
              <input
                type="text"
                name="referenceName"
                value={formData.referenceName}
                onChange={handleChange}
                placeholder="Emergency contact name"
              />
            </div>

            <div className="form-group">
              <label>Reference Contact</label>
              <input
                type="tel"
                name="referenceContact"
                value={formData.referenceContact}
                onChange={handleChange}
                placeholder="Phone number or email"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Biometric Data</h3>
          <div className="biometric-section">
            <div className="fingerprint-scanner">
              <div className={`scanner-display ${isScanning ? 'scanning' : ''} ${formData.biometricData ? 'captured' : ''}`}>
                {!formData.biometricData && !isScanning && (
                  <div className="scanner-placeholder">
                    <span className="fingerprint-icon">👆</span>
                    <p>No fingerprint captured</p>
                  </div>
                )}
                {isScanning && (
                  <div className="scanner-active">
                    <div className="scan-line"></div>
                    <span className="fingerprint-icon">👆</span>
                    <p>Scanning...</p>
                  </div>
                )}
                {formData.biometricData && !isScanning && (
                  <div className="scanner-success">
                    <span className="success-icon">✓</span>
                    <p>Fingerprint Captured</p>
                    <small>{formData.biometricData}</small>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleBiometricScan}
                disabled={isScanning}
                className="scan-btn"
              >
                {isScanning ? 'Scanning...' : formData.biometricData ? 'Rescan Fingerprint' : 'Scan Fingerprint'}
              </button>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Health & Security</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Health Status <span className="required">*</span></label>
              <select name="healthStatus" value={formData.healthStatus} onChange={handleChange}>
                <option value="healthy">Healthy</option>
                <option value="quarantined">Quarantined</option>
                <option value="infected">Infected</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Blacklist Reason (if applicable)</label>
              <textarea
                name="blacklistReason"
                value={formData.blacklistReason}
                onChange={handleChange}
                placeholder="Leave empty if not blacklisted"
                rows="3"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Register Passenger
          </button>
        </div>
      </form>
    </div>
  );
}

export default PassengerRegistration;
