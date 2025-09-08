import React, { useState, useEffect } from "react";
import { FaHome, FaBell } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "./App.css";

const DashboardLayout = () => {
  const { user, updateUserAvatar } = useAuth();
  const [doctorName, setDoctorName] = useState("Doctor");
  const [avatar, setAvatar] = useState("/default-avatar.jpg");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDoctorName(user.name);
      setAvatar(user.image ? `http://localhost:8000${user.image}` : "/default-avatar.jpg");
    }
  }, [user]);

  // Update avatar when doctor context changes
  useEffect(() => {
    if (user?.image) {
      setAvatar(`http://localhost:8000${user.image}`);
    }
  }, [user?.image]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/notifications");
        console.log('Navbar Notifications API Response:', res.data); // Debug log
        
        // Ensure we always have an array
        const notificationsData = res.data?.data || res.data || [];
        if (Array.isArray(notificationsData)) {
          setNotifications(notificationsData);
        } else {
          console.error('Invalid notifications data:', notificationsData);
          setNotifications([]);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
        setNotifications([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:8000/api/doctor/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newAvatar = res.data.avatar || "/default-avatar.jpg";
      setAvatar(`http://localhost:8000${newAvatar}`);
      console.log("Avatar updated successfully:", newAvatar);
      
      // Update user context with new avatar
      updateUserAvatar(newAvatar);
    } catch (err) {
      console.error("Error uploading avatar:", err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleNotificationClick = async (notificationId) => {
    try {
      await axios.post(`http://localhost:8000/api/notifications/${notificationId}/read`);
      // Update local state to mark as read
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.post("http://localhost:8000/api/notifications/read-all");
      // Update local state to mark all as read
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="topbar">
        <div className="logo-section">
          <span className="brand-name">
            <FaHome /> Welcome back, {doctorName} 👋
          </span>
        </div>

        <div className="right-section" style={{marginRight: "50px"}}>
          <FaBell className="icon" onClick={() => setShowNotifications(!showNotifications)} />
          {showNotifications && (
            <div className="notification-popup">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : !Array.isArray(notifications) || notifications.length === 0 ? (
                <p>No new notifications</p>
              ) : (
                <>
                  <div className="notification-header">
                    <span>Notifications</span>
                    <button 
                      className="mark-all-read-btn"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </button>
                  </div>
                  <ul>
                    {notifications.map((note, index) => (
                      <li 
                        key={note.id || index}
                        className={note.is_read ? 'read' : 'unread'}
                        onClick={() => handleNotificationClick(note.id)}
                      >
                        <div className="notification-item">
                          <span className="notification-message">{note.message}</span>
                          <div className="notification-meta">
                            <span className="notification-type">{note.type}</span>
                            <span className="notification-time">
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <label className="avatar-wrapper">
            {uploading ? (
              <div className="s-avatar loading-spinner"></div>
            ) : (
              <img
                src={avatar}
                alt="User"
                className="s-avatar"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="avatar-input"
              disabled={uploading}
            />
          </label>
          <span className="username">{doctorName} ▾</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
