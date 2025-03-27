import React, { useState, useEffect } from 'react';

const Exercise = () => {
  const [location, setLocation] = useState(null);
  const [distance, setDistance] = useState(0);
  const [prevLocation, setPrevLocation] = useState(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };

          setLocation(newLocation);

          if (prevLocation) {
            const newDistance = getDistance(prevLocation, newLocation);
            setDistance((prev) => prev + newDistance);
          }

          setPrevLocation(newLocation);
        },
        (error) => console.error("Error fetching location:", error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [prevLocation]);

  // Haversine formula to calculate distance between two coordinates
  const getDistance = (loc1, loc2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);
    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const toRad = (value) => (value * Math.PI) / 180;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Live Location Tracking</h2>
      {location ? (
        <div>
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>
          <p><strong>Distance Traveled:</strong> {distance.toFixed(2)} km</p>
        </div>
      ) : (
        <p>Fetching location...</p>
      )}
    </div>
  );
};

export default Exercise;
