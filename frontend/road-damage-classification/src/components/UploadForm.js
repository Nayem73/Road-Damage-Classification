import React, { useState } from 'react';
import axios from 'axios';
import SummaryChart from './SummaryChart';
import DamageMap from './DamageMap';
import '../styles/styles.css';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [damageType, setDamageType] = useState('Road');
    const [loading, setLoading] = useState(false);
    const [responseData, setResponseData] = useState(null);

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleDamageTypeChange = (e) => setDamageType(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file to upload.");
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
            setResponseData(response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to analyze the video. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-form">
            <form onSubmit={handleSubmit}>
                <label>Upload Dashcam Video</label>
                <input type="file" onChange={handleFileChange} accept="video/*" />
                <label>Damage Type</label>
                <input
                    type="text"
                    value={damageType}
                    onChange={handleDamageTypeChange}
                    placeholder="e.g., Road"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Analyzing...' : 'Analyze Video'}
                </button>
            </form>
            {responseData && (
                <div className="results-container">
                    <SummaryChart summary={responseData.summary} />
                    <DamageMap geojsonData={responseData.geojson} />
                </div>
            )}
        </div>
    );
};

export default UploadForm;
