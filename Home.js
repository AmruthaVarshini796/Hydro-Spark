import React from "react";
import { useNavigate } from "react-router-dom";

import "./Home.css"; 

function Home() {
  const navigate = useNavigate();

  return (
    <div className="main-container">
      {/* Heading */}
      <h1 className="main-heading"> ⚡ Hydro-Spark ⚡</h1>

      {/* Cards container */}
      <div className="cards-container">
        {/* Rainwater Estimator Card */}
        <div
          onClick={() => navigate("/rain-estimator")}
          className="card"
        >
          <h2 className="card-title">Rainwater Harvest Estimator</h2>
          <p className="card-description">
            Calculate roof area, rainfall, and recommended tank & recharge pit sizes.
          </p>
        </div>

        {/* Electricity Generated Card */}
        <div
          onClick={() => navigate("/electricity")}
          className="card"
        >
          <h2 className="card-title">Electricity Generation Estimator</h2>
          <p className="card-description">
            Estimate electricity from the turbines.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;