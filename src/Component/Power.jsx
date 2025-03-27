import React, { useState, useEffect } from 'react';

const Power = () => {
  const [scores, setScores] = useState([]);
  const [ramUsage, setRamUsage] = useState(0);
  const [running, setRunning] = useState(false);
  const [average, setAverage] = useState(0);
  const [timer, setTimer] = useState(0);
  const [condition, setCondition] = useState('');

  useEffect(() => {
    let interval;
    if (running) {
      setTimer(5);
      interval = setInterval(() => {
        setTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running]);

  const startTest = async () => {
    setRunning(true);
    setScores([]);
    let newScores = [];

    for (let i = 0; i < 10; i++) {
      setTimer(5);
      let count = 0;
      const startTime = performance.now();
      const endTime = startTime + 5000; // Run for 5 seconds
      
      while (performance.now() < endTime) {
        count++;
      }
      
      newScores.push(count);
      setScores(prevScores => [...prevScores, count]);
      await new Promise(resolve => setTimeout(resolve, 100)); // Allow UI update
    }
    
    const avgScore = newScores.reduce((a, b) => a + b, 0) / newScores.length;
    setAverage(avgScore);

    if (navigator.deviceMemory) {
      setRamUsage(navigator.deviceMemory);
    }
    
    if (ramUsage) {
      if (avgScore > ramUsage * 1500000) {
        setCondition('Good Condition');
      } else if (avgScore > ramUsage * 1000000) {
        setCondition('Average Condition');
      } else {
        setCondition('Needs Attention');
      }
    } else {
      if (avgScore > 5000000) {
        setCondition('Good Condition');
      } else if (avgScore > 3000000) {
        setCondition('Average Condition');
      } else {
        setCondition('Needs Attention');
      }
    }
    
    setRunning(false);
  };

  return (
    <div>
      <h2>Device Performance Check</h2>
      <button onClick={startTest} disabled={running}>Start Test</button>
      <p>Time Remaining: {timer} sec</p>
      <ul>
        {scores.map((score, index) => (
          <li key={index}>Test {index + 1}: {score.toLocaleString()}</li>
        ))}
      </ul>
      <p>Average Score: {average.toLocaleString()}</p>
      <p>Approximate RAM: {ramUsage ? `${ramUsage} GB` : 'Not Available'}</p>
      <h3>Device Condition: {condition}</h3>
    </div>
  );
};

export default Power;