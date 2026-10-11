import React, { useState } from 'react';
import './Home.css';
import './Add.css';

const AddTransition = ({ API_URL, onSuccess, onCancel, initialType = 'spend' }) => {
  const [activeType, setActiveType] = useState(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [awSign, setAwSign] = useState('+');
  const [isCardSelected, setIsCardSelected] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    // Spend fields (Columns G:K)
    SpendDate: new Date().toISOString().split('T')[0],
    SpendName: '',
    Spendcategory: 'Food',
    SpendAmount: '',

    // Rent fields (Columns M:Q)
    RentDate: new Date().toISOString().split('T')[0],
    RentAmount: '',
    RentElectricity: '',
    RentUse: '',
    RentUseAmount: '',

    // ComSpend fields
    ComSpendName: '',
    ComSpendAmount: '',

    // EMI fields
    EmiName: '',
    EmiAmount: '',
    EmiMonths: '',
    DueDate: new Date().toISOString().split('T')[0],
    EmiRemark: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Switch between + and - for AW Category
  const handleAwSign = (sign) => {
    setAwSign(sign);
    if (!formData.SpendAmount) return;

    const absVal = Math.abs(parseFloat(formData.SpendAmount));
    if (isNaN(absVal)) return;

    setFormData(prev => ({
      ...prev,
      SpendAmount: sign === '-' ? `-${absVal}` : `${absVal}`
    }));
  };

  // Handle Amount input with AW sign awareness
  const handleAmountChange = (e) => {
    const rawVal = e.target.value;
    if (formData.Spendcategory === 'AW' && rawVal !== '') {
      const absVal = Math.abs(parseFloat(rawVal));
      if (!isNaN(absVal)) {
        setFormData(prev => ({
          ...prev,
          SpendAmount: awSign === '-' ? `-${absVal}` : `${absVal}`
        }));
        return;
      }
    }
    setFormData(prev => ({ ...prev, SpendAmount: rawVal }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = new URLSearchParams({ type: activeType });

      if (activeType === 'spend') {
        payload.append('SpendDate', formData.SpendDate);
        payload.append('SpendName', formData.SpendName || '');
        payload.append('Spendcategory', formData.Spendcategory);
        payload.append('SpendAmount', formData.SpendAmount);
        payload.append('SpendRemark', isCardSelected ? 'Card' : '');
      } else if (activeType === 'rent') {
        payload.append('RentDate', formData.RentDate);
        payload.append('RentAmount', formData.RentAmount);
        payload.append('RentElectricity', formData.RentElectricity);
        payload.append('RentUse', formData.RentUse);
        payload.append('RentUseAmount', formData.RentUseAmount);
      } else if (activeType === 'comspend') {
        payload.append('ComSpendName', formData.ComSpendName);
        payload.append('ComSpendAmount', formData.ComSpendAmount);
      } else if (activeType === 'emi') {
        payload.append('EmiName', formData.EmiName);
        payload.append('EmiAmount', formData.EmiAmount);
        payload.append('EmiMonths', formData.EmiMonths);
        payload.append('DueDate', formData.DueDate);
        payload.append('EmiRemark', formData.EmiRemark);
      }

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting transaction:", error);
      alert("Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in add-transition-container">
      <div className="section-header">
        <h3>
          {initialType === 'spend' 
            ? 'Personal Spend' 
            : initialType === 'rent' 
            ? 'Rent Logs' 
            : 'Add Transaction'}
        </h3>
        {onCancel && <button className="text-link" onClick={onCancel}>Cancel</button>}
      </div>

      {initialType !== 'spend' && initialType !== 'rent' && (
        <div className="add-type-tabs hide-scrollbar">
          {[
            { id: 'spend', label: 'Spend' },
            { id: 'rent', label: 'Rent' },
            { id: 'comspend', label: 'ComSpend' },
            { id: 'emi', label: 'EMI' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`add-type-chip ${activeType === tab.id ? 'active' : ''}`}
              onClick={() => setActiveType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-form">
        {/* --- SPEND FORM --- */}
        {activeType === 'spend' && (
          <div className="form-fields-group fade-in">
            <div className="input-field-wrapper">
              <label>Date</label>
              <input
                type="date"
                name="SpendDate"
                value={formData.SpendDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* ITEM / STORE NAME (OPTIONAL) */}
            <div className="input-field-wrapper">
              <label>Purpose</label>
              <input
                type="text"
                name="SpendName"
               
                value={formData.SpendName}
                onChange={handleChange}
              />
            </div>

            <div className="input-row-grid">
              <div className="input-field-wrapper">
                <label>Category</label>
                <select
                  name="Spendcategory"
                  value={formData.Spendcategory}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value !== 'AW') setAwSign('+');
                  }}
                >
                  <option value="Food">Food</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                  <option value="AW">AW</option>
                </select>
              </div>

              {/* AMOUNT FIELD WITH TOP-RIGHT (+) AND (-) BUTTONS */}
              <div className="input-field-wrapper">
                <div className="field-header-row">
                  <label>Amount</label>
                  
                  {formData.Spendcategory === 'AW' && (
                    <div className="aw-btn-group">
                      <button
                        type="button"
                        className={`aw-btn ${awSign === '+' ? 'active-plus' : ''}`}
                        onClick={() => handleAwSign('+')}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={`aw-btn ${awSign === '-' ? 'active-minus' : ''}`}
                        onClick={() => handleAwSign('-')}
                      >
                        -
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="number"
                  name="SpendAmount"
                  placeholder="0.00"
                  value={formData.SpendAmount}
                  onChange={handleAmountChange}
                  required
                />
              </div>
            </div>

            {/* REMARK TOGGLE ONLY (NO INPUT TEXT BOX) */}
            <div className="input-field-wrapper">
              <label>Use</label>
              <button
                type="button"
                className={`card-standalone-btn ${isCardSelected ? 'active' : ''}`}
                onClick={() => setIsCardSelected(!isCardSelected)}
              >
              Card
              </button>
            </div>
          </div>
        )}

        {/* --- RENT FORM --- */}
        {activeType === 'rent' && (
          <div className="form-fields-group fade-in">
            <div className="input-field-wrapper">
              <label>Date</label>
              <input
                type="date"
                name="RentDate"
                value={formData.RentDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-row-grid">
              <div className="input-field-wrapper">
                <label>Rent Amount</label>
                <input
                  type="number"
                  name="RentAmount"
                  placeholder=""
                  value={formData.RentAmount}
                  onChange={handleChange}
                />
              </div>
              <div className="input-field-wrapper">
                <label>Electricity Amount</label>
                <input
                  type="number"
                  name="RentElectricity"
                  placeholder=""
                  value={formData.RentElectricity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-row-grid">
              <div className="input-field-wrapper">
                <label>Rent Use</label>
                <input
                  type="text"
                  name="RentUse"
                  
                  value={formData.RentUse}
                  onChange={handleChange}
                />
              </div>
              <div className="input-field-wrapper">
                <label>Rent Use</label>
                <input
                  type="number"
                  name="RentUseAmount"
                  placeholder="0.00"
                  value={formData.RentUseAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- COMSPEND FORM --- */}
        {activeType === 'comspend' && (
          <div className="form-fields-group fade-in">
            <div className="input-field-wrapper">
              <label>Common Spend Name</label>
              <input
                type="text"
                name="ComSpendName"
                placeholder="e.g. WiFi, Groceries"
                value={formData.ComSpendName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field-wrapper">
              <label>Amount (Rs)</label>
              <input
                type="number"
                name="ComSpendAmount"
                placeholder="0.00"
                value={formData.ComSpendAmount}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        {/* --- EMI FORM --- */}
        {activeType === 'emi' && (
          <div className="form-fields-group fade-in">
            <div className="input-field-wrapper">
              <label>EMI Name</label>
              <input
                type="text"
                name="EmiName"
                placeholder="e.g. Phone, Laptop"
                value={formData.EmiName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-row-grid">
              <div className="input-field-wrapper">
                <label>Monthly Amount (Rs)</label>
                <input
                  type="number"
                  name="EmiAmount"
                  placeholder="0.00"
                  value={formData.EmiAmount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-field-wrapper">
                <label>Total Months</label>
                <input
                  type="number"
                  name="EmiMonths"
                  placeholder="e.g. 6"
                  value={formData.EmiMonths}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-field-wrapper">
              <label>Due Date</label>
              <input
                type="date"
                name="DueDate"
                value={formData.DueDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-field-wrapper">
              <label>Remark</label>
              <input
                type="text"
                name="EmiRemark"
                placeholder="Optional"
                value={formData.EmiRemark}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        <button type="submit" className="primary-action-btn submit-btn" disabled={submitting}>
          <span>{submitting ? 'Saving...' : 'Save Entry'}</span>
        </button>
      </form>
    </div>
  );
};

export default AddTransition;