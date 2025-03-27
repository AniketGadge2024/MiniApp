import React, { useState } from "react";
import "./Power.css";

const Power = () => {
  const [scores, setScores] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [performanceMessage, setPerformanceMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [timer, setTimer] = useState(0);

  const runTest = async () => {
    setScores([]);
    setAverageScore(null);
    setPerformanceMessage("");
    setIsTesting(true);
    setTimer(50);

    let totalOperations = 0;
    let results = [];

    for (let i = 1; i <= 10; i++) {
      setTimer((prev) => prev - 5);

      await new Promise((resolve) => setTimeout(resolve, 50)); // Prevent UI freeze

      const startTime = performance.now();
      let operations = 0;

      while (performance.now() - startTime < 5000) {
        Math.sqrt(Math.random() * Math.random());
        operations++;
      }

      results.push(operations);
      totalOperations += operations;
      setScores([...results]); // Update the score list

      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
    }

    const average = Math.floor(totalOperations / 10);
    setAverageScore(average.toLocaleString());

    // Adjusted mobile thresholds
    let message = "";
    if (average < 5_000_000) {
      message = "🔴 Slow Device: Performance is low, may need optimization.";
    } else if (average >= 5_000_000 && average < 15_000_000) {
      message = "🟡 Average Device: Performance is decent but not top-tier.";
    } else {
      message = "🟢 Fast Device: Great performance!";
    }

    setPerformanceMessage(message);
    setIsTesting(false);
  };

  return (
    <div className="power-container">
      <h2>📱 Mobile CPU Test</h2>
      {isTesting && <p>⏳ Time Remaining: {timer}s</p>}
      <button onClick={runTest} disabled={isTesting}>
        {isTesting ? "Testing..." : "Start Test"}
      </button>

      {scores.length > 0 && (
        <div className="score-list">
          <h3>📊 Test Results:</h3>
          <ul>
            {scores.map((score, index) => (
              <li key={index}>Test {index + 1}: <strong>{score.toLocaleString()}</strong></li>
            ))}
          </ul>
        </div>
      )}

      {averageScore !== null && (
        <p><strong>🔥 Avg CPU Score: {averageScore}</strong></p>
      )}

      {performanceMessage && (
        <p className="performance-message">{performanceMessage}</p>
      )}
    </div>
  );
};

export default Power;
