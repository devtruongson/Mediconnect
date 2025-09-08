import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import DashboardLayout from "./Navbar";
import "./App.css";
import DoctorProfile from "./DoctorProfile.jsx";
import { DoctorProvider } from "./DoctorContext";
import { AuthProvider } from "./AuthContext";
import DoctorAvailability from "./AvailabilityPage.jsx";
import AppointmentList from "./Appointment.jsx";
import AppointmentManagement from "./AppointmentManagement.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

function App() {
  return (
    <AuthProvider>
      <DoctorProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="container">
                  <Sidebar />
                  <div className="main-content">
                    <DashboardLayout />
                    <div className="content-area">
                      <Dashboard />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/doctorprofile" element={
              <ProtectedRoute>
                <div className="container">
                  <Sidebar />
                  <div className="main-content">
                    <DashboardLayout />
                    <div className="content-area">
                      <DoctorProfile />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/AvailabilityPage" element={
              <ProtectedRoute>
                <div className="container">
                  <Sidebar />
                  <div className="main-content">
                    <DashboardLayout />
                    <div className="content-area">
                      <DoctorAvailability />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/docappointment" element={
              <ProtectedRoute>
                <div className="container">
                  <Sidebar />
                  <div className="main-content">
                    <DashboardLayout />
                    <div className="content-area">
                      <AppointmentList />
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/appointment-management" element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <div className="container">
                    <Sidebar />
                    <div className="main-content">
                      <DashboardLayout />
                      <div className="content-area">
                        <AppointmentManagement />
                      </div>
                    </div>
                  </div>
                </ErrorBoundary>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </DoctorProvider>
    </AuthProvider>
  );
}

export default App;
