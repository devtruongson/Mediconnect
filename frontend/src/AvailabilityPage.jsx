import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './App.css';

const workingHours = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00'
];

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const DoctorAvailability = () => {
  const { user } = useAuth();
  const doctorId = user?.doctor_id || user?.id || 1;
  
  // Fallback: if no doctorId from user, try to get from localStorage or use default
  const finalDoctorId = doctorId || localStorage.getItem('doctorId') || 1;
  
  console.log('User object:', user);
  console.log('DoctorId:', doctorId);

  const doctorInfo = {
    name: user?.name || "Dr. John Smith",
    id: finalDoctorId,
    specialty: user?.specialization || "Cardiology",
    clinic: "Central Clinic, 123 Main Street"
  };

  const toDateStr = (d) => d.toLocaleDateString('sv-SE');

  const getCurrentWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return `${toDateStr(monday)} → ${toDateStr(friday)}`;
  };

  const getThisWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    return weekdays.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return toDateStr(d);
    });
  };

  const [availabilities, setAvailabilities] = useState([]);
  const [addForm, setAddForm] = useState({ date: '', slot: '', status: 'available' });
  const [editForm, setEditForm] = useState({ date: '', slot: '', status: 'available' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch availabilities from API
  useEffect(() => {
    const fetchAvailabilities = async () => {
      console.log('DoctorId from context:', finalDoctorId);
      console.log('Final DoctorId:', finalDoctorId);
      
      if (!finalDoctorId) {
        console.warn('No doctorId available, skipping fetch');
        return;
      }
      
      try {
        setLoading(true);
        const url = `http://localhost:8000/api/availability?doctor_id=${finalDoctorId}`;
        console.log('Fetching from URL:', url);
        
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('Availability API Response:', response.data);
        
        // Handle API response structure
        const availabilitiesData = response.data?.data || response.data || [];
        if (Array.isArray(availabilitiesData)) {
          setAvailabilities(availabilitiesData);
        } else {
          console.error('Invalid availabilities data:', availabilitiesData);
          setAvailabilities([]);
        }
      } catch (error) {
        console.error('Error fetching availabilities:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
        }
        setAvailabilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, [finalDoctorId]);

  const addOneHour = (time) => {
    if (!time || typeof time !== 'string') return '00:00';
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + 60;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${String(newHour).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
  };

  const getAvailability = (date, slot) =>
    availabilities.find(a => (a.available_date || a.date) === date && (a.available_time || a.slot) === slot);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:8000/api/availability', {
        doctor_id: finalDoctorId,
        available_date: addForm.date,
        available_time: addForm.slot,
        status: 'available' // Always set to available when doctor adds
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('Add availability response:', response.data);
      
      // Handle API response structure
      const newAvailability = response.data?.data || response.data;
      if (newAvailability) {
        setAvailabilities(prev => [...prev, newAvailability]);
      }
      
      setAddForm({ date: '', slot: '', status: 'available' });
      setShowAddForm(false);
      alert('Slot added successfully.');
    } catch (error) {
      console.error('Failed to add availability:', error);
      alert('Failed to add slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const availabilityId = availabilities[editingIndex]?.availability_id;
      if (!availabilityId) {
        throw new Error('Availability ID not found');
      }
      
      const response = await axios.put(`http://localhost:8000/api/availability/${availabilityId}`, {
        available_date: editForm.date,
        available_time: editForm.slot,
        status: editForm.status?.toLowerCase() || 'available'
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      // Update local state
      const updated = [...availabilities];
      updated[editingIndex] = {
        ...updated[editingIndex],
        available_date: editForm.date,
        available_time: editForm.slot,
        status: editForm.status?.toLowerCase() || 'available',
        // Keep backward compatibility
        date: editForm.date,
        slot: editForm.slot
      };
      setAvailabilities(updated);
      
      setEditForm({ date: '', slot: '', status: 'available' });
      setEditingIndex(null);
      setShowEditForm(false);
      alert('Slot updated successfully.');
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert('Failed to update slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index) => {
    const entry = availabilities[index];
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the slot on ${entry.available_date || entry.date} at ${entry.available_time || entry.slot}?`
    );
    if (!confirmDelete) return;
    
    setLoading(true);
    
    try {
      const availabilityId = entry.availability_id;
      if (!availabilityId) {
        throw new Error('Availability ID not found');
      }
      
      await axios.delete(`http://localhost:8000/api/availability/${availabilityId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      // Update local state
      const updated = availabilities.filter((_, i) => i !== index);
      setAvailabilities(updated);
      alert('Slot deleted successfully.');
    } catch (error) {
      console.error('Failed to delete availability:', error);
      alert('Failed to delete slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setShowAddForm(true);
    setShowEditForm(false);
    setAddForm({ date: '', slot: '', status: 'available' });
  };

  const openEditForm = (index) => {
    const availability = availabilities[index];
    setEditingIndex(index);
    setEditForm({
      date: availability.available_date || availability.date || '',
      slot: availability.available_time || availability.slot || '',
      status: availability.status || 'available'
    });
    setShowAddForm(false);
    setShowEditForm(true);
  };

  return (
    <div className="availability-container">
      <h2>Doctor's Weekly Availability</h2>

      <div className="doctor-info">
        <p><strong>👤 Name:</strong> {doctorInfo.name}</p>
        <p><strong>🆔 ID:</strong> {doctorInfo.id}</p>
        <p><strong>🏥 Specialty:</strong> {doctorInfo.specialty}</p>
        <p><strong>🗺️ Clinic:</strong> {doctorInfo.clinic}</p>
        <p><strong>📅 Week of:</strong> {getCurrentWeekRange()}</p>
      </div>

      <button 
        className="add-button" 
        onClick={openAddForm}
        disabled={loading}
      >
        {loading ? 'Loading...' : '+ Add Slot'}
      </button>

      {showAddForm && (
        <form className="availability-form" onSubmit={handleAdd}>
          <h3>Add New Slot</h3>
          <select
  value={addForm.date}
  onChange={e => setAddForm({ ...addForm, date: e.target.value })}
  required
>
  <option value="">-- Select Date --</option>
  {getThisWeekDates().map((date, i) => (
    <option key={i} value={date}>
      {weekdays[i]} ({date})
    </option>
  ))}
</select>
          <select
            value={addForm.slot}
            onChange={e => setAddForm({ ...addForm, slot: e.target.value })}
            required
          >
            <option value="">-- Select Slot --</option>
            {workingHours.map(time => (
              <option key={time} value={time}>
                {time} – {addOneHour(time)}
              </option>
            ))}
          </select>
          <select
            value={addForm.status}
            onChange={e => setAddForm({ ...addForm, status: e.target.value })}
            required
          >
            <option value="available">Available</option>
            <option value="booked">Booked</option>
          </select>
          <button 
            className="save-button" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}

      {showEditForm && (
        <div className="popup-overlay" onClick={() => setShowEditForm(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Slot</h3>
            <form onSubmit={handleEdit}>
              <input
                type="date"
                value={editForm.date}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                required
              />
              <select
                value={editForm.slot}
                onChange={e => setEditForm({ ...editForm, slot: e.target.value })}
                required
              >
                <option value="">-- Select Slot --</option>
                {workingHours.map(time => (
                  <option key={time} value={time}>
                    {time} – {addOneHour(time)}
                  </option>
                ))}
              </select>
              <select
                value={editForm.status}
                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                required
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
              </select>
              <div style={{ marginTop: '12px', textAlign: 'right' }}>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="availability-table">
        <thead>
          <tr>
            <th>Slot / Day</th>
            {getThisWeekDates().map((date, i) => (
              <th key={i}>{weekdays[i]}<br />({date})</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workingHours.map((hour, i) => (
            <tr key={i}>
              <td>{hour} – {addOneHour(hour)}</td>
              {getThisWeekDates().map((date, j) => {
                const a = getAvailability(date, hour);
                const status = a?.status?.toLowerCase();
                return (
                  <td key={j} className={status || 'empty'}>
                    {status === 'available' && '🟢 Available'}
                    {status === 'booked' && '🔴 Booked'}
                    {!status && '⬜'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="availability-list">
        <h3>Availability List</h3>
        <table className="detail-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(availabilities) && availabilities.map((a, i) => {
              const statusClass = a.status?.toLowerCase() === 'available' ? 'available-text' : 'booked-text';
              const date = a.available_date || a.date;
              const time = a.available_time || a.slot;
              return (
                <tr key={a.availability_id || i}>
                  <td>{date}</td>
                  <td>{time} – {addOneHour(time)}</td>
                  <td className={statusClass}>{a.status || 'N/A'}</td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => openEditForm(i)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(i)}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorAvailability;
