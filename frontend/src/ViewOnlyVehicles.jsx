import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './VehicleManagement.css';

function ViewOnlyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await apiCall('/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vehicle-management">
      <div className="vehicle-header">
        <h2>🚌 View Vehicles</h2>
        <p>Fleet vehicles information (Read-Only)</p>
      </div>

      <div className="vehicle-list-container">
        <h3>Fleet Vehicles ({vehicles.length})</h3>
        {loading && <p className="loading-text">Loading vehicles...</p>}
        {vehicles.length === 0 && !loading && <p className="empty-text">No vehicles found.</p>}
        {vehicles.length > 0 && (
          <div className="table-wrapper">
            <table className="vehicle-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plate Number</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Driver Name</th>
                  <th>Driver Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(vehicle => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td className="plate-number">{vehicle.plate_number}</td>
                    <td>
                      <span className={`vehicle-type ${vehicle.type}`}>
                        {vehicle.type}
                      </span>
                    </td>
                    <td>{vehicle.capacity} seats</td>
                    <td>{vehicle.driver_name || 'Not assigned'}</td>
                    <td>{vehicle.driver_phone || '-'}</td>
                    <td>
                      <span className={`status-badge ${vehicle.status || 'active'}`}>
                        {vehicle.status || 'active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewOnlyVehicles;
