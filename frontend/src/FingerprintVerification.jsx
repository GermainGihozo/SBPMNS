import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './FingerprintVerification.css';

function FingerprintVerification() {
  const [passengers, setPassengers] = useState([]);
  const [fingerprintInput, setFingerprintInput] = useState('');
  const [verifiedPassenger, setVerifiedPassenger] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPassengers();
  }, []);

  const fetchPassengers = async () => {
    try {
      const data = await apiCall('/passengers');
      setPassengers(data);
    } catch (err) {
      console.error('Error fetching passengers:', err);
    }
  };

  const simulateFingerprintScan = () => {
    setIsScanning(true);
    setError('');
    setSuccess('');
    
    setTimeout(() => {
      const simulatedFingerprint = `FP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFingerprintInput(simulatedFingerprint);
      setIsScanning(false);
      setSuccess('Fingerprint captured! Click "Verify Fingerprint" to check.');
    }, 2000);
  };

  const verifyFingerprint = () => {
    setError('');
    setSuccess('');
    setVerifiedPassenger(null);

    if (!fingerprintInput.trim()) {
      setError('Please scan or enter a fingerprint ID');
      return;
    }

    const passenger = passengers.find(p => p.biometric_data === fingerprintInput);
    
    if (passenger) {
      setVerifiedPassenger(passenger);
      setSuccess('Passenger verified successfully!');
      
      if (passenger.blacklist_reason) {
        setError(`⚠️ WARNING: Passenger is blacklisted - ${passenger.blacklist_reason}`);
      } else if (passenger.health_status !== 'healthy') {
        setError(`⚠️ WARNING: Health status - ${passenger.health_status}`);
      }
    } else {
      setError('Fingerprint not found in system. Passenger not registered.');
    }
  };

  return (
    <div className="fingerprint-verification">
      <div className="page-header">
        <h2>👆 Fingerprint Verification</h2>
        <p>Scan passenger fingerprint to view complete information</p>
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="verification-container">
        <div className="scanner-section">
          <div className={`scanner-box ${isScanning ? 'scanning' : ''} ${verifiedPassenger ? 'verified' : ''}`}>
            {!isScanning && !verifiedPassenger && (
              <div className="scanner-idle">
                <span className="scanner-icon">👆</span>
                <p>Ready to scan</p>
              </div>
            )}
            {isScanning && (
              <div className="scanner-active">
                <div className="scan-animation"></div>
                <span className="scanner-icon">👆</span>
                <p>Scanning fingerprint...</p>
              </div>
            )}
            {verifiedPassenger && (
              <div className="scanner-verified">
                <span className="verified-icon">✓</span>
                <p>Verified</p>
              </div>
            )}
          </div>

          <div className="scanner-controls">
            <input
              type="text"
              placeholder="Fingerprint ID (or click scan)"
              value={fingerprintInput}
              onChange={(e) => setFingerprintInput(e.target.value)}
              disabled={isScanning}
            />
            <button 
              onClick={simulateFingerprintScan} 
              disabled={isScanning}
              className="scan-btn"
            >
              {isScanning ? 'Scanning...' : 'Scan Fingerprint'}
            </button>
            <button 
              onClick={verifyFingerprint}
              disabled={isScanning || !fingerprintInput}
              className="verify-btn"
            >
              Verify Fingerprint
            </button>
          </div>
        </div>

        {verifiedPassenger && (
          <div className="passenger-info-card">
            <h3>Passenger Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name:</label>
                <span>{verifiedPassenger.name}</span>
              </div>
              <div className="info-item">
                <label>Passport Number:</label>
                <span>{verifiedPassenger.passport_number}</span>
              </div>
              <div className="info-item">
                <label>Nationality:</label>
                <span>{verifiedPassenger.nationality}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth:</label>
                <span>{verifiedPassenger.date_of_birth}</span>
              </div>
              <div className="info-item">
                <label>Blood Type:</label>
                <span>{verifiedPassenger.blood_type || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <label>Health Status:</label>
                <span className={`status-badge status-${verifiedPassenger.health_status}`}>
                  {verifiedPassenger.health_status}
                </span>
              </div>
              {verifiedPassenger.reference_name && (
                <>
                  <div className="info-item">
                    <label>Reference Person:</label>
                    <span>{verifiedPassenger.reference_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Reference Contact:</label>
                    <span>{verifiedPassenger.reference_contact}</span>
                  </div>
                </>
              )}
              {verifiedPassenger.blacklist_reason && (
                <div className="info-item full-width alert-item">
                  <label>⚠️ Blacklist Reason:</label>
                  <span>{verifiedPassenger.blacklist_reason}</span>
                </div>
              )}
              <div className="info-item">
                <label>Registered:</label>
                <span>{new Date(verifiedPassenger.created_at).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Biometric ID:</label>
                <span className="biometric-id">{verifiedPassenger.biometric_data}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FingerprintVerification;
