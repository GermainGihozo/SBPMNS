import React, { useState, useEffect } from 'react';
import API_BASE_URL from './config';
import './Reports.css';

function Reports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    passengers: [],
    vehicles: [],
    trips: [],
    tickets: [],
    borderEntries: []
  });
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setReportData({
          passengers: data.passengers || [],
          vehicles: data.vehicles || [],
          trips: data.trips || [],
          tickets: data.tickets || [],
          borderEntries: data.borderEntries || []
        });
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (items, dateField) => {
    if (!dateRange.startDate && !dateRange.endDate) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      const start = dateRange.startDate ? new Date(dateRange.startDate) : null;
      const end = dateRange.endDate ? new Date(dateRange.endDate) : null;
      
      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  };

  const generateReport = () => {
    let reportContent = '';
    const timestamp = new Date().toLocaleString();

    reportContent += `SBPMNS - Smart Border Passenger Management System\n`;
    reportContent += `${'='.repeat(60)}\n\n`;

    switch (reportType) {
      case 'overview':
        reportContent += `SYSTEM OVERVIEW REPORT\n`;
        reportContent += `Generated: ${timestamp}\n\n`;
        reportContent += `SUMMARY STATISTICS\n`;
        reportContent += `${'-'.repeat(60)}\n`;
        reportContent += `Total Passengers: ${reportData.passengers.length}\n`;
        reportContent += `Total Vehicles: ${reportData.vehicles.length}\n`;
        reportContent += `Total Trips: ${reportData.trips.length}\n`;
        reportContent += `Total Tickets: ${reportData.tickets.length}\n`;
        reportContent += `Total Border Entries: ${reportData.borderEntries.length}\n\n`;
        
        const healthyCount = reportData.passengers.filter(p => p.health_status === 'healthy').length;
        const quarantinedCount = reportData.passengers.filter(p => p.health_status === 'quarantined').length;
        const blacklistedCount = reportData.passengers.filter(p => p.blacklist_reason).length;
        
        reportContent += `HEALTH STATUS BREAKDOWN\n`;
        reportContent += `${'-'.repeat(60)}\n`;
        reportContent += `Healthy: ${healthyCount}\n`;
        reportContent += `Quarantined: ${quarantinedCount}\n`;
        reportContent += `Blacklisted: ${blacklistedCount}\n\n`;
        
        const activeVehicles = reportData.vehicles.filter(v => v.status === 'active').length;
        reportContent += `VEHICLE STATUS\n`;
        reportContent += `${'-'.repeat(60)}\n`;
        reportContent += `Active Vehicles: ${activeVehicles}\n`;
        reportContent += `Total Capacity: ${reportData.vehicles.reduce((sum, v) => sum + (v.capacity || 0), 0)} seats\n`;
        break;

      case 'passengers':
        const filteredPassengers = reportData.passengers;
        reportContent += `PASSENGER REGISTRY REPORT\n`;
        reportContent += `Generated: ${timestamp}\n`;
        reportContent += `Total Records: ${filteredPassengers.length}\n\n`;
        reportContent += `${'='.repeat(60)}\n\n`;
        
        filteredPassengers.forEach((p, i) => {
          reportContent += `${i + 1}. PASSENGER DETAILS\n`;
          reportContent += `${'-'.repeat(60)}\n`;
          reportContent += `Name: ${p.name}\n`;
          reportContent += `Passport Number: ${p.passport_number}\n`;
          reportContent += `Nationality: ${p.nationality}\n`;
          reportContent += `Date of Birth: ${p.date_of_birth}\n`;
          reportContent += `Blood Type: ${p.blood_type || 'Not specified'}\n`;
          reportContent += `Health Status: ${p.health_status}\n`;
          if (p.reference_name) {
            reportContent += `Reference Person: ${p.reference_name}\n`;
            reportContent += `Reference Contact: ${p.reference_contact || 'N/A'}\n`;
          }
          if (p.blacklist_reason) {
            reportContent += `⚠️ BLACKLISTED: ${p.blacklist_reason}\n`;
          }
          reportContent += `Registered: ${new Date(p.created_at).toLocaleString()}\n`;
          reportContent += `\n`;
        });
        break;

      case 'vehicles':
        reportContent += `VEHICLE FLEET REPORT\n`;
        reportContent += `Generated: ${timestamp}\n`;
        reportContent += `Total Vehicles: ${reportData.vehicles.length}\n\n`;
        reportContent += `${'='.repeat(60)}\n\n`;
        
        reportData.vehicles.forEach((v, i) => {
          reportContent += `${i + 1}. VEHICLE DETAILS\n`;
          reportContent += `${'-'.repeat(60)}\n`;
          reportContent += `Plate Number: ${v.plate_number}\n`;
          reportContent += `Type: ${v.type}\n`;
          reportContent += `Capacity: ${v.capacity} seats\n`;
          reportContent += `Status: ${v.status || 'active'}\n`;
          reportContent += `Driver Name: ${v.driver_name || 'Not assigned'}\n`;
          reportContent += `Driver Phone: ${v.driver_phone || 'N/A'}\n`;
          reportContent += `\n`;
        });
        break;

      case 'border':
        const filteredEntries = filterByDateRange(reportData.borderEntries, 'entry_time');
        reportContent += `BORDER ACTIVITY REPORT\n`;
        reportContent += `Generated: ${timestamp}\n`;
        if (dateRange.startDate || dateRange.endDate) {
          reportContent += `Date Range: ${dateRange.startDate || 'Start'} to ${dateRange.endDate || 'End'}\n`;
        }
        reportContent += `Total Records: ${filteredEntries.length}\n\n`;
        reportContent += `${'='.repeat(60)}\n\n`;
        
        filteredEntries.forEach((e, i) => {
          reportContent += `${i + 1}. BORDER CROSSING\n`;
          reportContent += `${'-'.repeat(60)}\n`;
          reportContent += `Passenger: ${e.name}\n`;
          reportContent += `Passport: ${e.passport_number}\n`;
          reportContent += `Entry Time: ${e.entry_time ? new Date(e.entry_time).toLocaleString() : 'N/A'}\n`;
          reportContent += `Exit Time: ${e.exit_time ? new Date(e.exit_time).toLocaleString() : 'Not exited'}\n`;
          reportContent += `Status: ${e.status || 'entered'}\n`;
          if (e.notes) reportContent += `Notes: ${e.notes}\n`;
          reportContent += `\n`;
        });
        break;

      case 'trips':
        const filteredTrips = filterByDateRange(reportData.trips, 'departure_date');
        reportContent += `TRIP SCHEDULE REPORT\n`;
        reportContent += `Generated: ${timestamp}\n`;
        if (dateRange.startDate || dateRange.endDate) {
          reportContent += `Date Range: ${dateRange.startDate || 'Start'} to ${dateRange.endDate || 'End'}\n`;
        }
        reportContent += `Total Trips: ${filteredTrips.length}\n\n`;
        reportContent += `${'='.repeat(60)}\n\n`;
        
        filteredTrips.forEach((t, i) => {
          reportContent += `${i + 1}. TRIP DETAILS\n`;
          reportContent += `${'-'.repeat(60)}\n`;
          reportContent += `Route: ${t.departure} → ${t.destination}\n`;
          reportContent += `Departure: ${new Date(t.departure_date).toLocaleString()}\n`;
          reportContent += `Vehicle ID: ${t.vehicle_id}\n`;
          reportContent += `Status: ${t.status || 'scheduled'}\n`;
          reportContent += `\n`;
        });
        break;

      case 'tickets':
        reportContent += `TICKET BOOKING REPORT\n`;
        reportContent += `Generated: ${timestamp}\n`;
        reportContent += `Total Tickets: ${reportData.tickets.length}\n\n`;
        reportContent += `${'='.repeat(60)}\n\n`;
        
        reportData.tickets.forEach((t, i) => {
          reportContent += `${i + 1}. TICKET DETAILS\n`;
          reportContent += `${'-'.repeat(60)}\n`;
          reportContent += `Ticket ID: ${t.id}\n`;
          reportContent += `Passenger ID: ${t.passenger_id}\n`;
          reportContent += `Trip ID: ${t.trip_id}\n`;
          reportContent += `Seat Number: ${t.seat_number}\n`;
          reportContent += `Status: ${t.status || 'booked'}\n`;
          reportContent += `Booked: ${new Date(t.created_at).toLocaleString()}\n`;
          reportContent += `\n`;
        });
        break;

      default:
        reportContent = 'Invalid report type';
    }

    reportContent += `\n${'='.repeat(60)}\n`;
    reportContent += `End of Report\n`;
    reportContent += `Generated by SBPMNS v1.0\n`;

    // Download report as text file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SBPMNS_${reportType}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getReportStats = () => {
    switch (reportType) {
      case 'overview':
        return {
          total: reportData.passengers.length + reportData.vehicles.length + reportData.trips.length,
          label: 'Total Records'
        };
      case 'passengers':
        return { total: reportData.passengers.length, label: 'Passengers' };
      case 'vehicles':
        return { total: reportData.vehicles.length, label: 'Vehicles' };
      case 'border':
        const filtered = filterByDateRange(reportData.borderEntries, 'entry_time');
        return { total: filtered.length, label: 'Border Entries' };
      case 'trips':
        const filteredTrips = filterByDateRange(reportData.trips, 'departure_date');
        return { total: filteredTrips.length, label: 'Trips' };
      case 'tickets':
        return { total: reportData.tickets.length, label: 'Tickets' };
      default:
        return { total: 0, label: 'Records' };
    }
  };

  const stats = getReportStats();

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h2>📊 System Reports</h2>
        <p>Generate and export comprehensive system reports</p>
      </div>

      {loading && <div className="loading-message">Loading report data...</div>}

      <div className="report-generator">
        <div className="report-config">
          <div className="config-section">
            <h3>Report Configuration</h3>
            
            <div className="form-group">
              <label>Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="overview">📈 System Overview</option>
                <option value="passengers">👥 Passenger Registry</option>
                <option value="vehicles">🚌 Vehicle Fleet</option>
                <option value="trips">🗺️ Trip Schedule</option>
                <option value="border">🛂 Border Activity</option>
                <option value="tickets">🎫 Ticket Bookings</option>
              </select>
            </div>

            {(reportType === 'border' || reportType === 'trips') && (
              <div className="date-range-section">
                <h4>Date Range Filter (Optional)</h4>
                <div className="date-inputs">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="report-preview-card">
            <h3>Report Preview</h3>
            <div className="preview-content">
              <div className="preview-stat">
                <div className="preview-icon">📄</div>
                <div className="preview-info">
                  <div className="preview-number">{stats.total}</div>
                  <div className="preview-label">{stats.label}</div>
                </div>
              </div>
              
              <div className="report-details">
                <h4>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h4>
                <ul>
                  {reportType === 'overview' && (
                    <>
                      <li>System statistics summary</li>
                      <li>Health status breakdown</li>
                      <li>Vehicle fleet overview</li>
                    </>
                  )}
                  {reportType === 'passengers' && (
                    <>
                      <li>Complete passenger details</li>
                      <li>Health and blacklist status</li>
                      <li>Reference person information</li>
                    </>
                  )}
                  {reportType === 'vehicles' && (
                    <>
                      <li>Vehicle specifications</li>
                      <li>Driver assignments</li>
                      <li>Status and capacity</li>
                    </>
                  )}
                  {reportType === 'border' && (
                    <>
                      <li>Entry and exit records</li>
                      <li>Passenger information</li>
                      <li>Officer notes</li>
                    </>
                  )}
                  {reportType === 'trips' && (
                    <>
                      <li>Trip schedules</li>
                      <li>Route information</li>
                      <li>Vehicle assignments</li>
                    </>
                  )}
                  {reportType === 'tickets' && (
                    <>
                      <li>Booking details</li>
                      <li>Seat assignments</li>
                      <li>Booking timestamps</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="report-actions">
          <button onClick={generateReport} className="generate-report-btn" disabled={loading}>
            <span className="btn-icon">📥</span>
            <span>Download Report</span>
          </button>
          <button onClick={fetchReportData} className="refresh-btn" disabled={loading}>
            <span className="btn-icon">🔄</span>
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <div className="report-info">
        <h3>ℹ️ Report Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Format</h4>
            <p>Reports are exported as plain text (.txt) files for easy viewing and archiving.</p>
          </div>
          <div className="info-card">
            <h4>Content</h4>
            <p>Each report includes detailed information, timestamps, and formatted data for analysis.</p>
          </div>
          <div className="info-card">
            <h4>Date Filters</h4>
            <p>Border and Trip reports support date range filtering for specific time periods.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
