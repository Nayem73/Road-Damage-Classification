import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';

const DamageMap = ({ geojsonData }) => {
    const styleFeature = (feature) => {
        const damage = feature.properties.damage;
        let color = 'gray';
        if (damage === 'very poor') color = 'red';
        else if (damage === 'poor') color = 'orange';
        else if (damage === 'satisfactory') color = 'yellow';
        else if (damage === 'good') color = 'green';

        return { color, weight: 3, fillColor: color, fillOpacity: 0.5 };
    };

    return (
        <div className="map-container">
            <h3>Damage Locations</h3>
            <MapContainer center={[35.6895, 139.6917]} zoom={12} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <GeoJSON data={geojsonData} style={styleFeature} />
            </MapContainer>
        </div>
    );
};

export default DamageMap;
