import React, { useState } from 'react';
import './Personal.css';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztOKhcpPFrSAiy2J74i5EqBrRJagmz7wc9tWHbexDab218vbFrhdme1MM3lJLtUVxZwA/exec";

// Helper function to return today's date formatted as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const Personal = ({ onClose, refreshData }) => {
  const [activeTab, setActiveTab] = useState('room'); // 'room' or 'personal'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Room Form State
  const [roomData, setRoomData] = useState({
    RDate: '',
    Rent: '',
    Electricity: '',
    RMoneyUseName: '',
    RMoneyUseAmount: ''
  });

  // Personal Form State
  const [personalData, setPersonalData] = useState({
    PersonalDate: '',
    PersonalName: '',
    PersonalCategory: 'Junk',
    PersonalAmount: ''
  });

  const handleRoomChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  const handlePersonalChange = (e) => {
    setPersonalData({ ...personalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Auto-assign today's date if user left the date field blank
    const finalRoomData = {
      ...roomData,
      RDate: roomData.RDate || getTodayDate()
    };

    const finalPersonalData = {
      ...personalData,
      PersonalDate: personalData.PersonalDate || getTodayDate()
    };

    const payload = activeTab === 'room' 
      ? { type: 'room', ...finalRoomData } 
      : { type: 'personal', ...finalPersonalData };

    const formData = new URLSearchParams();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      setMessage({ type: 'success', text: 'Transaction saved successfully!' });

      if (refreshData) refreshData();

      setTimeout(() => {
        if (activeTab === 'room') {
          setRoomData({ RDate: '', Rent: '', Electricity: '', RMoneyUseName: '', RMoneyUseAmount: '' });
        } else {
          setPersonalData({ PersonalDate: '', PersonalName: '', PersonalCategory: 'Junk', PersonalAmount: '' });
        }
        setMessage({ type: '', text: '' });
        if (onClose) onClose();
      }, 1000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({ type: 'error', text: 'Failed to record entry. Check network.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="personal-modal-content">
      {/* Drag & Close Bar */}
      <div className="modal-top-bar">
        <div className="drag-handle"></div>
        <button className="close-modal-btn" type="button" onClick={onClose} aria-label="Close modal">
          ✕
        </button>
      </div>

      <div className="modal-header-info">
        <h2>New Transaction</h2>
        <p>Record your personal expenses or room allocations</p>
      </div>

      {/* Segmented Tab Controls */}
      <div className="segmented-control">
        <button
          type="button"
          className={`segment-btn ${activeTab === 'room' ? 'active' : ''}`}
          onClick={() => { setActiveTab('room'); setMessage({ type: '', text: '' }); }}
        >
          Room & Rent
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => { setActiveTab('personal'); setMessage({ type: '', text: '' }); }}
        >
          Personal
        </button>
      </div>

      {/* Notification Banner */}
      {message.text && (
        <div className={`status-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="modal-form">
        {activeTab === 'room' ? (
          <>
            <div className="form-group">
              <label>Date <span className="label-hint">(Defaults to Today)</span></label>
              <input
                type="date"
                name="RDate"
                value={roomData.RDate}
                onChange={handleRoomChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Rent Share (₹)</label>
                <input
                  type="number"
                  name="Rent"
                  placeholder="0"
                  value={roomData.Rent}
                  onChange={handleRoomChange}
                />
              </div>

              <div className="form-group">
                <label>Electricity (₹)</label>
                <input
                  type="number"
                  name="Electricity"
                  placeholder="0"
                  value={roomData.Electricity}
                  onChange={handleRoomChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Room Money Used By</label>
              <input
                type="text"
                name="RMoneyUseName"
                placeholder="e.g. Amit"
                value={roomData.RMoneyUseName}
                onChange={handleRoomChange}
              />
            </div>

            <div className="form-group">
              <label>Room Money Amount (₹)</label>
              <input
                type="number"
                name="RMoneyUseAmount"
                placeholder="0"
                value={roomData.RMoneyUseAmount}
                onChange={handleRoomChange}
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Date <span className="label-hint">(Defaults to Today)</span></label>
              <input
                type="date"
                name="PersonalDate"
                value={personalData.PersonalDate}
                onChange={handlePersonalChange}
              />
            </div>

            <div className="form-group">
              <label>Description / Title</label>
              <input
                type="text"
                name="PersonalName"
                placeholder="e.g. Snacks, New Shoes"
                value={personalData.PersonalName}
                onChange={handlePersonalChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="PersonalCategory"
                value={personalData.PersonalCategory}
                onChange={handlePersonalChange}
                required
              >
                <option value="Junk">🍔 Junk / Food</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Money Personal">💳 Personal Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                name="PersonalAmount"
                placeholder="0.00"
                value={personalData.PersonalAmount}
                onChange={handlePersonalChange}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving Entry...' : 'Save Record'}
        </button>
      </form>
    </div>
  );
};

export default Personal;