import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./App.css";
import { FaCheckCircle, FaEllipsisH } from "react-icons/fa";


const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  
  const doctorId = user?.doctor_id || user?.id || 1;

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/appointments?doctor_id=${doctorId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('Appointments API Response:', response.data);
        
        // Handle API response structure
        const appointmentsData = response.data?.data || response.data || [];
        if (Array.isArray(appointmentsData)) {
          // Map API data to frontend format
          const mappedAppointments = appointmentsData.map(apt => ({
            appointment_id: apt.appointment_id,
            patient_id: apt.patient_id,
            patient_name: apt.patient?.name || 'Unknown Patient',
            availability_id: apt.availability_id,
            date: apt.availability?.available_date || apt.date,
            slot: apt.availability?.available_time || apt.slot,
            status: apt.status
          }));
          setAppointments(mappedAppointments);
        } else {
          console.error('Invalid appointments data:', appointmentsData);
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId]);

  const handleAction = async (id, newStatus) => {
    if (!Array.isArray(appointments)) return;
    
    try {
      setLoading(true);
      
      // Update appointment status via API
      const response = await axios.post(`http://localhost:8000/api/appointments/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Update appointment response:', response.data);
      
      // Update local state
      const updated = appointments.map((a) =>
        a.appointment_id === id ? { ...a, status: newStatus } : a
      );
      setAppointments(updated);
      
      alert(`Appointment ${newStatus} successfully!`);
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle color="#3b82f6" />;
      case "completed":
        return <FaCheckCircle color="green" />;
      case "cancelled_by_patient":
        return <span style={{ color: "red" }}>Patient ❌</span>;
      case "cancelled_by_doctor":
        return <span style={{ color: "red" }}>Doctor ❌</span>;
      case "no_show":
        return <span style={{ color: "#f43f5e" }}>🚫</span>;
      case "rescheduled":
        return <span style={{ color: "#eab308" }}>🔁</span>;
      case "pending":
      default:
        return <FaEllipsisH color="#f97316" />;
    }
  };

  const addOneHour = (time) => {
    if (!time || typeof time !== 'string') return '00:00';
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + 60;
    const hour = String(Math.floor(total / 60)).padStart(2, "0");
    const min = String(total % 60).padStart(2, "0");
    return `${hour}:${min}`;
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchName = a.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchStatus = statusFilter === "" || a.status === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <div className="app-container">
      <h2>Appointments</h2>
      
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      )}

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Search by patient name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="rescheduled">Rescheduled</option>
          <option value="cancelled_by_patient">Cancelled by Patient</option>
          <option value="cancelled_by_doctor">Cancelled by Doctor</option>
          <option value="no_show">No Show</option>
        </select>
      </div>

      <div className="grid-header2">
        <div>ID</div>
        <div>Patient</div>
        <div>Date</div>
        <div>Slot</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {Array.isArray(filteredAppointments) && filteredAppointments.map((a) => (
        <div key={a.appointment_id} className="grid-row">
          <div>{a.appointment_id}</div>
          <div>{a.patient_name}</div>
          <div>{a.date}</div>
          <div>{a.slot} – {addOneHour(a.slot)}</div>
          <div className="status-icon">{getStatusIcon(a.status)}</div>
          <div className="action-buttons">
            {a.status === "pending" && (
              <button
                className="btn-confirm"
                onClick={() => handleAction(a.appointment_id, "confirmed")}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Confirm'}
              </button>
            )}
            {a.status === "confirmed" && (
              <>
                <button
                  className="btn-complete"
                  onClick={() => handleAction(a.appointment_id, "completed")}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Complete'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => handleAction(a.appointment_id, "cancelled_by_doctor")}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Cancel'}
                </button>
                <button
                  className="btn-noshow"
                  onClick={() => handleAction(a.appointment_id, "no_show")}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'No Show'}
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppointmentList;
