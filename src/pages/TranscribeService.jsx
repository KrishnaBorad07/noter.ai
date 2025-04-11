import React, { useState } from 'react';
import './TranscribeService.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TranscribeService = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setError('');
      setSuccess('');
      setAudioUrl(null);
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
    setSuccess('');
    setAudioUrl(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/convert', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).catch(err => {
        throw new Error('Cannot connect to server. Please make sure the backend is running.');
      });

      if (!response) {
        throw new Error('No response from server');
      }

      let data;
      try {
        data = await response.json();
      } catch (err) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      if (data.success && data.url) {
        setAudioUrl(data.url);
        setSuccess(data.message || 'Successfully converted video to audio!');
        setFile(null);
        setProgress(100);
        setTimeout(() => setProgress(0), 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to convert video. Please try again.');
      console.error('Conversion error:', err);
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
      {success && <p className="success-message">{success}</p>}
      
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

      {audioUrl && (
        <div className="audio-result">
          <p>Audio file ready!</p>
          <audio controls src={audioUrl} />
          <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="download-link">
            Download Audio
          </a>
        </div>
      )}
    </div>
  );
};

export default TranscribeService;
