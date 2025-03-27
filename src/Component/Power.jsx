import React, { useState, useEffect } from 'react';

const Power = () => {
  const [scores, setScores] = useState([]);
  const [ramUsage, setRamUsage] = useState(0);
  const [cpuCores, setCpuCores] = useState(0);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [averageCpuScore, setAverageCpuScore] = useState(0);
  const [ramScore, setRamScore] = useState(0);
  const [gpuScore, setGpuScore] = useState(0);
  const [overallScore, setOverallScore] = useState(0);
  const [usageCategory, setUsageCategory] = useState('');
  const [gpuInfo, setGpuInfo] = useState('Unknown');

  useEffect(() => {
    detectGPU();
    detectCpuCores();
  }, []);

  // Detect number of CPU Cores
  const detectCpuCores = () => {
    const cores = navigator.hardwareConcurrency || 2; // Default to 2 if unknown
    setCpuCores(cores);
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

    // Detect if running on a mobile device
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      setGpuInfo(prev => prev + " (Mobile Device)");
    }
  };

  // Assign a score based on GPU type
  const assignGpuScore = (gpuName) => {
    if (!gpuName) return;

    let lowerGpuName = gpuName.toLowerCase();
    let score = 0;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (lowerGpuName.includes('rtx') || lowerGpuName.includes('apple m')) {
      score = 9500000; // High-end GPU
    } else if (lowerGpuName.includes('gtx') || lowerGpuName.includes('radeon pro')) {
      score = 7500000; // Mid-range GPU
    } else if (lowerGpuName.includes('intel iris') || lowerGpuName.includes('mali') || lowerGpuName.includes('adreno')) {
      score = isMobile ? 4000000 : 5000000; // Adjusting for mobile GPUs
    } else {
      score = isMobile ? 2500000 : 3500000; // Default for unknown GPUs
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

    for (let i = 0; i < 10; i++) {
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

    const avgCpuScore = newScores.reduce((a, b) => a + b, 0) / newScores.length;
    setAverageCpuScore(avgCpuScore);

    const deviceMemory = navigator.deviceMemory || 4;
    setRamUsage(deviceMemory);

    const calculatedRamScore = Math.round((avgCpuScore / deviceMemory) * 100);
    setRamScore(calculatedRamScore);

    const finalScore = Math.round((avgCpuScore * 0.3) + (gpuScore * 0.5) + (calculatedRamScore * 0.2));
    setOverallScore(finalScore);

    if (finalScore > 9000000 && deviceMemory >= 16) {
      setUsageCategory('Ultimate Performance: Best for High-End Gaming, Streaming & Professional Work');
    } else if (finalScore > 8000000 && deviceMemory >= 12) {
      setUsageCategory('Best for Gaming & Heavy Multitasking');
    } else if (finalScore > 7000000 && deviceMemory >= 8) {
      setUsageCategory('Excellent for Gaming, Video Editing & Development');
    } else if (finalScore > 6000000 && deviceMemory >= 6) {
      setUsageCategory('Great for Gaming & Office Work');
    } else if (finalScore > 5000000 && deviceMemory >= 4) {
      setUsageCategory('Good for Multitasking & Productivity');
    } else if (finalScore > 4000000) {
      setUsageCategory('Best for Content Watching, Browsing & Casual Use');
    } else {
      setUsageCategory('Basic Performance: Suitable for Web Browsing & Light Tasks');
    }

    setRunning(false);
  };

  return (
    <div>
      <h2>Device Performance Check</h2>

      {loading ? (
        <div>Loading...</div>
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

      <p><strong>CPU Score:</strong> {averageCpuScore.toLocaleString()}</p>
      <p><strong>CPU Cores:</strong> {cpuCores} Cores</p>
      <p><strong>Approximate RAM:</strong> {ramUsage ? `${ramUsage} GB` : 'Not Available'}</p>
      <p><strong>RAM Score:</strong> {ramScore.toLocaleString()}</p>
      <p><strong>GPU:</strong> {gpuInfo}</p>
      <p><strong>GPU Score:</strong> {gpuScore.toLocaleString()}</p>
      <p><strong>Overall Score:</strong> {overallScore.toLocaleString()}</p>

      <h3><strong>Best Usage:</strong> {usageCategory}</h3>
    </div>
  );
};

export default Power;
