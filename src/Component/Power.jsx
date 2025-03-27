import React, { useState, useEffect } from 'react';

const Power = () => {
  const [cpuName, setCpuName] = useState('Unknown');
  const [scores, setScores] = useState([]);
  const [ramUsage, setRamUsage] = useState(0);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [averageCpuScore, setAverageCpuScore] = useState(0);
  const [ramScore, setRamScore] = useState(0);
  const [gpuScore, setGpuScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [usageCategory, setUsageCategory] = useState('');
  const [gpuInfo, setGpuInfo] = useState('Unknown');

  useEffect(() => {
    detectCPU();
    detectGPU();
  }, []);

  // Function to detect CPU name
  const detectCPU = () => {
    let cpu = "Unknown";

    if (navigator.userAgentData) {
      cpu = navigator.userAgentData.brands.map(b => b.brand).join(", ");
    } else {
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.includes("intel")) {
        cpu = "Intel Processor";
      } else if (userAgent.includes("amd")) {
        cpu = "AMD Processor";
      } else if (userAgent.includes("apple m")) {
        cpu = "Apple Silicon (M1/M2)";
      } else if (userAgent.includes("snapdragon")) {
        cpu = "Snapdragon Processor";
      } else if (userAgent.includes("mediatek")) {
        cpu = "MediaTek Processor";
      } else if (userAgent.includes("exynos")) {
        cpu = "Samsung Exynos Processor";
      } else {
        cpu = "Unknown Processor";
      }
    }

    setCpuName(cpu);
  };

  // Function to detect GPU using WebGL
  const detectGPU = () => {
    let canvas = document.createElement('canvas');
    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        setGpuInfo(renderer);
        assignGpuScore(renderer);
      }
    }
  };

  // Assign a score based on GPU type
  const assignGpuScore = (gpuName) => {
    if (!gpuName) return;

    let lowerGpuName = gpuName.toLowerCase();
    let score = 0;

    if (lowerGpuName.includes('rtx') || lowerGpuName.includes('apple m')) {
      score = 9000000;
    } else if (lowerGpuName.includes('gtx') || lowerGpuName.includes('radeon pro')) {
      score = 7000000;
    } else if (lowerGpuName.includes('intel iris') || lowerGpuName.includes('mali') || lowerGpuName.includes('adreno')) {
      score = 5000000;
    } else {
      score = 3000000;
    }

    setGpuScore(score);
  };

  const startTest = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);

    setRunning(true);
    setScores([]);
    let newScores = [];

    // Run CPU Performance Test
    for (let i = 0; i < 1; i++) {
      let count = 0;
      const startTime = performance.now();
      const endTime = startTime + 5000;

      while (performance.now() < endTime) {
        count++;
      }

      newScores.push(count);
      setScores(prevScores => [...prevScores, count]);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Calculate Average CPU Score
    const avgCpuScore = newScores.reduce((a, b) => a + b, 0) / newScores.length;
    setAverageCpuScore(avgCpuScore);

    // Fetch RAM Size
    const deviceMemory = navigator.deviceMemory || 4;
    setRamUsage(deviceMemory);

    // Calculate RAM Score
    const calculatedRamScore = Math.round((avgCpuScore / deviceMemory) * 100);
    setRamScore(calculatedRamScore);

    // Factor CPU Type into Score
    let cpuMultiplier = 1;
    if (cpuName.includes('Intel')) cpuMultiplier = 1.2;
    else if (cpuName.includes('AMD')) cpuMultiplier = 1.1;
    else if (cpuName.includes('Apple M')) cpuMultiplier = 1.3;
    else if (cpuName.includes('Snapdragon')) cpuMultiplier = 0.9;
    else if (cpuName.includes('MediaTek') || cpuName.includes('Exynos')) cpuMultiplier = 0.8;

    // Compute Overall Performance Score (50% CPU + 30% GPU + 20% RAM)
    const finalScore = Math.round(((avgCpuScore * cpuMultiplier) * 0.5) + (gpuScore * 0.3) + (calculatedRamScore * 0.2));
    setOverallScore(finalScore);

    // Determine Usage Category
    if (finalScore > 8000000 && deviceMemory >= 8) {
      setUsageCategory('Best for Gaming & Multitasking');
    } else if (finalScore > 6000000 && deviceMemory >= 6) {
      setUsageCategory('Great for Gaming');
    } else if (finalScore > 4500000 && deviceMemory >= 4) {
      setUsageCategory('Good for Multitasking');
    } else if (finalScore > 3000000) {
      setUsageCategory('Best for Content Watching & Basic Usage');
    } else {
      setUsageCategory('Only Suitable for Basic Usage');
    }

    setRunning(false);
  };

  return (
    <div>
      <h2>Device Performance Check</h2>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <button onClick={startTest} disabled={running}>
          {running ? 'Test is Running...' : 'Start Test'}
        </button>
      )}

      <ul>
        {scores.map((score, index) => (
          <li key={index}>Test {index + 1}: {score.toLocaleString()}</li>
        ))}
      </ul>

      <p><strong>CPU:</strong> {cpuName}</p>
      <p><strong>CPU Score:</strong> {averageCpuScore.toLocaleString()}</p>
      <p><strong>Approximate RAM:</strong> {ramUsage ? `${ramUsage} GB` : 'Not Available'}</p>
      <p><strong>RAM Score:</strong> {ramScore.toLocaleString()}</p>
      <p><strong>GPU:</strong> {gpuInfo}</p>
      <p><strong>GPU Score:</strong> {gpuScore.toLocaleString()}</p>
      <p><strong>Overall Score:</strong> {overallScore.toLocaleString()}</p>
      <h3>Best Usage: {usageCategory}</h3>
    </div>
  );
};

export default Power;
