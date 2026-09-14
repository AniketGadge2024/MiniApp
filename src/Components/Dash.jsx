import React, { useEffect, useState } from 'react';
import Personal from './Personal';
import './Dash.css';

// Replace with your Google Apps Script Web App Deployment URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbztOKhcpPFrSAiy2J74i5EqBrRJagmz7wc9tWHbexDab218vbFrhdme1MM3lJLtUVxZwA/exec";

// Helper function to format raw dates into "09 Sep 2026"
const formatDate = (dateString) => {
  if (!dateString) return 'No Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if invalid date string

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const Dash = () => {
  const [data, setData] = useState({
    roomTransactions: [],
    personalTransactions: [],
    metrics: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'rent'
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [rentFilter, setRentFilter] = useState('ALL'); // 'ALL', 'RENT', 'ELEC', 'USED'

  // Top-to-bottom overlay modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { metrics = {}, personalTransactions = [], roomTransactions = [] } = data;

  // Personal category breakdown selection
  const handleCategoryClick = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const getFilteredTransactions = (categoryName) => {
    if (!categoryName) return [];
    return personalTransactions.filter(tx => 
      tx.personalCategory?.toString().trim().toLowerCase() === categoryName.toLowerCase()
    );
  };

  // Aggregated totals for Room/Rent section
  const totalRentAmount = roomTransactions.reduce((acc, curr) => acc + (Number(curr.rent) || 0), 0);
  const totalElectricityAmount = roomTransactions.reduce((acc, curr) => acc + (Number(curr.electricity) || 0), 0);
  const totalUsedMoneyAmount = roomTransactions.reduce((acc, curr) => acc + (Number(curr.rMoneyUseAmount) || 0), 0);

  // Filtered activity list for Room/Rent section
  const filteredRoomTransactions = roomTransactions.filter(tx => {
    if (rentFilter === 'RENT') return Number(tx.rent) > 0;
    if (rentFilter === 'ELEC') return Number(tx.electricity) > 0;
    if (rentFilter === 'USED') return Number(tx.rMoneyUseAmount) > 0;
    return true; // 'ALL'
  });

  const activeFilteredList = getFilteredTransactions(expandedCategory);

  return (
    <div className="mobile-shell">
      <div className="mobile-app">
        {/* Header Bar */}
        <header className="app-header">
          <div className="user-profile">
            <div className="avatar">A</div>
            <div>
              <span className="greeting">Welcome back</span>
              <h2 className="user-name">Financial Hub</h2>
            </div>
          </div>

          <button 
            className="add-action-btn" 
            onClick={() => setIsModalOpen(true)}
            aria-label="Add New Entry"
          >
            +
          </button>
        </header>

        {/* Tab Switcher */}
        <div className="tab-wrapper">
          <div className="tab-switcher">
            <button
              className={`tab-item ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => { setActiveTab('personal'); setExpandedCategory(null); }}
            >
              Personal
            </button>
            <button
              className={`tab-item ${activeTab === 'rent' ? 'active' : ''}`}
              onClick={() => { setActiveTab('rent'); setExpandedCategory(null); }}
            >
              Rent & Room
            </button>
          </div>
        </div>

        {/* Main Body */}
        <main className="app-body">
          {loading ? (
            <div className="loading-container">
              <div className="pulse-loader"></div>
              <span>Updating Balance...</span>
            </div>
          ) : activeTab === 'personal' ? (
            /* ================= PERSONAL SECTION ================= */
            <>
              <div className="hero-balance-card">
                <div className="hero-top">
                  <span className="hero-label">Total Balance</span>
                  <span className="status-badge">Live Sync</span>
                </div>
                <div className="hero-amount-wrapper">
                  <span className="currency-symbol">₹</span>
                  <h1 className="hero-amount">
                    {metrics.personalTotal !== undefined && metrics.personalTotal !== ""
                      ? Number(metrics.personalTotal).toLocaleString() 
                      : '0'}
                  </h1>
                </div>
              </div>

              <div className="section-header">
                <h3>Categories</h3>
                <span className="section-subtitle">Tap to inspect</span>
              </div>

              <div className="category-grid">
                <div 
                  className={`cat-card ${expandedCategory === 'Junk' ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick('Junk')}
                >
                  <div className="cat-card-top">
                    <span className="cat-icon">🍔</span>
                    <span className="chevron">{expandedCategory === 'Junk' ? '✕' : '→'}</span>
                  </div>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Junk</span>
                    <span className="cat-value">
                      ₹{metrics.junkTotal ? Number(metrics.junkTotal).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${expandedCategory === 'Shopping' ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick('Shopping')}
                >
                  <div className="cat-card-top">
                    <span className="cat-icon">🛍️</span>
                    <span className="chevron">{expandedCategory === 'Shopping' ? '✕' : '→'}</span>
                  </div>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Shopping</span>
                    <span className="cat-value">
                      ₹{metrics.shoppingTotal ? Number(metrics.shoppingTotal).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${expandedCategory === 'Money Personal' ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick('Money Personal')}
                >
                  <div className="cat-card-top">
                    <span className="cat-icon">💳</span>
                    <span className="chevron">{expandedCategory === 'Money Personal' ? '✕' : '→'}</span>
                  </div>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Personal</span>
                    <span className="cat-value">
                      ₹{metrics.moneyPersonal ? Number(metrics.moneyPersonal).toLocaleString() : '0'}
                    </span>
                  </div>
                </div>
              </div>

              {expandedCategory && (
                <div className="expandable-panel">
                  <div className="panel-header">
                    <h4>{expandedCategory} Breakdown</h4>
                    <span className="count-pill">{activeFilteredList.length} items</span>
                  </div>

                  <div className="panel-list">
                    {activeFilteredList.length > 0 ? (
                      activeFilteredList.map((tx, idx) => (
                        <div key={idx} className="panel-item">
                          <div className="item-meta">
                            <span className="item-title">{tx.personalName || 'Unlabeled Expense'}</span>
                            <span className="item-date">{formatDate(tx.personalDate)}</span>
                          </div>
                          <span className="item-price">- ₹{Number(tx.personalAmount || 0).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-panel">No transactions recorded for {expandedCategory}.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ================= RENT & ROOM SECTION ================= */
            <>
              <div className="hero-balance-card rent-accent">
                <div className="hero-top">
                  <span className="hero-label">Total R-Money</span>
                  <span className="status-badge">Utilities</span>
                </div>
                <div className="hero-amount-wrapper">
                  <span className="currency-symbol">₹</span>
                  <h1 className="hero-amount">
                    {metrics.totalRMoney ? Number(metrics.totalRMoney).toLocaleString() : '0'}
                  </h1>
                </div>
              </div>

              {/* Category Toggles */}
              <div className="category-grid">
                <div 
                  className={`cat-card ${rentFilter === 'RENT' ? 'active-filter' : ''}`}
                  onClick={() => setRentFilter(rentFilter === 'RENT' ? 'ALL' : 'RENT')}
                >
                  <span className="cat-icon">🏠</span>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Rent Total</span>
                    <span className="cat-value">₹{totalRentAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${rentFilter === 'ELEC' ? 'active-filter' : ''}`}
                  onClick={() => setRentFilter(rentFilter === 'ELEC' ? 'ALL' : 'ELEC')}
                >
                  <span className="cat-icon">⚡</span>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Electricity</span>
                    <span className="cat-value">₹{totalElectricityAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${rentFilter === 'USED' ? 'active-filter' : ''}`}
                  onClick={() => setRentFilter(rentFilter === 'USED' ? 'ALL' : 'USED')}
                >
                  <span className="cat-icon">🤝</span>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Money Used</span>
                    <span className="cat-value">₹{totalUsedMoneyAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Activity Header with Select Filter */}
              <div className="section-header activity-header">
                <h3>Recent Activity</h3>
                <select 
                  className="filter-select"
                  value={rentFilter}
                  onChange={(e) => setRentFilter(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="RENT">Rent Only</option>
                  <option value="ELEC">Electricity Only</option>
                  <option value="USED">Money Used Only</option>
                </select>
              </div>

              {/* Filtered Activity List */}
              <div className="activity-list">
                {filteredRoomTransactions && filteredRoomTransactions.length > 0 ? (
                  filteredRoomTransactions.map((tx, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-main">
                        <span className="activity-title">
                          {tx.rMoneyUseName ? `Used by ${tx.rMoneyUseName}` : 'Room Shared Entry'}
                        </span>
                        <span className="activity-date">{formatDate(tx.rDate)}</span>
                      </div>
                      <div className="activity-badges">
                        {(rentFilter === 'ALL' || rentFilter === 'RENT') && Number(tx.rent) > 0 && (
                          <span className="mini-badge">Rent ₹{tx.rent}</span>
                        )}
                        {(rentFilter === 'ALL' || rentFilter === 'ELEC') && Number(tx.electricity) > 0 && (
                          <span className="mini-badge elec">Elec ₹{tx.electricity}</span>
                        )}
                        {(rentFilter === 'ALL' || rentFilter === 'USED') && Number(tx.rMoneyUseAmount) > 0 && (
                          <span className="mini-badge used">Used ₹{tx.rMoneyUseAmount}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-panel">No transactions found for this filter.</p>
                )}
              </div>
            </>
          )}
        </main>

        {/* Modal Overlay Sheet */}
        <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`}>
          <Personal 
            onClose={() => setIsModalOpen(false)} 
            refreshData={fetchData} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dash;