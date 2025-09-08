import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const DoctorContext = createContext();

export const DoctorProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const { user, isAuthenticated } = useAuth();

  const fetchDoctor = async () => {
    if (!isAuthenticated) return;
    
    try {
      const res = await axios.get("http://localhost:8000/api/doctor/me");
      setDoctor(res.data);
    } catch (err) {
      console.error("Failed to fetch doctor info", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      setDoctor(user);
    } else {
      setDoctor(null);
    }
  }, [isAuthenticated, user]);

  const updateDoctor = (updatedDoctor) => {
    setDoctor(updatedDoctor);
  };

  // Sync doctor data when user changes
  useEffect(() => {
    if (user && user.doctor_id) {
      setDoctor(user);
    }
  }, [user]);

  return (
    <DoctorContext.Provider value={{ doctor, setDoctor, fetchDoctor, updateDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => useContext(DoctorContext);
