import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { Bar } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Icon } from 'leaflet';
import { FaRoad, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

// Reset Leaflet's default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Utility function to safely extract coordinates
const extractCoordinates = (geojson) => {
  try {
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      return [35.6895, 139.6917]; // Default Tokyo coordinates
    }

    const firstFeature = geojson.features[0];
    
    // Handle different geometry types
    if (firstFeature.geometry.type === 'Point') {
      return [
        firstFeature.geometry.coordinates[1], 
        firstFeature.geometry.coordinates[0]
      ];
    } else if (firstFeature.geometry.type === 'Polygon') {
      const coords = firstFeature.geometry.coordinates[0][0];
      return [coords[1], coords[0]];
    }
    
    return [35.6895, 139.6917]; // Fallback to default
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    return [35.6895, 139.6917]; // Fallback to default
  }
};

// Custom Icon for Markers
const getDamageIcon = (damage) => {
  const iconColors = {
    'very poor': '#FF0000',
    'poor': '#FFA500',
    'satisfactory': '#FFD700',
    'good': '#00FF00'
  };

  return new L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      width: 20px; 
      height: 20px; 
      border-radius: 50%; 
      background-color: ${iconColors[damage] || '#808080'}; 
      border: 2px solid white; 
      box-shadow: 0 0 5px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [damageType, setDamageType] = useState('Road');
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [mapCenter, setMapCenter] = useState([35.6895, 139.6917]);
  const [mapZoom, setMapZoom] = useState(12);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleDamageTypeChange = (e) => setDamageType(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('damage_type', damageType);

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:8000/analyze-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Validate response data
      if (!response.data || !response.data.geojson) {
        throw new Error('Invalid response from server');
      }

      setResponseData(response.data);
      
      // Safely extract and set map center
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
      datasets: [{
        label: 'Damage Severity (%)',
        data: [
          responseData.summary['very poor'] || 0,
          responseData.summary['poor'] || 0,
          responseData.summary['satisfactory'] || 0,
          responseData.summary['good'] || 0,
        ],
        backgroundColor: ['#FF6384', '#FF9F40', '#FFCD56', '#36A2EB'],
      }],
    };
  }, [responseData]);

  const renderMap = useCallback(() => {
    if (!responseData || !responseData.geojson) return null;

    const styleFeature = (feature) => {
      const damage = feature.properties.damage;
      const colorMap = {
        'very poor': 'red',
        'poor': 'orange',
        'satisfactory': 'yellow',
        'good': 'green'
      };

      return { 
        color: colorMap[damage] || 'gray', 
        weight: 3, 
        fillColor: colorMap[damage] || 'gray', 
        fillOpacity: 0.5 
      };
    };

    return (
      <div className="map-container">
        <h3><FaRoad /> Damage Locations</h3>
        <MapContainer 
          key={`${mapCenter[0]}-${mapCenter[1]}`} // Force re-render on center change
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <GeoJSON 
            data={responseData.geojson} 
            style={styleFeature}
          />
          {responseData.geojson.features.map((feature, index) => {
            // Safely handle different geometry types
            const coordinates = feature.geometry.type === 'Point' 
              ? feature.geometry.coordinates 
              : feature.geometry.coordinates[0][0];

            return (
              <Marker 
                key={index} 
                position={[coordinates[1], coordinates[0]]} 
                icon={getDamageIcon(feature.properties.damage)}
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
            <label><FaRoad /> Upload Dashcam Video</label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              accept="video/*" 
              className="file-input"
            />
          </div>
          
          <div className="form-group">
            <label><FaExclamationTriangle /> Damage Type</label>
            <input
              type="text"
              value={damageType}
              onChange={handleDamageTypeChange}
              placeholder="e.g., Road"
              className="damage-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="analyze-button"
          >
            {loading ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {responseData && (
          <div className="results-container">
            <div className="chart-container">
              <h3><FaCheckCircle /> Damage Severity Overview</h3>
              <Bar 
                data={summaryChartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: 'top' },
                  },
                  scales: {
                    y: { beginAtZero: true, max: 100 },
                  },
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