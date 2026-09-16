import React, { useState } from 'react';
import './Add.css';
const Add = () => {
  const API_URL = "https://script.google.com/macros/s/AKfycbzC2HUhQ38Yl1gBI7Pp3s8TdrIm1mEGcBAvpzC3hF-CTTqsaQr1yVPoZ87bh15V1zoI/exec";

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [entries, setEntries] = useState([{ Date: '', Amount: '', Comment: 'Xerox' }]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleAddEntry = () => {
    setEntries([...entries, { Date: '', Amount: '', Comment: 'Xerox' }]);
  };

  const handleRemoveEntry = (index) => {
    if (entries.length === 1) return;
    setEntries(entries.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasMissingAmount = entries.some(item => !item.Amount);
    if (hasMissingAmount) {
      setStatus({ type: 'error', message: 'Please provide a valid Amount for all entries.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const sortedEntries = [...entries].sort((a, b) => {
        const dateA = a.Date || getTodayDate();
        const dateB = b.Date || getTodayDate();
        return new Date(dateA) - new Date(dateB);
      });

      for (const item of sortedEntries) {
        const searchParams = new URLSearchParams();
        searchParams.append('Date', item.Date || getTodayDate());
        searchParams.append('Amount', item.Amount);
        searchParams.append('Comment', item.Comment.trim() || 'Other');

        await fetch(API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: searchParams.toString()
        });
      }

      setStatus({
        type: 'success',
        message: entries.length === 1
          ? 'Transaction logged!'
          : `Successfully logged ${entries.length} transactions!`
      });

      setEntries([{ Date: '', Amount: '', Comment: 'Xerox' }]);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to submit data.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-entry-container">
      {status.message && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="modal-form">
        {entries.map((item, index) => (
          <div key={index} className="personal-item-card">
            {entries.length > 1 && (
              <div className="item-card-header">
                <span>Entry #{index + 1}</span>
                <button
                  type="button"
                  className="remove-row-btn"
                  onClick={() => handleRemoveEntry(index)}
                >
                  Remove
                </button>
              </div>
            )}

            <div className="form-group">
              <label>Date <span className="label-hint">(Defaults to today)</span></label>
              <input
                type="date"
                value={item.Date}
                onChange={e => handleFieldChange(index, 'Date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                value={item.Amount}
                onChange={e => handleFieldChange(index, 'Amount', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Category / Quick Select</label>
              <div className="preset-grid-system-four-cols">
                {['Xerox', 'Payment', 'Home', 'Other'].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => handleFieldChange(index, 'Comment', preset === 'Other' ? '' : preset)}
                    className={`preset-card-node ${item.Comment === preset ? 'preset-node-active' : ''}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Comment / Description</label>
              <input
                type="text"
                value={item.Comment}
                onChange={e => handleFieldChange(index, 'Comment', e.target.value)}
              />
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddEntry} className="add-row-btn">
          <span>+</span> Add Another Entry
        </button>

        <button type="submit" disabled={submitting} className="submit-btn">
          {submitting ? "Saving Entries..." : "Save Record"}
        </button>
      </form>
    </div>
  );
};

export default Add;