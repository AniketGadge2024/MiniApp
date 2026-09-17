import React, { useState, useEffect } from 'react';
// import './Dash.css'; 

const Upaydash = () => {
  const [data, setData] = useState({ transactions: [], metrics: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- FILTER STATES ---
  const [typeFilter, setTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');

  const API_URL = "https://script.google.com/macros/s/AKfycbxExEzcY3sEzYZxHmJxSry7Z53VzsFlDtryY6nfQxEN5uUFAA5HRb-rSUnyp4uZrpia/exec";

  const monthNames = [
    { value: 'All', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard data");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="dash-loading"><div className="spinner"></div><span>Loading Workspace...</span></div>;
  if (error) return <div className="dash-error">Error: {error}</div>;

  const { metrics, transactions } = data;

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '—';
    const str = dateStr.toString();
    if (str.includes('GMT') || str.length > 15) {
      try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      } catch (e) { return str; }
    }
    return str;
  };

  const getMonthFromDateString = (dateStr) => {
    if (!dateStr) return null;
    const str = dateStr.toString().toLowerCase().trim();
    const monthsAbbrev = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (let i = 0; i < monthsAbbrev.length; i++) {
      if (str.includes(monthsAbbrev[i])) return i + 1;
    }
    if (str.includes('/')) return parseInt(str.split('/')[1], 10);
    if (str.includes('-')) return parseInt(str.split('-')[1], 10);
    return null;
  };

  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter((tx) => {
    let matchesType = true;
    if (typeFilter === 'Payment') matchesType = tx.comment === 'Payment';
    else if (typeFilter === 'Xerox') matchesType = tx.comment === 'Xerox';
    else if (typeFilter === 'Other') matchesType = tx.comment !== 'Payment' && tx.comment !== 'Xerox';

    let matchesMonth = true;
    if (monthFilter !== 'All') {
      const txMonth = getMonthFromDateString(tx.date);
      matchesMonth = txMonth === parseInt(monthFilter, 10);
    }
    return matchesType && matchesMonth;
  });

  // Calculate the total by completely filtering out the Payment categories
  const filteredTotal = filteredTransactions
    .filter((tx) => tx.comment !== 'Payment')
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);

  // --- RE-AGGREGATING TRANSACTIONS FOR DONUT CHART ---
  const filteredSalary = filteredTransactions.filter(tx => tx.comment !== 'Payment' && tx.comment !== 'Xerox').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const filteredXerox = filteredTransactions.filter(tx => tx.comment === 'Xerox').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const filteredPayment = filteredTransactions.filter(tx => tx.comment === 'Payment').reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  
  const chartTotal = filteredSalary + filteredXerox + filteredPayment;

  const salaryPct = chartTotal > 0 ? (filteredSalary / chartTotal) * 100 : 0;
  const xeroxPct = chartTotal > 0 ? (filteredXerox / chartTotal) * 100 : 0;

  const pieGradientStyle = {
    background: `conic-gradient(
      #ffb020 0% ${salaryPct}%, 
      #ff4d6d ${salaryPct}% ${salaryPct + xeroxPct}%, 
      #535bf2 ${salaryPct + xeroxPct}% 100%
    )`
  };

  return (
    <div className="dash-canvas-frame app-desktop-optimized frame-fade-in">
      
      {/* HEADER SECTION */}
      <header className="dash-navbar-header">
        <div className="dash-brand-stack">
          <h1 className="dash-brand-heading">Workspace Overview</h1>
          <p className="dash-brand-subtext-meta">Session 2026-2027</p>
        </div>
      </header>

      {/* --- TOP LEVEL BENTO BLOCKS --- */}
      <div className="dash-bento-layout row-slide-up-1">
        <div className="dash-live-metrics-panel primary-split-view">
          <div className="dash-metric-card border-card-blue">
            <span className="dash-card-micro-label">Overall Balance</span>
            <span className="dash-card-massive-display">{(metrics.overallTotal ?? 0).toLocaleString()} Rs</span>
          </div>
          
          <div className={`dash-metric-card ${metrics.currentSessionTotal < 0 ? 'border-card-red' : 'border-card-green'}`}>
            <span className="dash-card-micro-label">Current Session</span>
            <span className="dash-card-massive-display">{(metrics.currentSessionTotal ?? 0).toLocaleString()} Rs</span>
          </div>
        </div>

        {/* SESSION RETAINERS WITH LUXE CURVES */}
        <div className="dash-summary-workspace-card balance-meta-card">
          <span className="dash-card-micro-label mb-16 block">Session Archival Retainers</span>
          <div className="dash-table-viewport-wrapper">
            <table className="dash-statement-table">
              <tbody>
                <tr>
                  <td className="dash-td-alignment-left text-muted-opacity">FY 2024-25 Remaining</td>
                  <td className="dash-td-alignment-right text-muted-opacity font-medium-weight">₹{(metrics.remaining24_25 ?? 0).toLocaleString()}</td>
                </tr>
                <tr className="dash-no-border-row">
                  <td className="dash-td-alignment-left active-accent-color font-semibold-weight">FY 2025-26 Remaining</td>
                  <td className="dash-td-alignment-right active-accent-color font-heavy-weight">₹{(metrics.remaining25_26 ?? 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- LIVE WORKSPACE SECTION --- */}
      <section className="dash-table-workspace-container row-slide-up-2">
        
        {/* POLISHED INTERACTIVE INTELLIGENCE CONTROLLER DOCK */}
        <div className="dash-interactive-filter-bar filter-layout-split">
          
          {/* CONTROL DOCK SIDE */}
          <div className="filter-controls-side">
            <div className="control-filter-card-dock">
              <div className="dash-control-group-node">
                <label className="dash-select-input-label">Classification</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="dash-primitive-select-control">
                  <option value="All">All Transactions</option>
                  <option value="Payment">Only Payments</option>
                  <option value="Xerox">Only Xerox</option>
                  <option value="Other">Other Comments</option>
                </select>
              </div>

              <div className="dash-control-group-node">
                <label className="dash-select-input-label">Timeline</label>
                <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="dash-primitive-select-control">
                  {monthNames.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dash-badge-aggregate-pop-card" key={filteredTotal}>
              <span className="dash-badge-micro-tag">Total (Excl. Payments)</span>
              <span className="dash-badge-massive-value">₹ {filteredTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* ULTRA POLISHED MORPHING DONUT PIE CARD */}
          <div className="pie-visualization-block interactive-chart-card">
            {chartTotal > 0 ? (
              <>
                <div className="native-minimal-pie scale-up-entry" style={pieGradientStyle}>
                  <div className="pie-center-mask"></div>
                </div>
                
                <div className="pie-legend-column">
                  <div className="legend-item animate-item-1">
                    <span className="legend-dot color-amber"></span>
                    <span className="legend-title-txt">Other</span>
                    <span className="legend-value-txt">₹{filteredSalary.toLocaleString()}</span>
                  </div>
                  <div className="legend-item animate-item-2">
                    <span className="legend-dot color-rose"></span>
                    <span className="legend-title-txt">Xerox</span>
                    <span className="legend-value-txt">₹{filteredXerox.toLocaleString()}</span>
                  </div>
                  <div className="legend-item animate-item-3">
                    <span className="legend-dot color-indigo"></span>
                    <span className="legend-title-txt">Payment</span>
                    <span className="legend-value-txt">₹{filteredPayment.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="chart-empty-state">No real-time graph available for current metrics.</div>
            )}
          </div>

        </div>

        {/* REFINED LEDGER DATATABLE BLOCK */}
        <div className="dash-table-meta-header-row">
          <h2 className="dash-table-main-title">Transactional Stream Ledger</h2>
          <span className="dash-entry-counter-pill" key={filteredTransactions.length}>
            Number of Transitions {filteredTransactions.length} 
          </span>
        </div>
        
        <div className="dash-table-viewport-wrapper main-ledger-radius">
          <table className="dash-main-ledger-table">
            <thead>
              <tr className="dash-th-ledger-row">
                <th>Date</th>
                <th>Amount</th>
                <th>Category Tag</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx, index) => (
                  <tr key={`${tx.date}-${index}`} className="dash-ledger-row row-fade-in-item" style={{ '--anim-index': index > 15 ? 15 : index }}>
                    <td className="dash-td-bold-date">{formatDisplayDate(tx.date)}</td>
                    <td className="dash-td-heavy-amount">₹{Number(tx.amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`dash-badge-chip-node dash-badge-${tx.comment ? tx.comment.toLowerCase() : 'other'}`}>
                        {tx.comment || 'Other'}
                      </span>
                    </td>
                    <td className="dash-td-italic-remarks">{tx.specialComment || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="dash-no-data-fallback-cell">No localized records match your dynamic filtering preferences.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Upaydash;