import React, { useState } from 'react';
import './Personal.css';
import Add from './Upay/Add';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztOKhcpPFrSAiy2J74i5EqBrRJagmz7wc9tWHbexDab218vbFrhdme1MM3lJLtUVxZwA/exec";

// Helper function to return today's date formatted as YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

const Personal = ({ onClose, refreshData, onNavigate }) => {
  // Tabs: 'personal', 'room', or 'coaching'
  const [activeTab, setActiveTab] = useState('personal'); 
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

  // Helper for dynamic Personal entries
  const createEmptyPersonalRow = () => ({
    id: Date.now() + Math.random(),
    PersonalDate: getTodayDate(),
    PersonalName: '',
    PersonalCategory: 'Junk',
    PersonalAmount: ''
  });

  const [personalRows, setPersonalRows] = useState([createEmptyPersonalRow()]);

  // Handlers for Room Data
  const handleRoomChange = (e) => {
    setRoomData({ ...roomData, [e.target.name]: e.target.value });
  };

  // Handlers for Personal Rows
  const handlePersonalRowChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRows = [...personalRows];
    updatedRows[index][name] = value;
    setPersonalRows(updatedRows);
  };

  const addPersonalRow = () => {
    setPersonalRows([...personalRows, createEmptyPersonalRow()]);
  };

  const removePersonalRow = (index) => {
    if (personalRows.length === 1) return;
    const updatedRows = personalRows.filter((_, i) => i !== index);
    setPersonalRows(updatedRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (activeTab === 'room') {
        // Room Entry Submission
        const finalRoomData = {
          ...roomData,
          RDate: roomData.RDate || getTodayDate()
        };
        const payload = { type: 'room', ...finalRoomData };
        const formData = new URLSearchParams();
        Object.keys(payload).forEach((key) => formData.append(key, payload[key]));

        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });
      } else if (activeTab === 'personal') {
        // Multiple Personal Entries Submission
        const requests = personalRows.map((row) => {
          const finalPersonalData = {
            type: 'personal',
            PersonalDate: row.PersonalDate || getTodayDate(),
            PersonalName: row.PersonalName,
            PersonalCategory: row.PersonalCategory,
            PersonalAmount: row.PersonalAmount
          };

          const formData = new URLSearchParams();
          Object.keys(finalPersonalData).forEach((key) => formData.append(key, finalPersonalData[key]));

          return fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
          });
        });

        await Promise.all(requests);
      }

      setMessage({ type: 'success', text: 'Transaction saved successfully!' });

      if (refreshData) refreshData();

      setTimeout(() => {
        if (activeTab === 'room') {
          setRoomData({ RDate: '', Rent: '', Electricity: '', RMoneyUseName: '', RMoneyUseAmount: '' });
        } else {
          setPersonalRows([createEmptyPersonalRow()]);
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
      {/* Top Header Bar */}
      <div className="modal-top-bar">
        <div className="drag-handle"></div>
        <button className="close-modal-btn" type="button" onClick={onClose} aria-label="Close modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="modal-header-info">
        <h2>New Entry</h2>
        
      </div>

      {/* Modern Segmented Tab Switcher */}
      <div className="segmented-control">
        <button
          type="button"
          className={`segment-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => { setActiveTab('personal'); setMessage({ type: '', text: '' }); }}
        >
          Personal
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'room' ? 'active' : ''}`}
          onClick={() => { setActiveTab('room'); setMessage({ type: '', text: '' }); }}
        >
          Rent
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'coaching' ? 'active' : ''}`}
          onClick={() => { setActiveTab('coaching'); setMessage({ type: '', text: '' }); }}
        >
          Upay
        </button>
      </div>

      {/* Smooth Notification Banner */}
      {message.text && (
        <div className={`status-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Dynamic Tab Content rendering */}
      {activeTab === 'coaching' ? (
        <div className="tab-pane-fade">
          <Add onNavigate={onNavigate} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="modal-form">
          {activeTab === 'room' ? (
            <div className="tab-pane-fade">
              <div className="form-group">
                <label>Date <span className="label-hint">(Defaults to today)</span></label>
                <input
                  type="date"
                  name="RDate"
                  value={roomData.RDate}
                  onChange={handleRoomChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rent Payed (₹)</label>
                  <input
                    type="number"
                    name="Rent"
                    placeholder="0"
                    value={roomData.Rent}
                    onChange={handleRoomChange}
                  />
                </div>

                <div className="form-group">
                  <label>Electricity Bill (₹)</label>
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
                <label>Room Money Used For</label>
                <input
                  type="text"
                  name="RMoneyUseName"
                  placeholder="e.g. Alex"
                  value={roomData.RMoneyUseName}
                  onChange={handleRoomChange}
                />
              </div>

              <div className="form-group">
                <label>Used Room Money Amount (₹)</label>
                <input
                  type="number"
                  name="RMoneyUseAmount"
                  placeholder="0"
                  value={roomData.RMoneyUseAmount}
                  onChange={handleRoomChange}
                />
              </div>
            </div>
          ) : (
            <div className="tab-pane-fade personal-rows-container">
              {personalRows.map((row, index) => (
                <div key={row.id} className="personal-item-card">
                  <div className="item-card-header">
                    <span>Entry #{index + 1}</span>
                    {personalRows.length > 1 && (
                      <button
                        type="button"
                        className="remove-row-btn"
                        onClick={() => removePersonalRow(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="PersonalDate"
                      value={row.PersonalDate}
                      onChange={(e) => handlePersonalRowChange(index, e)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description </label>
                    <input
                      type="text"
                      name="PersonalName"
                      placeholder="Purpose"
                      value={row.PersonalName}
                      onChange={(e) => handlePersonalRowChange(index, e)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="PersonalCategory"
                        value={row.PersonalCategory}
                        onChange={(e) => handlePersonalRowChange(index, e)}
                        required
                      >
                        <option value="Junk">Food</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Money Personal">Personal</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input
                        type="number"
                        name="PersonalAmount"
                        placeholder="0.00"
                        value={row.PersonalAmount}
                        onChange={(e) => handlePersonalRowChange(index, e)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="add-row-btn"
                onClick={addPersonalRow}
              >
                <span>+</span> Add Another Expense
              </button>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-text">Saving Entries...</span>
            ) : (
              'Save Record'
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default Personal;