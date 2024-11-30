import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
import L from 'leaflet';
import { FaRoad, FaCheckCircle } from 'react-icons/fa';

// Utility to create dynamic icon sizes based on feature count
const createDynamicIcon = (damage, featureCount) => {
  const iconColors = {
    'very poor': '#FF0000',
    'poor': '#FFA500',
    'satisfactory': '#FFD700',
    'good': '#00FF00',
  };

  const baseSize = Math.max(5, 20 - Math.log10(featureCount) * 5); // Adjust size dynamically
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      width: ${baseSize}px; 
      height: ${baseSize}px; 
      border-radius: 50%; 
      background-color: ${iconColors[damage] || '#808080'}; 
      border: 1px solid white;
    "></div>`,
    iconSize: [baseSize, baseSize],
    iconAnchor: [baseSize / 2, baseSize / 2],
  });
};

// Utility function to extract coordinates
const extractCoordinates = (geojson) => {
  try {
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      return [35.6895, 139.6917]; // Default Tokyo coordinates
    }

    const firstFeature = geojson.features[0];
    if (firstFeature.geometry.type === 'Point') {
      return [
        firstFeature.geometry.coordinates[1],
        firstFeature.geometry.coordinates[0],
      ];
    }
    return [35.6895, 139.6917]; // Default
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return [35.6895, 139.6917]; // Default
  }
};

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [mapCenter, setMapCenter] = useState([35.6895, 139.6917]);
  const [mapZoom, setMapZoom] = useState(12);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('damage_type', 'Road'); // Hardcoded damage type

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/analyze-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.data || !response.data.geojson) {
        throw new Error('Invalid response from server');
      }

      setResponseData(response.data);
      const newCenter = extractCoordinates(response.data.geojson);
      setMapCenter(newCenter);
      setMapZoom(14);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.response?.data?.detail || 'Failed to analyze the video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const summaryChartData = useMemo(() => {
    if (!responseData) return null;
    return {
      labels: ['Very Poor', 'Poor', 'Satisfactory', 'Good'],
      datasets: [
        {
          label: 'Damage Severity (%)',
          data: [
            responseData.summary['very poor'] || 0,
            responseData.summary['poor'] || 0,
            responseData.summary['satisfactory'] || 0,
            responseData.summary['good'] || 0,
          ],
          backgroundColor: ['#FF0000', '#FFA500', '#FFD700', '#00FF00'],
        },
      ],
    };
  }, [responseData]);

  const renderMap = useCallback(() => {
    if (!responseData || !responseData.geojson) return null;

    const features = responseData.geojson.features;
    const featureCount = features.length;

    return (
      <div className="map-container">
        <h3><FaRoad /> Damage Locations</h3>
        <MapContainer
          key={`${mapCenter[0]}-${mapCenter[1]}`}
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {features.map((feature, index) => {
            const coordinates = feature.geometry.coordinates;
            return (
              <Marker
                key={index}
                position={[coordinates[1], coordinates[0]]}
                icon={createDynamicIcon(feature.properties.damage, featureCount)}
              >
                <Popup>
                  <div>
                    <strong>Damage Level:</strong> {feature.properties.damage}
                    <br />
                    <strong>Area:</strong> {feature.properties.area || 'N/A'} sq m
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    );
  }, [responseData, mapCenter, mapZoom]);

  return (
    <div className="upload-form-container">
      <div className="upload-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Dashcam Video</label>
            <input type="file" onChange={handleFileChange} accept="video/*" className="file-input" />
          </div>
          <button type="submit" disabled={loading} className="analyze-button">
            {loading ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </form>
        {error && <div className="error-message"><p>{error}</p></div>}
        {responseData && (
          <div className="results-container">
            <div className="chart-container">
              <h3><FaCheckCircle /> Damage Severity Overview</h3>
              <Bar
                data={summaryChartData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: true, position: 'top' } },
                  scales: { y: { beginAtZero: true, max: 100 } },
                }}
              />
            </div>
            {renderMap()}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadForm;