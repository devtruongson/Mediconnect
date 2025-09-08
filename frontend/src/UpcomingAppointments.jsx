import React, { useEffect, useState } from "react";
import axios from "axios";

const generateNext7Days = () => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return {
      date,
      iso: date.toISOString().split("T")[0],
    };
  });
};

const UpcomingAppointments = () => {
  const days = generateNext7Days();
  const [selectedDate, setSelectedDate] = useState(days[0].iso);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `http://localhost:8000/api/appointments?from=${days[0].iso}&to=${days[6].iso}`
        );
        console.log('UpcomingAppointments API Response:', res.data); // Debug log
        
        // Ensure we always have an array
        const appointmentsData = res.data?.data || res.data || [];
        if (Array.isArray(appointmentsData)) {
          setAppointments(appointmentsData);
        } else {
          console.error('Invalid appointments data:', appointmentsData);
          setAppointments([]);
          setError('Invalid data received from server');
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setAppointments([]);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Ensure appointments is always an array
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  
  const grouped = {};
  safeAppointments.forEach((item) => {
    // Use availability.available_date instead of item.date
    const dateKey = item.availability?.available_date || item.date;
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  const currentAppointments = grouped[selectedDate] || [];

  if (loading) {
    return (
      <div className="appointments-container">
        <h3>Upcoming Appointments</h3>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="appointments-container">
      <h3>Upcoming Appointments</h3>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Timeline selector */}
      <div className="timeline">
        {days.map((day) => (
          <button
            key={day.iso}
            className={`timeline-day ${day.iso === selectedDate ? "active" : ""}`}
            onClick={() => setSelectedDate(day.iso)}
          >
            <div>{day.date.toLocaleDateString("en-US", { weekday: "short" })}</div>
            <div>
              {day.date.getDate()} {day.date.toLocaleDateString("en-US", { month: "short" })}
            </div>
          </button>
        ))}
      </div>

      {/* Appointment list */}
      <div className="appointments-list">
        {!error && currentAppointments.length === 0 ? (
          <p>No appointments for this day.</p>
        ) : !error && (
          currentAppointments.map((appt, index) => (
            <div key={appt.appointment_id || index} className="appointment-card">
              <img src={appt.patient?.image || "/default-avatar.jpg"} alt="avatar" className="appt-avatar" />
              <div className="info">
                <strong>{appt.patient?.name || 'Unknown Patient'}</strong>
                <div className="appointment-details">
                  <span>Status: {appt.status}</span>
                </div>
              </div>
              <div className="time-price">
                <span>{appt.availability?.available_time || 'N/A'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
