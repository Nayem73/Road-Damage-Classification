import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './VideoAnalysisMap.css'; // Optional CSS for styling

const VideoAnalysisMap = () => {
    const [geojsonData, setGeojsonData] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('damage_type', 'Road'); // Adjust as needed

        try {
            setLoading(true);
            setError(null);

            const response = await axios.post('http://localhost:8000/analyze-video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { geojson, summary } = response.data;
            setGeojsonData(geojson);
            setSummary(summary);
        } catch (err) {
            console.error('Error uploading file:', err);
            setError('Failed to analyze video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderSummary = () => {
        if (!summary) return null;

        return (
            <div className="summary-container">
                <h3>Analysis Summary</h3>
                <ul>
                    {Object.entries(summary).map(([key, value]) => (
                        <li key={key}>
                            {key}: {value.toFixed(2)}%
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="map-container">
            <h1>Road Damage Video Analysis</h1>
            <input type="file" accept="video/*" onChange={handleFileUpload} />
            {loading && <p>Analyzing video... Please wait.</p>}
            {error && <p className="error">{error}</p>}

            {renderSummary()}

            {geojsonData && (
                <MapContainer center={[35.6895, 139.6917]} zoom={13} style={{ height: '500px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <GeoJSON data={geojsonData} onEachFeature={(feature, layer) => {
                        const { frame, damage } = feature.properties;
                        layer.bindPopup(`<strong>Frame:</strong> ${frame}<br/><strong>Damage:</strong> ${damage}`);
                    }} />
                </MapContainer>
            )}
        </div>
    );
};

export default VideoAnalysisMap;
