import React, { useState } from "react";

function ElectricityEstimator({ roofArea, avgRainfall }) {
  const [height, setHeight] = useState(3);
  const [efficiency, setEfficiency] = useState(0.7);
  const [results, setResults] = useState(null);

  const handleEstimate = () => {
    if (!roofArea || !avgRainfall) {
      alert("Roof area or rainfall data is missing!");
      return;
    }

    const rainfallRate_m_per_s = (avgRainfall / 1000) / 3600;
    const flowRate = roofArea * rainfallRate_m_per_s;
    const rho = 1000;
    const g = 9.81;
    const powerWatts = rho * g * height * flowRate * efficiency;
    const durationSeconds = 3600;
    const energyWh = (powerWatts * durationSeconds) / 3600;

    setResults({
      flowRate: flowRate.toFixed(5),
      powerWatts: powerWatts.toFixed(2),
      energyWh: energyWh.toFixed(2),
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "linear-gradient(135deg, #8dc7f0ff, #e4cdf8ff)", // soft pastel gradient
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "30px", color: "#333" }}>
        ⚡ Electricity Generation Estimator
      </h1>

      <div
        style={{
          background: "rgba(255,255,255,0.9)",
          padding: "40px",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "800px",
          boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p style={{ fontSize: "1.2rem", marginBottom: "15px" }}>🏠 Roof Area: <b>{roofArea} m²</b></p>
        <p style={{ fontSize: "1.2rem", marginBottom: "25px" }}>🌧 Rainfall: <b>{avgRainfall} mm/hour</b></p>

        <div style={{ display: "flex", gap: "20px", marginBottom: "25px", flexWrap: "wrap", justifyContent: "center" }}>
          <label style={{ display: "flex", flexDirection: "column", fontSize: "1rem", alignItems: "center", color:"#555" }}>
            Pipe Height (m):
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", fontSize: "1rem", alignItems: "center", color:"#555" }}>
            Turbine Efficiency (0–1):
            <input
              type="number"
              step="0.05"
              value={efficiency}
              onChange={(e) => setEfficiency(Number(e.target.value))}
              style={inputStyle}
            />
          </label>
        </div>

        <button onClick={handleEstimate} style={buttonStyle}>
          Calculate Electricity
        </button>

        {results && (
          <div
            style={{
              marginTop: "30px",
              background: "#f0f8ff",
              padding: "30px",
              borderRadius: "15px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
              color:"#333"
            }}
          >
            <p>💧 Flow Rate: <b>{results.flowRate} m³/s</b></p>
            <p>⚡ Power Generated: <b>{results.powerWatts} W</b></p>
            <p>🔋 Energy Potential (1 hr rain): <b>{results.energyWh} Wh</b></p>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  width: "120px",
  textAlign: "center",
  fontSize: "1rem",
};

const buttonStyle = {
  marginTop: "15px",
  padding: "15px 30px",
  borderRadius: "12px",
  border: "none",
  cursor: "pointer",
  fontSize: "1.2rem",
  fontWeight: "bold",
  color: "#fff",
  background: "linear-gradient(45deg, #36d1dc, #5b86e5)", // soft teal to soft blue
  boxShadow: "0px 6px 15px rgba(0,0,0,0.2)",
  transition: "0.3s ease",
};

export default ElectricityEstimator;
