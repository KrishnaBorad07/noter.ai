import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone, FaEllipsisH } from 'react-icons/fa';
import { MdFileUpload } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './History_css.css';

const History = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [files, setFiles] = useState([]);
  const [transcriptions, setTranscriptions] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState(null);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const fetchFiles = async () => {
    try {
      // Fetch audio files
      const { data: audioFiles, error: audioError } = await supabase
        .storage
        .from('audio-files')
        .list(user.id);

      if (audioError) throw audioError;

      // Fetch transcriptions
      const { data: textFiles, error: textError } = await supabase
        .storage
        .from('summarized-text')
        .list(user.id);

      if (textError) throw textError;

      // Create a map of transcriptions
      const transcriptionMap = {};
      textFiles?.forEach(file => {
        const audioFileName = file.name.replace('.txt', '.mp3');
        transcriptionMap[audioFileName] = true;
      });

      // Combine the data
      const processedFiles = audioFiles.map(file => ({
        id: file.id,
        name: file.name,
        uploaded: new Date(file.created_at).toLocaleString(),
        status: transcriptionMap[file.name] ? 'completed' : 'pending'
      }));

      setFiles(processedFiles);
      setTranscriptions(transcriptionMap);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
  };

  const toggleDropdown = (fileId, e) => {
    e.stopPropagation();
    if (activeDropdown === fileId) {
      setActiveDropdown(null);
    } else {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 280;

      let top, left;
      left = rect.left - 230;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top - dropdownHeight + 10;
      } else {
        top = rect.top;
      }

      if (left < 10) {
        left = rect.right + 10;
      }

      setDropdownPosition({ top, left });
      setActiveDropdown(fileId);
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      }
      return [...prev, fileId];
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleViewTranscript = async (fileName) => {
    try {
      const { data, error } = await supabase
        .storage
        .from('summarized-text')
        .download(`${user.id}/${fileName.replace('.mp3', '.txt')}`);

      if (error) throw error;

      const text = await data.text();
      // You can implement a modal or navigation to show the transcript
      console.log('Transcript:', text);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  };

  return (
    <div className="history-container">
      <div className="header">
        <div className="left-section">
          <h1>Recent Files</h1>
        </div>
        <div className="right-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaMicrophone className="mic-icon" />
          </div>
          <button className="transcribe-btn" onClick={() => navigate('/transcribe')}>
            <MdFileUpload /> TRANSCRIBE FILES
          </button>
        </div>
      </div>

      <div className="files-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Uploaded</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id} className={selectedFiles.includes(file.id) ? 'selected' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                  />
                </td>
                <td>{file.name}</td>
                <td>{file.uploaded}</td>
                <td>
                  <span className={`status ${file.status}`}>
                    {file.status}
                  </span>
                </td>
                <td className="action-cell">
                  <div className="dropdown-container" data-file-id={file.id}>
                    <button 
                      className="action-btn"
                      onClick={(e) => toggleDropdown(file.id, e)}
                    >
                      <FaEllipsisH />
                    </button>
                    {activeDropdown === file.id && dropdownPosition && (
                      <div 
                        className="dropdown-menu" 
                        style={{
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`
                        }}
                      >
                        {file.status === 'completed' && (
                          <>
                            <button 
                              className="dropdown-item"
                              onClick={() => handleViewTranscript(file.name)}
                            >
                              <i className="far fa-file-alt"></i> View Transcript
                            </button>
                            <button className="dropdown-item">
                              <i className="fas fa-download"></i> Export Transcript
                            </button>
                          </>
                        )}
                        <button className="dropdown-item">
                          <i className="fas fa-cloud-download-alt"></i> Download Audio
                        </button>
                        <button className="dropdown-item">
                          <i className="fas fa-edit"></i> Rename File
                        </button>
                        <button className="dropdown-item delete">
                          <i className="fas fa-trash-alt"></i> Delete File
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bulk-actions">
          <div className="bulk-actions-content">
            <span>Bulk Actions</span>
            <div className="bulk-buttons">
              <button className="export-btn">EXPORT</button>
              <button className="delete-btn">DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
