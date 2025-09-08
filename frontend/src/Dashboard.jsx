import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaUserMd, FaClock } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./App.css";
import UpcomingAppointments from "./UpcomingAppointments.jsx";

const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    appointments: 0,
    patients: 0,
    schedules: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchDoctorData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/doctor/dashboard");

        if (res.data.success && res.data.data) {
          const { stats } = res.data.data;
          setStats({
            appointments: stats.total_appointments || 0,
            patients: stats.booked_slots || 0, // Using booked slots as patient count
            schedules: stats.available_slots || 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    fetchDoctorData();
  }, [isAuthenticated]);

  return (
    <div className="dashboard-container">
      <div className="welcome-text">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <FaCalendarAlt className="stat-icon" />
          <div>
            <h3>{stats.appointments}</h3>
            <p>Appointments</p>
          </div>
        </div>
        <div className="stat-card">
          <FaUserMd className="stat-icon" />
          <div>
            <h3>{stats.patients}</h3>
            <p>Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <FaClock className="stat-icon" />
          <div>
            <h3>{stats.schedules}</h3>
            <p>Available Slots</p>
          </div>
        </div>
      </div>

      <div className="info-box">
        Stay on top of your schedule, patient updates, and availability—all from one dashboard.
      </div>

      <UpcomingAppointments />
    </div>
  );
};

export default Dashboard;
