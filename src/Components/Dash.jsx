import React, { useEffect, useState } from 'react';
import Personal from './Personal';
import './Dash.css';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbysKlwoVanoLEXH5ltlPiVP8lg36jxoqkYrjpEh4-PLrVCAE4K7T8pClsZr9JhCP809gw/exec";

const formatDate = (dateString) => {
  if (!dateString) return 'No Date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

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
  const [activeTab, setActiveTab] = useState('personal');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [rentFilter, setRentFilter] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // Added month filter state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SCRIPT_URL);
      const result = await response.json();
      console.log("Fetched API Data:", result); 
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

  const handleCategoryClick = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  // Helper to extract available YYYY-MM options dynamically from transactions
  const availableMonths = Array.from(
    new Set(
      personalTransactions
        .map(tx => {
          if (!tx.personalDate) return null;
          const d = new Date(tx.personalDate);
          if (isNaN(d.getTime())) return null;
          // Returns string in format "YYYY-MM"
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        })
        .filter(Boolean)
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort newest first

  // Filter transactions by Category and Month
  const getFilteredTransactions = (categoryName) => {
    if (!categoryName) return [];
    
    const target = categoryName.toLowerCase().trim();

    return personalTransactions.filter(tx => {
      // Month check
      if (selectedMonth !== 'ALL' && tx.personalDate) {
        const d = new Date(tx.personalDate);
        if (!isNaN(d.getTime())) {
          const txMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (txMonth !== selectedMonth) return false;
        }
      }

      // Category check
      const rawCat = tx.personalCategory || tx.category || "";
      const cat = rawCat.toString().trim().toLowerCase();

      if (!cat) return false;

      if (target.includes('other')) return cat.includes('other');
      if (target.includes('card')) return cat.includes('card');
      if (target.includes('personal')) return cat.includes('personal');

      return cat === target;
    });
  };

  // Calculate dynamics totals when month filter is applied
  const getCategoryTotal = (categoryName, defaultMetricValue) => {
    if (selectedMonth === 'ALL') {
      return Number(defaultMetricValue || 0);
    }
    const filtered = getFilteredTransactions(categoryName);
    return filtered.reduce((acc, curr) => acc + (Number(curr.personalAmount) || 0), 0);
  };

  const totalRentAmount = roomTransactions.reduce((acc, curr) => acc + (Number(curr.rent) || 0), 0);
  const totalElectricityAmount = roomTransactions.reduce((acc, curr) => acc + (Number(curr.electricity) || 0), 0);
  const totalUsedMoneyAmount = roomTransactions.reduce((acc, curr) => acc + (Number(curr.rMoneyUseAmount) || 0), 0);

  const filteredRoomTransactions = roomTransactions.filter(tx => {
    if (rentFilter === 'RENT') return Number(tx.rent) > 0;
    if (rentFilter === 'ELEC') return Number(tx.electricity) > 0;
    if (rentFilter === 'USED') return Number(tx.rMoneyUseAmount) > 0;
    return true;
  });

  const activeFilteredList = getFilteredTransactions(expandedCategory);

  const personalCategoryValue = 
    metrics.moneyPersonal ?? 
    metrics.personal ?? 
    metrics.personalCategoryTotal ?? 
    metrics.personalTotal ?? 
    0;

  return (
    <div className="mobile-shell">
      <div className="mobile-app">
        
        <header className="app-header">
          <div className="user-profile">
            <div className="avatar">A</div>
          </div>

          <button 
            className="add-action-btn" 
            onClick={() => setIsModalOpen(true)}
            aria-label="Add New Entry"
          >
            +
          </button>
        </header>

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
              Rent
            </button>
          </div>
        </div>

        <main className="app-body">
          {loading ? (
            <div className="loading-container">
              <div className="pulse-loader"></div>
              <span>Updating Balance...</span>
            </div>
          ) : activeTab === 'personal' ? (
            <>
              <div className="hero-balance-card">
                <div className="hero-top">
                  <span className="hero-label">Min.Bal</span>
                  <span className="status-badge">Live Sync on</span>
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

              <div className="section-header activity-header">
                <div>
                  <h3>Categories</h3>
                  <span className="section-subtitle">Tap to inspect</span>
                </div>
                
                {/* Month Dropdown Filter */}
                <select 
                  className="filter-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="ALL">All Months</option>
                  {availableMonths.map(monthStr => {
                    const [year, month] = monthStr.split('-');
                    const label = new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                    return (
                      <option key={monthStr} value={monthStr}>
                        {label}
                      </option>
                    );
                  })}
                </select>
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
                      ₹{getCategoryTotal('Junk', metrics.junkTotal).toLocaleString()}
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
                      ₹{getCategoryTotal('Shopping', metrics.shoppingTotal).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${expandedCategory === 'Other Total' ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick('Other Total')}
                >
                  <div className="cat-card-top">
                    <span className="cat-icon">📌</span>
                    <span className="chevron">{expandedCategory === 'Other Total' ? '✕' : '→'}</span>
                  </div>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Other Total</span>
                    <span className="cat-value">
                      ₹{getCategoryTotal('Other Total', metrics.otherTotal).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${expandedCategory === 'Card Spend' ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick('Card Spend')}
                >
                  <div className="cat-card-top">
                    <span className="cat-icon">💳</span>
                    <span className="chevron">{expandedCategory === 'Card Spend' ? '✕' : '→'}</span>
                  </div>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Card Spend</span>
                    <span className="cat-value">
                      ₹{getCategoryTotal('Card Spend', metrics.cardSpend).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div 
                  className={`cat-card ${expandedCategory === 'Personal' ? 'expanded' : ''}`}
                  onClick={() => handleCategoryClick('Personal')}
                >
                  <div className="cat-card-top">
                    <span className="cat-icon">💰</span>
                    <span className="chevron">{expandedCategory === 'Personal' ? '✕' : '→'}</span>
                  </div>
                  <div className="cat-card-bottom">
                    <span className="cat-title">Personal</span>
                    <span className="cat-value">
                      ₹{getCategoryTotal('Personal', personalCategoryValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {expandedCategory && (
                <div className="expandable-panel">
                  <div className="panel-header">
                    <h4>{expandedCategory}</h4>
                    <span className="count-pill">{activeFilteredList.length}</span>
                  </div>

                  <div className="panel-list">
                    {activeFilteredList.length > 0 ? (
                      activeFilteredList.map((tx, idx) => (
                        <div key={idx} className="panel-item">
                          <div className="item-meta">
                            <span className="item-title">{tx.personalName || 'Unlabeled Expense'}</span>
                            <span className="item-date">{formatDate(tx.personalDate)}</span>
                          </div>
                          <span className="item-price"> ₹{Number(tx.personalAmount || 0).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-panel">No transactions recorded for {expandedCategory} {selectedMonth !== 'ALL' ? 'in this month' : ''}.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="hero-balance-card rent-accent">
                <div className="hero-top">
                  <span className="hero-label">Money I Have</span>
                  <span className="status-badge">Cash + Online</span>
                </div>
                <div className="hero-amount-wrapper">
                  <span className="currency-symbol">₹</span>
                  <h1 className="hero-amount">
                    {metrics.totalRMoney ? Number(metrics.totalRMoney).toLocaleString() : '0'}
                  </h1>
                </div>
              </div>

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

              <div className="activity-list">
                {filteredRoomTransactions && filteredRoomTransactions.length > 0 ? (
                  filteredRoomTransactions.map((tx, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-main">
                        <span className="activity-title">
                          {rentFilter === 'USED' 
                            ? (tx.rMoneyUseName ? `Used by ${tx.rMoneyUseName}` : 'Used Entry') 
                            : ''}
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
                        {rentFilter === 'USED' && Number(tx.rMoneyUseAmount) > 0 && (
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