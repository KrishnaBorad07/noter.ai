import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaMicrophone, FaEllipsisH } from 'react-icons/fa';
import { MdFileUpload } from 'react-icons/md';
import './History_css.css';

const History = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

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
      const dropdownHeight = 280; // Approximate height of dropdown

      let top, left;

      // Position horizontally to the left of the button
      left = rect.left - 230; // 220px width + 10px margin

      // If there's not enough space below, show above
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top - dropdownHeight + 10;
      } else {
        top = rect.top;
      }

      // If dropdown would go off the left edge, show it to the right of the button
      if (left < 10) {
        left = rect.right + 10;
      }

      setDropdownPosition({ top, left });
      setActiveDropdown(fileId);
    }
  };

  const [dropdownPosition, setDropdownPosition] = useState(null);


  const dummyFiles = [
    { id: 1, name: 'meeting', uploaded: 'Apr 2, 2025, 9:53 PM', duration: '12m 16s', status: 'completed' },
    { id: 2, name: 'lecture_recording', uploaded: 'Apr 2, 2025, 8:30 PM', duration: '45m 20s', status: 'completed' },
    { id: 3, name: 'interview', uploaded: 'Apr 1, 2025, 3:15 PM', duration: '30m 45s', status: 'completed' }
  ];

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      }
      return [...prev, fileId];
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === dummyFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(dummyFiles.map(file => file.id));
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
          <button className="transcribe-btn">
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
                  checked={selectedFiles.length === dummyFiles.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Name</th>
              <th>Uploaded</th>
              <th>Duration</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dummyFiles.map(file => (
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
                <td>{file.duration}</td>
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
                        <button className="dropdown-item">
                          <i className="far fa-file-alt"></i> Open Transcript
                        </button>
                        <button className="dropdown-item">
                          <i className="fas fa-download"></i> Export Transcript
                        </button>
                        <button className="dropdown-item">
                          <i className="fas fa-share"></i> Share Transcript
                        </button>
                        <button className="dropdown-item">
                          <i className="fas fa-cloud-download-alt"></i> Download Audio
                          <span className="file-size">5.89 MB</span>
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
