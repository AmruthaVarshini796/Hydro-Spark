import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import RainEstimator from "./RainEstimator";
import ElectricityEstimator from "./ElectricityEstimator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
          path="/electricity"
          element={
            <ElectricityEstimator
              roofArea={50}        // Example default, can replace with state from RainEstimator
              avgRainfall={50}     // Example default mm/hour
            />
          }
        />
      <Route path="/rain-estimator" element={<RainEstimator />} />
    </Routes>
  );
}

export default App;
