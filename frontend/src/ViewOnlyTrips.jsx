import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './TripManagement.css';

function ViewOnlyTrips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsData, vehiclesData] = await Promise.all([
        apiCall('/trips'),
        apiCall('/vehicles')
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.plate_number} (${vehicle.type})` : 'N/A';
  };

  return (
    <div className="trip-management">
      <div className="trip-header">
        <h2>🗺️ View Trips</h2>
        <p>Trip schedules information (Read-Only)</p>
      </div>

      <div className="trip-list-container">
        <h3>Scheduled Trips ({trips.length})</h3>
        {loading && <p className="loading-text">Loading trips...</p>}
        {trips.length === 0 && !loading && <p className="empty-text">No trips found.</p>}
        {trips.length > 0 && (
          <div className="table-wrapper">
            <table className="trip-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Departure</th>
                  <th>Destination</th>
                  <th>Departure Date</th>
                  <th>Vehicle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(trip => (
                  <tr key={trip.id}>
                    <td>{trip.id}</td>
                    <td>{trip.departure}</td>
                    <td>{trip.destination}</td>
                    <td>{new Date(trip.departure_date).toLocaleString()}</td>
                    <td>{getVehicleInfo(trip.vehicle_id)}</td>
                    <td>
                      <span className={`status-badge ${trip.status || 'scheduled'}`}>
                        {trip.status || 'scheduled'}
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

export default ViewOnlyTrips;
