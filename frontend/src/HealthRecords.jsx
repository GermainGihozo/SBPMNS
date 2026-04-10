import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './HealthRecords.css';

function HealthRecords() {
  const [passengers, setPassengers] = useState([]);
  const [filteredPassengers, setFilteredPassengers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPassengers();
  }, []);

  useEffect(() => {
    filterPassengers();
  }, [passengers, searchTerm, healthFilter]);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/passengers');
      setPassengers(data);
    } catch (err) {
      console.error('Error fetching passengers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPassengers = () => {
    let filtered = passengers;

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.passport_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (healthFilter !== 'all') {
      filtered = filtered.filter(p => p.health_status === healthFilter);
    }

    setFilteredPassengers(filtered);
  };

  const getHealthStats = () => {
    const healthy = passengers.filter(p => p.health_status === 'healthy').length;
    const quarantined = passengers.filter(p => p.health_status === 'quarantined').length;
    const infected = passengers.filter(p => p.health_status === 'infected').length;
    const total = passengers.length;

    return { healthy, quarantined, infected, total };
  };

  const stats = getHealthStats();

  return (
    <div className="health-records">
      <div className="page-header">
        <h2>📋 Passenger Health Records</h2>
        <p>View and manage passenger health information</p>
      </div>

      <div className="health-stats">
        <div className="stat-card total">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Passengers</div>
          </div>
        </div>
        
        <div className="stat-card healthy">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.healthy}</div>
            <div className="stat-label">Healthy</div>
          </div>
        </div>
        
        <div className="stat-card quarantined">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.quarantined}</div>
            <div className="stat-label">Quarantined</div>
          </div>
        </div>
        
        <div className="stat-card infected">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.infected}</div>
            <div className="stat-label">Infected</div>
          </div>
        </div>
      </div>

      <div className="records-container">
        <div className="records-header">
          <h3>Health Records Database</h3>
          <div className="records-controls">
            <input
              type="text"
              placeholder="Search by name or passport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={healthFilter} 
              onChange={(e) => setHealthFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="healthy">Healthy</option>
              <option value="quarantined">Quarantined</option>
              <option value="infected">Infected</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading health records...</div>
        ) : (
          <div className="table-wrapper">
            <table className="health-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Passport</th>
                  <th>Nationality</th>
                  <th>Blood Type</th>
                  <th>Health Status</th>
                  <th>Disease/Condition</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPassengers.map(passenger => (
                  <tr key={passenger.id}>
                    <td>#{passenger.id}</td>
                    <td className="passenger-name">{passenger.name}</td>
                    <td>{passenger.passport_number}</td>
                    <td>{passenger.nationality}</td>
                    <td>
                      <span className="blood-type">
                        {passenger.blood_type || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`health-badge status-${passenger.health_status}`}>
                        {passenger.health_status}
                      </span>
                    </td>
                    <td className="disease-info">
                      {passenger.blacklist_reason || 'None reported'}
                    </td>
                    <td>{new Date(passenger.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="view-btn"
                        onClick={() => setSelectedPassenger(passenger)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedPassenger && (
        <div className="modal-overlay" onClick={() => setSelectedPassenger(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Passenger Health Details</h3>
              <button className="close-btn" onClick={() => setSelectedPassenger(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{selectedPassenger.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Passport Number:</label>
                    <span>{selectedPassenger.passport_number}</span>
                  </div>
                  <div className="detail-item">
                    <label>Nationality:</label>
                    <span>{selectedPassenger.nationality}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date of Birth:</label>
                    <span>{selectedPassenger.date_of_birth}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Health Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Blood Type:</label>
                    <span className="blood-type-large">
                      {selectedPassenger.blood_type || 'Not specified'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Health Status:</label>
                    <span className={`health-badge status-${selectedPassenger.health_status}`}>
                      {selectedPassenger.health_status}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Disease/Condition:</label>
                    <span>{selectedPassenger.blacklist_reason || 'None reported'}</span>
                  </div>
                </div>
              </div>

              {selectedPassenger.reference_name && (
                <div className="detail-section">
                  <h4>Emergency Contact</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Contact Name:</label>
                      <span>{selectedPassenger.reference_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Contact Phone:</label>
                      <span>{selectedPassenger.reference_contact}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4>System Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Registration Date:</label>
                    <span>{new Date(selectedPassenger.created_at).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Passenger ID:</label>
                    <span>#{selectedPassenger.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthRecords;
