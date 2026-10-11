import React, { useState, useEffect } from 'react';
import RentPage from './RentPage';
import AddTransition from './AddTransition';
import './Home.css';

const Homepage = () => {
  const [data, setData] = useState({
    metrics: {},
    comSpend: [],
    spendTransactions: [],
    rentTransactions: [],
    emiList: []
  });
  const [loading, setLoading] = useState(true);
  const [emiUpdating, setEmiUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [expandedEmiName, setExpandedEmiName] = useState(null);
  
  // Add Transaction Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTypeContext, setAddTypeContext] = useState('spend'); // 'spend' or 'rent'

  const API_URL = "https://script.google.com/macros/s/AKfycbzUzJPp-KfLT189AOv32aCirGalPML0e5TicT0qWxgUcZFBK-qgIbURheOsvS8VfjV-/exec";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setEmiUpdating(false);
    }
  };

  const formatDateToDDMMYY = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const handleEndEmi = async (emiName) => {
    try {
      setEmiUpdating(true);
      setExpandedEmiName(null);

      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          type: 'emi',
          EmiName: emiName,
          EmiRemark: 'End'
        })
      });

      fetchData(true);
    } catch (error) {
      console.error("Error updating EMI:", error);
      setEmiUpdating(false);
    }
  };

  const activeEmiList = (data.emiList || []).filter(
    item => !item.emiRemark || item.emiRemark.trim().toLowerCase() !== 'end'
  );

  const filterTransactions = (list) => {
    return (list || []).filter(item => {
      const matchesCategory = selectedCategory 
        ? item.spendcategory && item.spendcategory.trim().toLowerCase() === selectedCategory.trim().toLowerCase() 
        : true;
      
      let matchesMonth = true;
      if (selectedMonth && item.spenddate) {
        const itemDate = new Date(item.spenddate);
        if (!isNaN(itemDate.getTime())) {
          const monthNum = String(itemDate.getMonth() + 1).padStart(2, '0');
          matchesMonth = monthNum === selectedMonth;
        } else {
          matchesMonth = item.spenddate.includes(`-${selectedMonth}-`) || item.spenddate.startsWith(`${selectedMonth}/`);
        }
      }

      return matchesCategory && matchesMonth;
    });
  };

  const displayedTransactions = showAllTransactions 
    ? filterTransactions(data.spendTransactions) 
    : filterTransactions(data.spendTransactions).slice(0, 4);

  const monthsList = [
    { value: '', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  if (loading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner"></div>
        <p>Loading Please Wait...</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="device-frame">
        
        {/* APP HEADER */}
        <header className="app-header">
          <div className="brand-info">
            <span className="greeting">WELCOME BACK</span>
            <h1></h1>
          </div>
          <button className="logout-pill" onClick={() => alert('Logged out!')}>
            Logout
          </button>
        </header>

        {/* MAIN SCROLLABLE VIEW */}
        <main className="main-content hide-scrollbar">
          
          {/* ADD TRANSACTION OVERLAY */}
          {showAddModal ? (
            <AddTransition 
              API_URL={API_URL} 
              initialType={addTypeContext}
              onSuccess={() => {
                setShowAddModal(false);
                fetchData(true);
              }}
              onCancel={() => setShowAddModal(false)}
            />
          ) : (
            <>
              {/* HOME TAB VIEW */}
              {activeTab === 'home' && !showAllTransactions && (
                <div className="fade-in">
                  
                  {/* TOP ACTION BUTTON */}
                  <button 
                    className="primary-action-btn top-action-btn" 
                    onClick={() => {
                      setAddTypeContext('spend');
                      setShowAddModal(true);
                    }}
                  >
                    <span> Add New Transition</span>
                  </button>

                  {/* FROSTED GLASS HERO DECK WITH AMBIENT BALLS */}
                  <div className="hero-card-container">
                    <div className="ambient-orb orb-1"></div>
                    <div className="ambient-orb orb-2"></div>
                    
                    <div className="hero-card-glass">
                      <div className="hero-top-row">
                        <div className="budget-main">
                          <span className="card-label">Remaning MONTHLY BUDGET</span>
                          <h2>
                            {data.metrics['MonthlyBudget'] || 2500} <small>Rs</small>
                          </h2>
                        </div>
                        
                        <div className="balance-pill-glass">
                          <span className="pill-title">Compulsory Balance</span>
                          <span className="pill-value">{data.metrics['Account1Balance'] || 0} Rs</span>
                        </div>
                      </div>

                      <div className="card-glass-divider"></div>

                      <div className="metrics-grid">
                        <div className="metric-box-glass">
                          <span className="metric-title">Card Use</span>
                          <span className="metric-val">{data.metrics['CardUse'] || 0} <small>rs</small></span>
                        </div>
                        <div className="metric-box-glass">
                          <span className="metric-title">Food Exp</span>
                          <span className="metric-val">{data.metrics['FoodExpense'] || 0} <small>rs</small></span>
                        </div>
                        <div className="metric-box-glass">
                          <span className="metric-title">Shopping</span>
                          <span className="metric-val">{data.metrics['ShoppingExpense'] || 0} <small>rs</small></span>
                        </div>
                        <div className="metric-box-glass">
                          <span className="metric-title">Other Exp</span>
                          <span className="metric-val">{data.metrics['OtherExpense'] || 0} <small>rs</small></span>
                        </div>
                        <div className="metric-box-glass">
                          <span className="metric-title">Current EMI</span>
                          <span className="metric-val">{data.metrics['CurrentMonthEmi'] || 0} <small>rs</small></span>
                        </div>
                        <div className="metric-box-glass">
                          <span className="metric-title">Sav. (AW)</span>
                          <span className="metric-val">{data.metrics['AWsaving'] || 0} <small>rs</small></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COMPACT BUBBLE EMI SECTION */}
                  <section className="emi-bubbles-section">
                    <div className="emi-section-title">
                      <span>Running EMIs</span>
                      <span className={`emi-count-badge ${emiUpdating ? 'badge-updating' : ''}`}>
                        {emiUpdating ? 'Updating...' : `${activeEmiList.length} Active`}
                      </span>
                    </div>
                    
                    {activeEmiList.length > 0 ? (
                      <div className={`emi-bubbles-container hide-scrollbar ${emiUpdating ? 'updating-fade' : ''}`}>
                        {activeEmiList.map((emi, idx) => {
                          const isExpanded = expandedEmiName === emi.emiName;
                          return (
                            <div className="emi-bubble-wrapper" key={idx}>
                              <div 
                                className={`emi-bubble ${isExpanded ? 'active' : ''}`}
                                onClick={() => setExpandedEmiName(isExpanded ? null : emi.emiName)}
                              >
                                <div className="emi-bubble-info">
                                  <span className="emi-bubble-name">{emi.emiName}</span>
                                  <span className="emi-bubble-amt">{emi.emiAmount} rs</span>
                                </div>
                                <div className="emi-bubble-right">
                                  <span className="emi-bubble-months">{emi.emiMonths}m</span>
                                  <span className="expand-chevron">{isExpanded ? '▲' : '▼'}</span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="emi-action-drawer fade-in">
                                  <button 
                                    className="confirm-end-emi-btn"
                                    onClick={() => handleEndEmi(emi.emiName)}
                                  >
                                    End
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="empty-text">No active EMIs</p>
                    )}
                  </section>

                  {/* RECENT TRANSACTIONS */}
                  <section className="section-block">
                    <div className="section-header">
                      <h3>Recent Transactions</h3>
                      <button className="text-link" onClick={() => setShowAllTransactions(true)}>View All</button>
                    </div>

                    <div className="filter-row hide-scrollbar">
                      {['Food', 'Other', 'Shopping', 'AW'].map(cat => (
                        <button 
                          key={cat}
                          className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                          {cat}
                        </button>
                      ))}

                      <select 
                        className="month-select-dropdown"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {monthsList.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="transactions-stack">
                      {displayedTransactions.length > 0 ? (
                        displayedTransactions.map((tx, idx) => (
                          <div className="transaction-card" key={idx}>
                            <div className="tx-left">
                              <span className="tx-category-tag">{tx.spendcategory || 'General'}</span>
                              <span className="tx-name">{tx.spendName}</span>
                            </div>
                            <div className="tx-right">
                              <span className="tx-amount">{tx.spendAmount} Rs</span>
                              <span className="tx-date">{formatDateToDDMMYY(tx.spenddate)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="empty-text">No matching transactions.</p>
                      )}
                    </div>
                  </section>

                </div>
              )}

              {/* ALL TRANSACTIONS VIEW */}
              {activeTab === 'home' && showAllTransactions && (
                <div className="fade-in">
                  <div className="section-block expanded-view">
                    <div className="section-header">
                      <h3>All Transactions</h3>
                      <button className="text-link" onClick={() => setShowAllTransactions(false)}>Back</button>
                    </div>

                    <div className="filter-row hide-scrollbar">
                      {['Food', 'Other', 'Shopping', 'AW'].map(cat => (
                        <button 
                          key={cat}
                          className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                          {cat}
                        </button>
                      ))}

                      <select 
                        className="month-select-dropdown"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        {monthsList.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="transactions-stack scrollable hide-scrollbar">
                      {filterTransactions(data.spendTransactions).map((tx, idx) => (
                        <div className="transaction-card" key={idx}>
                          <div className="tx-left">
                            <span className="tx-category-tag">{tx.spendcategory || 'General'}</span>
                            <span className="tx-name">{tx.spendName}</span>
                          </div>
                          <div className="tx-right">
                            <span className="tx-amount">{tx.spendAmount} Rs</span>
                            <span className="tx-date">{formatDateToDDMMYY(tx.spenddate)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="secondary-action-btn" onClick={() => setShowAllTransactions(false)}>
                    Return to Dashboard
                  </button>
                </div>
              )}

              {/* UPAY TAB PLACEHOLDER */}
              {activeTab === 'upay' && (
                <div className="fade-in tab-placeholder">
                  <div className="placeholder-card">
                    <h3>Upay Section</h3>
                    <p></p>
                  </div>
                </div>
              )}

              {/* RENT TAB VIEW */}
              {activeTab === 'rent' && (
                <RentPage 
                  rentTransactions={data.rentTransactions} 
                  onOpenAddModal={() => {
                    setAddTypeContext('rent');
                    setShowAddModal(true);
                  }} 
                />
              )}
            </>
          )}

        </main>

        {/* FLOATING BOTTOM NAVIGATION */}
        <nav className="bottom-nav-bar">
          <button 
            className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('home'); setShowAllTransactions(false); setShowAddModal(false); }}
          >
            <span>Home</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'upay' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('upay'); setShowAddModal(false); }}
          >
            <span>Upay</span>
          </button>
          <button 
            className={`nav-btn ${activeTab === 'rent' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('rent'); setShowAddModal(false); }}
          >
            <span>Rent</span>
          </button>
        </nav>

      </div>
    </div>
  );
};

export default Homepage;