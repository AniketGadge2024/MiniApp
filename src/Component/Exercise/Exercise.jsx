import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const Exercise = () => {
  const [position, setPosition] = useState(null);
  const [distance, setDistance] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activity, setActivity] = useState("Idle 🛑");
  const [timeToCover1km, setTimeToCover1km] = useState("N/A");
  const [activityHistory, setActivityHistory] = useState([]);
  const [prevActivity, setPrevActivity] = useState("Idle 🛑");
  const [startTime, setStartTime] = useState(null);
  const [prevPosition, setPrevPosition] = useState(null);
  const [prevTime, setPrevTime] = useState(null);
  const [weight, setWeight] = useState(70);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    if (!isTracking) return;

    if ("geolocation" in navigator) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const currentTime = new Date().getTime();

          setPosition({ latitude, longitude });

          if (prevPosition && prevTime) {
            const newDistance = calculateDistance(
              prevPosition.latitude,
              prevPosition.longitude,
              latitude,
              longitude
            );

            const timeElapsed = (currentTime - prevTime) / 1000;
            let calculatedSpeedKmh = 0;

            if (newDistance > 0 && timeElapsed > 0) {
              calculatedSpeedKmh = (newDistance / timeElapsed) * 3.6;

              setSpeedKmh(calculatedSpeedKmh);
              setDistance((prev) => prev + newDistance);
              setTimeToCover1km(calculateTimeToCover1km(calculatedSpeedKmh));

              const newActivity = getActivity(calculatedSpeedKmh);
              if (newActivity !== prevActivity) {
                logActivityChange(prevActivity, startTime, currentTime);
                setPrevActivity(newActivity);
                setStartTime(currentTime);
                setActivity(newActivity);
              }

              const caloriesBurned = calculateCalories(calculatedSpeedKmh, timeElapsed, weight);
              setCalories((prev) => prev + caloriesBurned);

              setGraphData((prev) => [
                ...prev,
                { time: currentTime, speed: calculatedSpeedKmh }
              ]);
            }
          }

          setPrevPosition({ latitude, longitude });
          setPrevTime(currentTime);
        },
        (error) => console.error(error),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      setWatchId(id);
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, prevPosition, prevTime, prevActivity, weight]);

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const toRad = (angle) => (angle * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calculateCalories(speedKmh, time, weight) {
    let met = speedKmh > 1.8 ? (speedKmh <= 7.2 ? 3.5 : speedKmh <= 14.4 ? 6 : speedKmh <= 20 ? 8 : speedKmh <= 40 ? 10 : 1.5) : 1.2;
    return met * weight * (time / 3600);
  }

  function getActivity(speedKmh) {
    return speedKmh <= 1.8 ? "Idle 🛑" : 
           speedKmh <= 7.2 ? "Walking 🚶‍♂️" : 
           speedKmh <= 14.4 ? "Jogging 🏃‍♂️" : 
           speedKmh <= 20 ? "Running 🏃💨" : 
           speedKmh <= 40 ? "Cycling 🚴" : "Driving 🚗";
  }

  function calculateTimeToCover1km(speedKmh) {
    return speedKmh <= 1.8 ? "N/A" : `${(60 / speedKmh).toFixed(2)} minutes`;
  }

  function logActivityChange(activity, start, end) {
    if (!start) return;
    setActivityHistory((prev) => [
      ...prev,
      {
        activity,
        startTime: new Date(start).toLocaleTimeString(),
        endTime: new Date(end).toLocaleTimeString(),
        duration: ((end - start) / 1000).toFixed(2),
      },
    ]);
  }

  return (
    <div>
      <h2>Exercise Tracker</h2>
      <label>
        Weight (kg):
        <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
      </label>
      <button onClick={() => setIsTracking(true)} disabled={isTracking}>Start</button>
      <button onClick={() => setIsTracking(false)} disabled={!isTracking}>Stop</button>
      <p>Distance: {distance.toFixed(2)} meters | Speed: {speedKmh.toFixed(2)} km/h | Calories: {calories.toFixed(2)} kcal</p>
      <p>Activity: {activity} | Time to cover 1 km: {timeToCover1km}</p>
      
      <Line
        data={{
          labels: graphData.length > 0 ? graphData.map((d) => new Date(d.time).toLocaleTimeString()) : ["No Data"],
          datasets: [
            {
              label: "Speed (km/h)",
              data: graphData.length > 0 ? graphData.map((d) => d.speed) : [0],
              borderColor: "blue",
              fill: false,
            },
          ],
        }}
      />

      <h3>Activity History</h3>
      <ul>
        {activityHistory.map((entry, index) => (
          <li key={index}>
            <strong>{entry.activity}</strong> ({entry.duration} sec) from {entry.startTime} to {entry.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Exercise;
