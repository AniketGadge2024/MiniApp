import React, { useEffect, useState } from 'react';

const Media = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchMediaDevices = async () => {
      try {
        // Ask for camera/mic permission first to get labels
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setDevices(devices);
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    fetchMediaDevices();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Poppins', backgroundColor: '#f5f7fa' }}>
      <h2 style={{ marginBottom: '20px' }}>Media Devices</h2>

      {devices.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {devices.map((device, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#fff',
                padding: '15px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                width: '300px',
                wordBreak: 'break-word',
              }}
            >
              <p><strong>Kind:</strong> {device.kind}</p>
              <p><strong>Label:</strong> {device.label || 'Permission required'}</p>
              <p><strong>Device ID:</strong> {device.deviceId}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No media devices found or permission denied.</p>
      )}
    </div>
  );
};

export default Media;
