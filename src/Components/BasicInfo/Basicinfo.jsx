import React, { useEffect, useState } from 'react';
import './Basic.css'; // Import your CSS file

const Basicinfo = () => {
  const [info, setInfo] = useState({
    screenResolution: '',
    nativeResolution: '',
    viewportSize: '',
    devicePixelRatio: '',
    estimatedDPI: '',
    displayType: '',
    colorDepth: '',
    inferredColorDepth: '',
    refreshRate: '',
    displayTechnology: '', // Added to store display type (LCD/AMOLED)
  });

  useEffect(() => {
    // Estimate DPI using 1-inch div
    const dpiElement = document.createElement('div');
    dpiElement.style.width = '1in';
    dpiElement.style.visibility = 'hidden';
    document.body.appendChild(dpiElement);
    const estimatedDPI = dpiElement.offsetWidth;
    document.body.removeChild(dpiElement);

    // WebGL color depth inference
    const getColorDepth = () => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        return 'Unable to get WebGL context';
      }
      const maxColorAttachments = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      if (maxColorAttachments > 4 && maxTextureSize > 4096) {
        return 'Possible 10-bit or higher support';
      }
      return 'Likely 8-bit';
    };

    // Function to calculate screen refresh rate (capped at 144Hz or display rate)
    const getRefreshRate = () => {
      let lastFrameTime = performance.now();
      let frameCount = 0;
      const refreshRateLimit = 144; // Assume the display is 144Hz; adjust as needed

      const calculateRate = () => {
        const now = performance.now();
        frameCount++;

        // Calculate frame rate over a second
        if (now - lastFrameTime >= 1000) {
          const rate = frameCount;
          setInfo(prevInfo => ({
            ...prevInfo,
            refreshRate: `${Math.min(rate, refreshRateLimit)} Hz`, // Cap at 144Hz (or your display's true refresh rate)
          }));
          frameCount = 0;
          lastFrameTime = now;
        }

        requestAnimationFrame(calculateRate);
      };

      requestAnimationFrame(calculateRate);
    };

    // Detecting if the display is AMOLED based on color-gamut support in CSS
    const detectDisplayTechnology = () => {
      const isAmoled = window.matchMedia('(color-gamut: p3)').matches;
      const displayTechnology = isAmoled ? 'AMOLED' : 'LCD';
      setInfo(prevInfo => ({
        ...prevInfo,
        displayTechnology: displayTechnology, // Set display type (LCD/AMOLED)
      }));
    };

    const updateInfo = () => {
      const devicePixelRatio = window.devicePixelRatio;
      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;

      // Calculate native resolution (physical resolution)
      const nativeWidth = Math.round(screenWidth * devicePixelRatio);
      const nativeHeight = Math.round(screenHeight * devicePixelRatio);

      // Determine display type based on native resolution
      let displayType = '';
      if (nativeWidth >= 3840) {
        displayType = 'UHD (4K)';
      } else if (nativeWidth >= 2560) {
        displayType = '2K (1440p)';
      } else if (nativeWidth >= 1920) {
        displayType = 'FHD (Full HD)';
      } else if (nativeWidth >= 1440) {
        displayType = '1.5K (1080p)';
      } else if (nativeWidth >= 1280) {
        displayType = 'HD (720p)';
      } else {
        displayType = 'SD (Standard Definition)';
      }

      // Get screen color depth (bits per color)
      const colorDepth = window.screen.colorDepth;

      setInfo({
        screenResolution: `${screenWidth} x ${screenHeight}`,
        nativeResolution: `${nativeWidth} x ${nativeHeight}`,
        viewportSize: `${window.innerWidth} x ${window.innerHeight}`,
        devicePixelRatio: devicePixelRatio.toFixed(2),
        estimatedDPI: estimatedDPI,
        displayType: displayType,
        colorDepth: `${colorDepth} bits`, // Typically 24 or 32 bits
        inferredColorDepth: getColorDepth(), // Inferred based on WebGL capabilities
      });

      getRefreshRate(); // Start calculating the refresh rate
      detectDisplayTechnology(); // Detect AMOLED or LCD display
    };

    updateInfo();
    window.addEventListener('resize', updateInfo);
    return () => window.removeEventListener('resize', updateInfo);
  }, []);

  return (
    <div className="card">
      <h2>Device Display Info</h2>
      <ul>
        <li><strong>Screen Resolution (CSS):</strong> {info.screenResolution}</li>
        <li><strong>Native Resolution (Physical):</strong> {info.nativeResolution}</li>
        <li><strong>Viewport Size:</strong> {info.viewportSize}</li>
        <li><strong>Device Pixel Ratio:</strong> {info.devicePixelRatio}</li>
        <li><strong>Estimated DPI:</strong> {info.estimatedDPI} pixels/inch</li>
        <li><strong>Display Type:</strong> {info.displayType}</li>
        <li><strong>Color Depth:</strong> {info.colorDepth}</li>
        <li><strong>Inferred Color Depth:</strong> {info.inferredColorDepth}</li>
        <li><strong>Refresh Rate:</strong> {info.refreshRate}</li>
        <li><strong>Display Technology:</strong> {info.displayTechnology}</li>
      </ul>
    </div>
  );
};

export default Basicinfo;
