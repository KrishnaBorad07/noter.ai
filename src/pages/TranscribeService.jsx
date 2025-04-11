import React, { useState } from 'react';
import './TranscribeService.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TranscribeService = () => {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle transcription logic here
    console.log('Processing:', file ? 'File upload' : 'Video URL:', videoUrl);
  };

  return (
    <div className="transcribe-service">
      <div className="transcribe-container">
        <h1>Transcribe Your Content</h1>
        <div className="upload-options">
          <div className="upload-section">
            <h2>Upload Video Lecture</h2>
            <div className="file-upload-area">
              <input
                type="file"
                id="video-upload"
                onChange={handleFileChange}
                accept="video/*"
                className="file-input"
              />
              <label htmlFor="video-upload" className="upload-label">
                {file ? file.name : 'Choose a video file'}
              </label>
            </div>
          </div>
          
          <div className="divider">
            <span>OR</span>
          </div>

          <div className="url-section">
            <h2>Paste Video Link</h2>
            <input
              type="url"
              value={videoUrl}
              onChange={handleUrlChange}
              placeholder="Enter video URL here"
              className="url-input"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="generate-btn"
          disabled={!file && !videoUrl}
        >
          Generate Transcription
        </button>
      </div>
    </div>
  );
};

export default TranscribeService;
