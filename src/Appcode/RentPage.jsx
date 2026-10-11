import React, { useState } from 'react';
import './Home.css';
import './RentPage.css';

const RentPage = ({ rentTransactions = [], onOpenAddModal }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [showAllTransactions, setShowAllTransactions] = useState(false);

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

  // 1. Split each sheet row into individual Credit, Electricity, and Use items[cite: 3]
  const allSplitTransactions = [];
  
  (rentTransactions || []).forEach(row => {
    // Rent Credit item (Column N)[cite: 3]
    if (row.rentAmount && Number(row.rentAmount) > 0) {
      allSplitTransactions.push({
        type: 'Credit',
        date: row.rentDate,
        title: 'Rent Credit',
        amount: Number(row.rentAmount)
      });
    }

    // Electricity item (Column O)[cite: 3]
    if (row.rentElectricity && Number(row.rentElectricity) > 0) {
      allSplitTransactions.push({
        type: 'Electricity',
        date: row.rentDate,
        title: 'Electricity',
        amount: Number(row.rentElectricity)
      });
    }

    // Usage item (Column P / Q)[cite: 3]
    if ((row.rentUse && row.rentUse.trim() !== '') || (row.rentUseAmount && Number(row.rentUseAmount) > 0)) {
      allSplitTransactions.push({
        type: 'Use',
        date: row.rentDate,
        title: row.rentUse || 'Rent Use',
        amount: Number(row.rentUseAmount) || 0
      });
    }
  });

  // 2. Calculate Totals (Electricity and Credit combined sum for total credit)
  const totalRentMoneyCredit = allSplitTransactions
    .filter(item => item.type === 'Credit' || item.type === 'Electricity')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRentUsed = allSplitTransactions
    .filter(item => item.type === 'Use')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Total Rent Money = Difference between Total Credit and Total Used
  const rentTotalMoney = totalRentMoneyCredit - totalRentUsed;

  // 3. Filter Transactions including Credit, Electricity, and Use filters
  const filteredTransactions = allSplitTransactions.filter(item => {
    let matchesCategory = true;
    if (selectedCategory === 'Credit') matchesCategory = item.type === 'Credit';
    else if (selectedCategory === 'Electricity') matchesCategory = item.type === 'Electricity';
    else if (selectedCategory === 'Use') matchesCategory = item.type === 'Use';

    let matchesMonth = true;
    if (selectedMonth && item.date) {
      const itemDate = new Date(item.date);
      if (!isNaN(itemDate.getTime())) {
        const monthNum = String(itemDate.getMonth() + 1).padStart(2, '0');
        matchesMonth = monthNum === selectedMonth;
      } else {
        matchesMonth = item.date.includes(`-${selectedMonth}-`) || item.date.startsWith(`${selectedMonth}/`);
      }
    }

    return matchesCategory && matchesMonth;
  });

  const displayedTransactions = showAllTransactions 
    ? filteredTransactions 
    : filteredTransactions.slice(0, 4);

  const monthsList = [
    { value: '', label: 'Filter Month' },
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

  return (
    <div className={`fade-in ${showAllTransactions ? 'expanded-rent-view-active' : ''}`}>
      
      {/* ADD NEW TRANSACTION BUTTON */}
      {!showAllTransactions && (
        <button className="primary-action-btn top-action-btn" onClick={onOpenAddModal}>
          <span>Add New Transition</span>
        </button>
      )}

      {/* HERO DECK FOR RENT */}
      {!showAllTransactions && (
        <div className="hero-card-container">
          <div className="ambient-orb orb-1"></div>
          <div className="ambient-orb orb-2"></div>
          
          <div className="hero-card-glass">
            <div className="rent-hero-layout">
              
              <h2 className="rent-main-amount">
                {rentTotalMoney} <small>Rs</small>
              </h2>
            </div>

            <div className="card-glass-divider"></div>

            <div className="rent-metrics-row">
              <div className="rent-metric-card">
                <span className="rent-metric-title">Total Rent Money + Electricity<br /></span>
                <span className="rent-metric-value">{totalRentMoneyCredit} <small>Rs</small></span>
              </div>
              <div className="rent-metric-card">
                <span className="rent-metric-title">Total Rent Money Used<br /></span>
                <span className="rent-metric-value">{totalRentUsed} <small>Rs</small></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENT TRANSACTIONS SECTION */}
      <section className={`section-block ${showAllTransactions ? 'expanded-section-block' : ''}`}>
        <div className="section-header">
          <h3>Recent Transition</h3>
          <button className="text-link" onClick={() => setShowAllTransactions(!showAllTransactions)}>
            {showAllTransactions ? 'Back' : 'Show all'}
          </button>
        </div>

        {/* FILTERS */}
        <div className="filter-row hide-scrollbar">
          {['Credit', 'Electricity', 'Use'].map(cat => (
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

        {/* TRANSACTIONS LIST */}
        <div className={`transactions-stack ${showAllTransactions ? 'expanded-transactions-stack hide-scrollbar' : ''}`}>
          {displayedTransactions.length > 0 ? (
            displayedTransactions.map((tx, idx) => {
              const isIncome = tx.type === 'Credit' || tx.type === 'Electricity';
              return (
                <div className="rent-transaction-card" key={idx}>
                  <span className="rent-tx-date">{formatDateToDDMMYY(tx.date) || '-'}</span>
                  <span className="rent-tx-title">{tx.title}</span>
                  <span className={isIncome ? "rent-tx-amount-credit" : "rent-tx-amount-debit"}>
                    {tx.amount} Rs
                  </span>
                </div>
              );
            })
          ) : (
            <p className="empty-text">No rent transactions found.</p>
          )}
        </div>

        {!showAllTransactions && (
          <div className="footer-action-wrapper">
            <button className="text-link" onClick={() => setShowAllTransactions(true)}>
              Show All
            </button>
          </div>
        )}
      </section>

    </div>
  );
};

export default RentPage;