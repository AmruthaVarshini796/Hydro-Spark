import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  useMap
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { EditControl } from "react-leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import * as turf from "@turf/turf";
import "./RainEstimator.css";


// 🔍 Search bar with Nominatim (supports door numbers & rural areas)
function SearchBar() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: {
        addressdetails: 1,
        countrycodes: "IN", // restrict to India, remove for global
        format: "json"
      }
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      autoClose: true,
      showMarker: true,
      showPopup: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true
    });

    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
}

function RainEstimator() {
  const featureGroupRef = useRef(null);
  const [roofArea, setRoofArea] = useState(null);
  const [coords, setCoords] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // When rooftop is drawn
  const handleCreated = (e) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    const areaSqM = turf.area(geojson);

    // Get centroid of polygon for rainfall API
    const centroid = turf.center(geojson).geometry.coordinates;
    setCoords({ lat: centroid[1], lon: centroid[0] });

    setRoofArea(areaSqM.toFixed(2));
    setResults(null); // reset old results
  };

  // Fetch rainfall + calculate
  const handleResults = async () => {
    if (!roofArea || !coords) {
      alert("Please draw your rooftop first!");
      return;
    }

    setLoading(true);
    let avgRainfall = null;

    try {
      const response = await fetch(
        `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=PRECTOTCORR&community=RE&longitude=${coords.lon}&latitude=${coords.lat}&format=JSON`
      );
      const data = await response.json();
      console.log("Rainfall API response:", data);

      if (data?.properties?.parameter?.PRECTOTCORR) {
        const monthly = data.properties.parameter.PRECTOTCORR; // mm/day
        const daysInMonth = {
          JAN: 31, FEB: 28, MAR: 31, APR: 30,
          MAY: 31, JUN: 30, JUL: 31, AUG: 31,
          SEP: 30, OCT: 31, NOV: 30, DEC: 31
        };

        let totalYear = 0;
        for (const month in daysInMonth) {
          if (monthly[month] !== undefined) {
            totalYear += Number(monthly[month]) * daysInMonth[month];
          }
        }
        avgRainfall = totalYear.toFixed(0);
      }
    } catch (err) {
      console.error("Rainfall API error:", err);
    }

    // If API failed, fallback
    if (!avgRainfall || isNaN(avgRainfall)) avgRainfall = 1000;

    // Rainwater volume
    const liters = (roofArea * avgRainfall) / 1000; // L/year
    const tankSize = (liters * 0.5).toFixed(0);

    // Recharge pit dimensions
    const rechargeLiters = (liters * 0.3).toFixed(0);
    const volume = rechargeLiters / 1000; // m³
    const depth = 2; // fixed depth
    const area = volume / depth;
    const side = Math.sqrt(area).toFixed(2);

    setResults({
      roofArea,
      avgRainfall,
      liters: liters.toFixed(0),
      tankSize,
      rechargeLiters,
      pitDims: `${side} m × ${side} m × ${depth} m`
    });

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#2c5364",
        padding: "20px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
        💧 Rainwater Harvest Estimator
      </h2>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "12px",
          boxShadow: "0 6px 12px rgba(0,0,0,0.5)"
        }}
      >
        {/* Satellite imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri"
        />
        {/* Labels overlay */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels © Esri"
          pane="overlayPane"
        />

        <SearchBar />

        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            draw={{
              rectangle: true,
              polygon: true,
              circle: false,
              marker: false,
              polyline: false,
              circlemarker: false
            }}
            edit={{ remove: true }}
            onCreated={handleCreated}
          />
        </FeatureGroup>
      </MapContainer>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleResults}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #1e3c72, #2a5298)",
            color: "white",
            padding: "15px 30px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            boxShadow: "0px 6px 12px rgba(0,0,0,0.3)"
          }}
        >
          {loading ? "⏳ Fetching Rainfall..." : "📊 Show Results"}
        </button>
      </div>

      {results && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "rgba(0,0,0,0.6)",
            borderRadius: "12px",
            width: "40%",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 6px 12px rgba(0,0,0,0.4)",
            textAlign: "center"
          }}
        >
          <h3 style={{ marginBottom: "10px", color: "#4FC3F7" }}>Results</h3>
          <p>🏠 Roof Area: <b>{results.roofArea} m²</b></p>
          <p>🌧 Average Rainfall: <b>{results.avgRainfall} mm/year</b></p>
          <p>💧 Estimated Water: <b>{results.liters} L/year</b></p>
          <p>🛢 Recommended Tank Size: <b>{results.tankSize} L</b></p>
          <p>⚡ Recharge Pit Dimensions: <b>{results.pitDims}</b></p>
        </div>
      )}
    </div>
  );
}

export default RainEstimator;
