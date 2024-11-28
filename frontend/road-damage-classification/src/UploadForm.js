import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = () => {
    const [file, setFile] = useState(null);
    const [damageType, setDamageType] = useState('Road');
    const [fileType, setFileType] = useState('video'); // 'video' or 'image'
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    // Handle file input change
    const onFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle damage type change (default to "Road")
    const onDamageTypeChange = (e) => {
        setDamageType(e.target.value);
    };

    // Handle file type change (select between video or image)
    const onFileTypeChange = (e) => {
        setFileType(e.target.value);
    };

    // Handle form submit
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

        const apiUrl = fileType === 'video' ? '/api/analyze-video' : '/api/predict'; // Choose endpoint based on file type

        try {
            setLoading(true);

            // Axios POST request to the backend
            const result = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle successful response
            setResponse(result.data);
            setLoading(false);
        } catch (error) {
            // Handle error
            console.error('Error uploading file:', error.response || error.message);
            setResponse({ error: 'Failed to upload file' });
            setLoading(false);
        }
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
                        <pre>{JSON.stringify(response, null, 2)}</pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadForm;
