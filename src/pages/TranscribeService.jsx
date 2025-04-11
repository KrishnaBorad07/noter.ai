import React, { useState } from 'react';
import './TranscribeService.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TranscribeService = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid video file');
      setFile(null);
    }
  };

  const handleConversion = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.split('.')[0]}.mp3`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setFile(null);
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    } catch (err) {
      setError('Failed to convert video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transcribe-container">
      <h1 className="transcribe-header">Convert Video to Audio</h1>
      
      <div className="file-upload-container" onClick={() => document.getElementById('file-input').click()}>
        <input
          type="file"
          id="file-input"
          className="file-input"
          accept="video/*"
          onChange={handleFileChange}
        />
        <p>Click or drag a video file here</p>
        {file && <p className="file-info">Selected: {file.name}</p>}
      </div>

      {error && <p className="error-message">{error}</p>}
      
      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      <button
        className="upload-button"
        onClick={handleConversion}
        disabled={!file || loading}
      >
        {loading ? 'Converting...' : 'Convert to Audio'}
      </button>
    </div>
  );
};

export default TranscribeService;
