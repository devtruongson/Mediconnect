import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { useDoctor } from "./DoctorContext";
import { useAuth } from "./AuthContext";

import {
  FaUser, FaEnvelope, FaGraduationCap, FaBriefcase, FaPhone,
  FaStethoscope, FaCity, FaVenusMars, FaBirthdayCake, FaIdCard,
} from "react-icons/fa";

const DoctorProfile = () => {
  const { doctor, updateDoctor } = useDoctor();
  const { user, updateUser } = useAuth();
  const [localDoctor, setLocalDoctor] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/cities');
        setCities(response.data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (doctor) {
      setLocalDoctor({
        ...doctor,
        city_id: doctor.city_id || doctor.city?.city_id || "",
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setLocalDoctor({ ...localDoctor, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validateDoctorForm = () => {
    const { name, email, phone, gender, dob } = localDoctor;
    const newErrors = {};

    if (!name || name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format.";
    }

    if (phone && !/^\d{8,15}$/.test(phone)) {
      newErrors.phone = "Phone must be 8–15 digits.";
    }

    if (!gender) {
      newErrors.gender = "Please select a gender.";
    }

    if (!dob) {
      newErrors.dob = "Date of birth is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateDoctorForm()) return;

    setLoading(true);
    const formData = new FormData();
    Object.entries(localDoctor).forEach(([key, value]) => {
      if (key === "city_id") {
        const cityId = parseInt(value);
        if (!isNaN(cityId)) {
          formData.append("city_id", cityId);
        }
      } else if (value !== null && value !== undefined && value !== "") {
        formData.append(key, value);
      }
    });

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const response = await axios.post("http://localhost:8000/api/doctor/update", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      updateDoctor(response.data);
      updateUser(response.data);
      
      setPreview(null);
      setSelectedFile(null);
      setIsEditing(false);
      setErrors({});
      setSuccessMsg("Profile updated successfully.");
      setTimeout(() => setSuccessMsg(""), window.location.reload(), 3000);
      
    } catch (err) {
      console.error("Update failed", err.response?.data || err);
      setErrors(err.response?.data?.errors || {});
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-profile-container">
      <div className="left-panel">
        <img
          src={preview || (doctor?.image ? `http://localhost:8000${doctor.image}` : "/default-avatar.jpg")}
          alt="Avatar"
          className="profile-avatar"
        />
        {isEditing && (
          <div className="avatar-upload">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              id="avatar-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              📷 Change Avatar
            </label>
          </div>
        )}
        <h2>{localDoctor.name}</h2>
        <p>{localDoctor.specialization}</p>
      </div>

      <div className="right-panel">
        <h3>Doctor Information</h3>
        {successMsg && <div className="success-msg">{successMsg}</div>}

        <div className="info-row">
          <label><FaIdCard /> ID:</label>
          <span>{localDoctor.doctor_id}</span>
        </div>

        <div className="info-row">
          <label><FaUser /> Name:</label>
          {isEditing ? (
            <>
              <input name="name" value={localDoctor.name || ""} onChange={handleChange} />
              {errors.name && <div className="error">{errors.name}</div>}
            </>
          ) : (
            <span>{localDoctor.name}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaEnvelope /> Email:</label>
          {isEditing ? (
            <>
              <input name="email" value={localDoctor.email || ""} onChange={handleChange} />
              {errors.email && <div className="error">{errors.email}</div>}
            </>
          ) : (
            <span>{localDoctor.email}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaGraduationCap /> Qualification:</label>
          {isEditing ? (
            <input name="qualification" value={localDoctor.qualification || ""} onChange={handleChange} />
          ) : (
            <span>{localDoctor.qualification}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaBriefcase /> Experience:</label>
          {isEditing ? (
            <input name="experience" value={localDoctor.experience || ""} onChange={handleChange} />
          ) : (
            <span>{localDoctor.experience}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaPhone /> Phone:</label>
          {isEditing ? (
            <>
              <input name="phone" value={localDoctor.phone || ""} onChange={handleChange} />
              {errors.phone && <div className="error">{errors.phone}</div>}
            </>
          ) : (
            <span>{localDoctor.phone}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaStethoscope /> Specialization:</label>
          {isEditing ? (
            <input name="specialization" value={localDoctor.specialization || ""} onChange={handleChange} />
          ) : (
            <span>{localDoctor.specialization}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaCity /> City:</label>
          {isEditing ? (
            <select name="city_id" value={localDoctor.city_id || ""} onChange={handleChange}>
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.city_id} value={city.city_id}>
                  {city.city_name}
                </option>
              ))}
            </select>
          ) : (
            <span>{localDoctor.city?.city_name || "N/A"}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaVenusMars /> Gender:</label>
          {isEditing ? (
            <>
              <select name="gender" value={localDoctor.gender || ""} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <div className="error">{errors.gender}</div>}
            </>
          ) : (
            <span>{localDoctor.gender}</span>
          )}
        </div>

        <div className="info-row">
          <label><FaBirthdayCake /> Date of Birth:</label>
          {isEditing ? (
            <>
              <input name="dob" type="date" value={localDoctor.dob || ""} onChange={handleChange} />
              {errors.dob && <div className="error">{errors.dob}</div>}
            </>
          ) : (
            <span>{localDoctor.dob}</span>
          )}
        </div>

        <button
          type="button"
          className="edit-btn"
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          disabled={loading}
        >
          {loading ? "Saving..." : (isEditing ? "Save" : "Edit")}
        </button>
        
        {isEditing && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setIsEditing(false);
              setPreview(null);
              setSelectedFile(null);
              setErrors({});
              setLocalDoctor({
                ...doctor,
                city_id: doctor.city_id || doctor.city?.city_id || "",
              });
            }}
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
