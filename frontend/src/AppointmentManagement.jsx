import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './App.css';

const AppointmentManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    console.log('AppointmentManagement mounted, fetching appointments...');
    console.log('Current user:', user);
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:8000/api/appointments');
      console.log('API Response:', response.data); // Debug log
      
      // Ensure we always have an array
      const appointmentsData = response.data?.data || response.data || [];
      if (Array.isArray(appointmentsData)) {
        setAppointments(appointmentsData);
      } else {
        console.error('Invalid appointments data:', appointmentsData);
        setAppointments([]);
        setError('Invalid data received from server');
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment || !newStatus) return;

    try {
      setLoading(true);
      await axios.post(`http://localhost:8000/api/appointments/${selectedAppointment.appointment_id}/status`, {
        status: newStatus
      });
      
      // Refresh appointments
      await fetchAppointments();
      setShowStatusModal(false);
      setSelectedAppointment(null);
      setNewStatus('');
      alert('Appointment status updated successfully!');
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      alert('Failed to update appointment status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setShowStatusModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'confirmed': '#27ae60',
      'completed': '#3498db',
      'cancelled_by_doctor': '#e74c3c',
      'cancelled_by_patient': '#e74c3c',
      'no_show': '#95a5a6',
      'rescheduled': '#9b59b6'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pending Confirmation',
      'confirmed': 'Confirmed',
      'completed': 'Completed',
      'cancelled_by_doctor': 'Cancelled by Doctor',
      'cancelled_by_patient': 'Cancelled by Patient',
      'no_show': 'No Show',
      'rescheduled': 'Rescheduled'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Ensure appointments is always an array
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  
  // Debug logging
  console.log('Appointments state:', appointments);
  console.log('Safe appointments:', safeAppointments);
  console.log('Is array?', Array.isArray(safeAppointments));

  if (loading && safeAppointments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="appointment-management-container">
      <h2>Appointment Management</h2>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAppointments} className="retry-btn">
            Retry
          </button>
        </div>
      )}
      
      {!error && safeAppointments.length === 0 ? (
        <div className="no-appointments">
          <p>No appointments found.</p>
        </div>
      ) : !error && (
        <div className="appointments-list">
          {safeAppointments && safeAppointments.length > 0 && safeAppointments.map((appointment) => (
            <div key={appointment.appointment_id} className="appointment-card">
              <div className="appointment-header">
                <h3>{appointment.patient.name}</h3>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(appointment.status) }}
                >
                  {getStatusText(appointment.status)}
                </span>
              </div>
              
              <div className="appointment-details">
                <div className="detail-row">
                  <strong>Date:</strong> {formatDate(appointment.availability.available_date)}
                </div>
                <div className="detail-row">
                  <strong>Time:</strong> {formatTime(appointment.availability.available_time)}
                </div>
                <div className="detail-row">
                  <strong>Patient Phone:</strong> {appointment.patient.phone}
                </div>
                <div className="detail-row">
                  <strong>Patient Email:</strong> {appointment.patient.email}
                </div>
                <div className="detail-row">
                  <strong>Booked On:</strong> {formatDate(appointment.created_at)}
                </div>
              </div>
              
              <div className="appointment-actions">
                <button 
                  className="update-status-btn"
                  onClick={() => openStatusModal(appointment)}
                >
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Appointment Status</h3>
            <div className="modal-body">
              <p><strong>Patient:</strong> {selectedAppointment?.patient.name}</p>
              <p><strong>Date:</strong> {selectedAppointment && formatDate(selectedAppointment.availability.available_date)}</p>
              <p><strong>Time:</strong> {selectedAppointment && formatTime(selectedAppointment.availability.available_time)}</p>
              
              <div className="form-group">
                <label htmlFor="status">New Status:</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending Confirmation</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled_by_doctor">Cancelled by Doctor</option>
                  <option value="no_show">No Show</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button 
                className="save-btn"
                onClick={handleStatusUpdate}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
