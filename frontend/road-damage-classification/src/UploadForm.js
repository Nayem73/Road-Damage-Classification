import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [damageType, setDamageType] = useState('Road');
    const [fileType, setFileType] = useState('video');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const [threshold, setThreshold] = useState(60); // Threshold for poor/very poor road conditions

    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const onDamageTypeChange = (e) => {
        setDamageType(e.target.value);
    };

    const onFileTypeChange = (e) => {
        setFileType(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a file.");
            return;
        }

        if (!damageType) {
            alert("Please specify a damage type.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('damage_type', damageType);

        const apiUrl = fileType === 'video' ? '/api/analyze-video' : '/api/predict';

        try {
            setLoading(true);

            const result = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log("API Response:", result.data); // Log the response to check its structure
            setResponse(result.data);
            setLoading(false);
        } catch (error) {
            console.error('Error uploading file:', error.response || error.message);
            setResponse({ error: 'Failed to upload file' });
            setLoading(false);
        }
    };

    // Prepare the chart data
    const chartData = {
        labels: ['Very Poor', 'Poor', 'Moderate', 'Good', 'Very Good'],
        datasets: [
            {
                label: 'Damage Percentage',
                data: response && Array.isArray(response.percentages) ? response.percentages : [0, 0, 0, 0, 0], // Default to zeroes if response is undefined
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Prepare the chart options
    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    return (
        <div>
            <h2>Upload File for Damage Analysis</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Choose a file:</label>
                    <input type="file" onChange={onFileChange} accept={fileType === 'video' ? "video/*" : "image/*"} />
                </div>
                <div>
                    <label>Damage Type:</label>
                    <input 
                        type="text" 
                        placeholder="e.g., Road" 
                        value={damageType} 
                        onChange={onDamageTypeChange}
                    />
                </div>
                <div>
                    <label>Select File Type (Video/Image):</label>
                    <select value={fileType} onChange={onFileTypeChange}>
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                    </select>
                </div>
                <button type="submit" disabled={loading}>Upload</button>
            </form>

            {loading && <p>Uploading...</p>}

            {response && (
                <div>
                    <h3>Analysis Response:</h3>
                    {response.error ? (
                        <p style={{ color: 'red' }}>{response.error}</p>
                    ) : (
                        <div>
                            <h4>Damage Analysis Results</h4>
                            <Bar data={chartData} options={chartOptions} />
                            <h5>Location: {response.location || 'N/A'}</h5> {/* Handle missing location */}
                            <h5>Damage Threshold Status: {getDamageStatus(response.percentages)}</h5>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Determine if the damage exceeds the threshold
    function getDamageStatus(percentages) {
        // Check if percentages exists and has at least two values
        if (!Array.isArray(percentages) || percentages.length < 2) {
            return 'Invalid data'; // Or any other fallback message
        }

        const poorPercentage = percentages[0] + percentages[1]; // Very Poor + Poor
        if (poorPercentage > threshold) {
            return 'High Priority for Repair';
        } else {
            return 'No Immediate Action Required';
        }
    }
};

export default UploadForm;
