import { useState, useEffect } from 'react';
import { apiCall, handleApiError } from './api';
import './BorderControl.css';

function BorderControl() {
  const [activeTab, setActiveTab] = useState('fingerprint'); // 'fingerprint', 'ticket', 'vehicle'
  const [passengers, setPassengers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [borderEntries, setBorderEntries] = useState([]);
  
  // Fingerprint verification
  const [fingerprintInput, setFingerprintInput] = useState('');
  const [verifiedPassenger, setVerifiedPassenger] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Ticket verification
  const [ticketId, setTicketId] = useState('');
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  
  // Vehicle crossing
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [crossingNotes, setCrossingNotes] = useState('');
  const [crossingType, setCrossingType] = useState('entry');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [passengersData, ticketsData, vehiclesData, entriesData] = await Promise.all([
        apiCall('/passengers'),
        apiCall('/tickets'),
        apiCall('/vehicles'),
        apiCall('/border-entries')
      ]);
      setPassengers(passengersData);
      setTickets(ticketsData);
      setVehicles(vehiclesData);
      setBorderEntries(entriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  // Simulate fingerprint scan
  const simulateFingerprintScan = () => {
    setIsScanning(true);
    setError('');
    setSuccess('');
    
    setTimeout(() => {
      // Generate a simulated fingerprint ID
      const simulatedFingerprint = `FP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setFingerprintInput(simulatedFingerprint);
      setIsScanning(false);
      setSuccess('Fingerprint captured! Click "Verify Fingerprint" to check.');
    }, 2000);
  };

  // Verify fingerprint and show passenger info
  const verifyFingerprint = () => {
    setError('');
    setSuccess('');
    setVerifiedPassenger(null);

    if (!fingerprintInput.trim()) {
      setError('Please scan or enter a fingerprint ID');
      return;
    }

    // Find passenger by biometric data
    const passenger = passengers.find(p => p.biometric_data === fingerprintInput);
    
    if (passenger) {
      setVerifiedPassenger(passenger);
      setSuccess('Passenger verified successfully!');
      
      // Check for alerts
      if (passenger.blacklist_reason) {
        setError(`⚠️ WARNING: Passenger is blacklisted - ${passenger.blacklist_reason}`);
      } else if (passenger.health_status !== 'healthy') {
        setError(`⚠️ WARNING: Health status - ${passenger.health_status}`);
      }
    } else {
      setError('Fingerprint not found in system. Passenger not registered.');
    }
  };

  // Verify ticket
  const verifyTicket = () => {
    setError('');
    setSuccess('');
    setVerifiedTicket(null);

    if (!ticketId.trim()) {
      setError('Please enter a ticket ID');
      return;
    }

    const ticket = tickets.find(t => t.id === parseInt(ticketId));
    
    if (ticket) {
      const passenger = passengers.find(p => p.id === ticket.passenger_id);
      const trip = { id: ticket.trip_id }; // In real app, fetch trip details
      
      setVerifiedTicket({
        ...ticket,
        passengerName: passenger?.name || 'Unknown',
        passportNumber: passenger?.passport_number || 'N/A',
        tripInfo: `Trip #${trip.id}`
      });
      setSuccess('Ticket verified successfully!');
    } else {
      setError('Ticket not found in system.');
    }
  };

  // Record vehicle border crossing
  const recordVehicleCrossing = async () => {
    setError('');
    setSuccess('');

    if (!selectedVehicle) {
      setError('Please select a vehicle');
      return;
    }

    setLoading(true);
    try {
      // In a real app, you'd have a vehicle crossing endpoint
      // For now, we'll just show success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Vehicle ${crossingType} recorded successfully!`);
      setSelectedVehicle('');
      setCrossingNotes('');
      fetchData();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-control">
      <div className="border-header">
        <h2>🛂 Border Control Station</h2>
        <p>Verify passengers, tickets, and vehicle crossings</p>
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'fingerprint' ? 'active' : ''}`}
          onClick={() => setActiveTab('fingerprint')}
        >
          👆 Fingerprint Verification
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
          onClick={() => setActiveTab('ticket')}
        >
          🎫 Ticket Verification
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vehicle' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicle')}
        >
          🚌 Vehicle Crossing
        </button>
      </div>

      <div className="tab-content">
        {/* Fingerprint Verification Tab */}
        {activeTab === 'fingerprint' && (
          <div className="verification-section">
            <h3>Fingerprint Verification</h3>
            <p className="section-description">Scan passenger fingerprint to view complete information</p>
            
            <div className="fingerprint-scanner-container">
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
                <h4>Passenger Information</h4>
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
        )}

        {/* Ticket Verification Tab */}
        {activeTab === 'ticket' && (
          <div className="verification-section">
            <h3>Ticket Verification</h3>
            <p className="section-description">Verify passenger tickets for border crossing</p>
            
            <div className="ticket-verification-form">
              <div className="form-group">
                <label>Ticket ID</label>
                <input
                  type="number"
                  placeholder="Enter ticket ID"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                />
              </div>
              <button onClick={verifyTicket} className="verify-btn">
                Verify Ticket
              </button>
            </div>

            {verifiedTicket && (
              <div className="ticket-info-card">
                <h4>Ticket Details</h4>
                <div className="ticket-header">
                  <div className="ticket-id">Ticket #{verifiedTicket.id}</div>
                  <div className={`ticket-status status-${verifiedTicket.status}`}>
                    {verifiedTicket.status}
                  </div>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Passenger Name:</label>
                    <span>{verifiedTicket.passengerName}</span>
                  </div>
                  <div className="info-item">
                    <label>Passport Number:</label>
                    <span>{verifiedTicket.passportNumber}</span>
                  </div>
                  <div className="info-item">
                    <label>Trip:</label>
                    <span>{verifiedTicket.tripInfo}</span>
                  </div>
                  <div className="info-item">
                    <label>Seat Number:</label>
                    <span>{verifiedTicket.seat_number}</span>
                  </div>
                  <div className="info-item">
                    <label>Booking Date:</label>
                    <span>{new Date(verifiedTicket.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="recent-tickets">
              <h4>Recent Tickets</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Passenger ID</th>
                      <th>Trip ID</th>
                      <th>Seat</th>
                      <th>Status</th>
                      <th>Booked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.slice(0, 5).map(ticket => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>{ticket.passenger_id}</td>
                        <td>{ticket.trip_id}</td>
                        <td>{ticket.seat_number}</td>
                        <td>
                          <span className={`status-badge status-${ticket.status}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Crossing Tab */}
        {activeTab === 'vehicle' && (
          <div className="verification-section">
            <h3>Vehicle Border Crossing</h3>
            <p className="section-description">Record vehicle entry and exit at border</p>
            
            <div className="vehicle-crossing-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Select Vehicle</label>
                  <select 
                    value={selectedVehicle} 
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                  >
                    <option value="">Choose a vehicle...</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number} - {vehicle.type} ({vehicle.capacity} seats)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Crossing Type</label>
                  <select 
                    value={crossingType} 
                    onChange={(e) => setCrossingType(e.target.value)}
                  >
                    <option value="entry">Entry</option>
                    <option value="exit">Exit</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  placeholder="Add any notes about this crossing..."
                  value={crossingNotes}
                  onChange={(e) => setCrossingNotes(e.target.value)}
                  rows="3"
                />
              </div>

              <button 
                onClick={recordVehicleCrossing} 
                disabled={loading || !selectedVehicle}
                className="submit-btn"
              >
                {loading ? 'Recording...' : `Record ${crossingType.charAt(0).toUpperCase() + crossingType.slice(1)}`}
              </button>
            </div>

            <div className="vehicle-list">
              <h4>Fleet Vehicles</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Type</th>
                      <th>Capacity</th>
                      <th>Driver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(vehicle => (
                      <tr key={vehicle.id}>
                        <td className="plate-number">{vehicle.plate_number}</td>
                        <td>{vehicle.type}</td>
                        <td>{vehicle.capacity} seats</td>
                        <td>{vehicle.driver_name || 'Not assigned'}</td>
                        <td>
                          <span className={`status-badge status-${vehicle.status || 'active'}`}>
                            {vehicle.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BorderControl;
