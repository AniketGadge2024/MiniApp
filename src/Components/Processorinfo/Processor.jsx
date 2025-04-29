import React, { useEffect, useState } from 'react';

const Processor = () => {
  const [systemInfo, setSystemInfo] = useState({
    cpuCores: '',
    deviceMemory: '',
    graphicsInfo: '',
  });

  useEffect(() => {
    // Fetch device memory (RAM)
    const deviceMemory = navigator.deviceMemory || 'Not Available';

    // Fetch the number of logical CPU cores
    const cpuCores = navigator.hardwareConcurrency || 'Not Available';

    // Basic Graphics info via WebGL (check if the browser supports WebGL)
    const getGraphicsInfo = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (!gl) {
        return 'WebGL not supported';
      }
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return renderer || 'Graphics info not available';
      }
      return 'Graphics info not available';
    };

    const graphicsInfo = getGraphicsInfo();

    setSystemInfo({
      cpuCores: cpuCores,
      deviceMemory: deviceMemory,
      graphicsInfo: graphicsInfo,
    });
  }, []);

  return (
    <div className="card">
      <h2>System Information</h2>
      <ul>
        <li><strong>CPU Cores:</strong> {systemInfo.cpuCores}</li>
        <li><strong>Device Memory (RAM):</strong> {systemInfo.deviceMemory} GB</li>
        <li><strong>Graphics Info:</strong> {systemInfo.graphicsInfo}</li>
      </ul>
    </div>
  );
};

export default Processor;
