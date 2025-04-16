import React from 'react';

const Crash = () => {
  const openTabs = () => {
    const url = 'https://www.google.com/';

    // Loop to open 5 tabs with a delay
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        window.open(url, '_blank');
      }, i * 100);  // Adds a delay of 500ms between opening each tab
    }
  };

  return (
    <div>
      <button onClick={openTabs}>Did you want to start</button>
    </div>
  );
};

export default Crash;
