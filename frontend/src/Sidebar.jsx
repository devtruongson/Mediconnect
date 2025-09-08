import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaCalendarAlt, FaUsers, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { useDoctor } from "./DoctorContext";
import { useAuth } from "./AuthContext"; 

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor } = useDoctor();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }; 

  const linkClass = (path) =>
    location.pathname === path ? "active-link" : "inactive-link";

  return (
    <div className="sidebar">
      <div className="logo-container">
        <img
          src="/doctor-images/logo.png"
          alt="MediConnect Logo"
          className="sidebar-logo"
        />
      </div>

      <div className="profile-section">
        <div className="avatar-wrapper">
          <img
            src={doctor?.image ? `http://localhost:8000${doctor.image}` : "/default-avatar.jpg"}
            alt="Doctor"
            className="avatar"
          />
        </div>
        <h3 className="name">{doctor?.name || user?.name || "Doctor"}</h3>
        <p className="role">{doctor?.specialization || "Specialist"}</p>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/dashboard" className={linkClass("/dashboard")}>
            <FaTachometerAlt /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/doctorprofile" className={linkClass("/doctorprofile")}>
            <FaCalendarAlt /> Doctor Profile
          </Link>
        </li>
        <li>
          <Link to="/AvailabilityPage" className={linkClass("/AvailabilityPage")}>
            <FaUsers /> Availability Scheduling
          </Link>
        </li>
        <li>
          <Link to="/docappointment" className={linkClass("/docappointment")}>
            <FaEnvelope /> Appointment Viewing
          </Link>
        </li>
        <li>
          <Link to="/appointment-management" className={linkClass("/appointment-management")}>
            <FaEnvelope /> Appointment Management
          </Link>
        </li>
      </ul>

      <div className="logout">
        <button onClick={handleLogout} className="inactive-link logout-button">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
