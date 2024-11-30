import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';

const DamageMap = ({ geojsonData }) => {
    const styleFeature = (feature) => {
        const damage = feature.properties.damage;
        let color = 'gray';
        if (damage === 'very poor') color = '#FF0000';
        else if (damage === 'poor') color = '#FF9900';
        else if (damage === 'satisfactory') color = '#FFFF00';
        else if (damage === 'good') color = '#00FF00';

        return { color, weight: 2, fillColor: color, fillOpacity: 0.6 };
    };

    const onEachFeature = (feature, layer) => {
        const { damage, location } = feature.properties;
        layer.bindPopup(
            `<strong>Damage Level:</strong> ${damage}<br/><strong>Location:</strong> ${location}`
        );
    };

    return (
        <div className="map-container">
            <h3>Damage Locations</h3>
            <MapContainer center={[35.6895, 139.6917]} zoom={12} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_ACCESS_TOKEN"
                    id="mapbox/streets-v11"
                    attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                />
                <GeoJSON
                    data={geojsonData}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                />
            </MapContainer>
        </div>
    );
};

export default DamageMap;
