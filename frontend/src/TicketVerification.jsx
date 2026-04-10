import { useState, useEffect } from 'react';
import { apiCall } from './api';
import './TicketVerification.css';

function TicketVerification() {
  const [tickets, setTickets] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [ticketId, setTicketId] = useState('');
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsData, passengersData] = await Promise.all([
        apiCall('/tickets'),
        apiCall('/passengers')
      ]);
      setTickets(ticketsData);
      setPassengers(passengersData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

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
      
      setVerifiedTicket({
        ...ticket,
        passengerName: passenger?.name || 'Unknown',
        passportNumber: passenger?.passport_number || 'N/A',
        nationality: passenger?.nationality || 'N/A',
        healthStatus: passenger?.health_status || 'unknown',
        tripInfo: `Trip #${ticket.trip_id}`
      });
      setSuccess('Ticket verified successfully!');
    } else {
      setError('Ticket not found in system.');
    }
  };

  return (
    <div className="ticket-verification">
      <div className="page-header">
        <h2>🎫 Ticket Verification</h2>
        <p>Verify passenger tickets for border crossing</p>
      </div>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      <div className="verification-container">
        <div className="ticket-form">
          <div className="form-group">
            <label>Ticket ID</label>
            <input
              type="number"
              placeholder="Enter ticket ID"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && verifyTicket()}
            />
          </div>
          <button onClick={verifyTicket} className="verify-btn">
            Verify Ticket
          </button>
        </div>

        {verifiedTicket && (
          <div className="ticket-info-card">
            <div className="ticket-header">
              <div className="ticket-id">Ticket #{verifiedTicket.id}</div>
              <div className={`ticket-status status-${verifiedTicket.status}`}>
                {verifiedTicket.status}
              </div>
            </div>
            
            <div className="ticket-details">
              <h3>Ticket Details</h3>
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
                  <label>Nationality:</label>
                  <span>{verifiedTicket.nationality}</span>
                </div>
                <div className="info-item">
                  <label>Health Status:</label>
                  <span className={`status-badge status-${verifiedTicket.healthStatus}`}>
                    {verifiedTicket.healthStatus}
                  </span>
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
                <div className="info-item">
                  <label>Passenger ID:</label>
                  <span>#{verifiedTicket.passenger_id}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="recent-tickets">
          <h3>Recent Tickets</h3>
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
                {tickets.slice(0, 10).map(ticket => (
                  <tr key={ticket.id} onClick={() => setTicketId(ticket.id.toString())} style={{ cursor: 'pointer' }}>
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
    </div>
  );
}

export default TicketVerification;
