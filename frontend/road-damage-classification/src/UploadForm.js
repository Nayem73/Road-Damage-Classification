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

        const apiUrl = fileType === 'video' ? 'http://127.0.0.1:8000/analyze-video' : 'http://127.0.0.1:8000/predict';

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
        labels: ['Very Poor', 'Poor', 'Satisfactory', 'Good'],
        datasets: [
            {
                label: 'Damage Percentage',
                data: response?.summary
                    ? [
                          response.summary['very poor'],
                          response.summary.poor,
                          response.summary.satisfactory,
                          response.summary.good,
                      ]
                    : [0, 0, 0, 0], // Default to zeroes if response is undefined
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

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
                    <input type="file" onChange={onFileChange} accept={fileType === 'video' ? 'video/*' : 'image/*'} />
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
                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload'}
                </button>
            </form>

            {response && (
                <div>
                    <h3>Analysis Results:</h3>
                    {response.error ? (
                        <p style={{ color: 'red' }}>{response.error}</p>
                    ) : (
                        <div>
                            <Bar data={chartData} options={chartOptions} />
                            <h4>Total Frames: {response.total_frames}</h4>
                            <h4>Analyzed Frames: {response.analyzed_frames}</h4>
                            <h4>Damage Threshold Status: {getDamageStatus(response.summary)}</h4>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Determine if the damage exceeds the threshold
    function getDamageStatus(summary) {
        const poorPercentage = summary ? summary.poor + summary['very poor'] : 0;
        return poorPercentage > threshold ? 'High Priority for Repair' : 'No Immediate Action Required';
    }
};

export default UploadForm;
