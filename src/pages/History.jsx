import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaMicrophone, FaEllipsisH, FaFileAlt, FaFileAudio } from 'react-icons/fa';
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
  const [notes, setNotes] = useState({});
  const [transcriptions, setTranscriptions] = useState({});
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });

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

      // Fetch notes
      const { data: noteFiles, error: noteError } = await supabase
        .storage
        .from('notes')
        .list(user.id);

      if (noteError) throw noteError;

      // Create a map of transcriptions
      const transcriptionMap = {};
      textFiles?.forEach(file => {
        const audioFileName = file.name.replace('.txt', '.mp3');
        transcriptionMap[audioFileName] = file.name;
      });

      // Create a map of notes
      const notesMap = {};
      noteFiles?.forEach(file => {
        const audioFileName = file.name.replace('_notes.txt', '.mp3');
        notesMap[audioFileName] = file.name;
      });

      // Combine the data
      const processedFiles = audioFiles.map(file => ({
        id: file.id,
        name: file.name,
        uploaded: new Date(file.created_at).toLocaleString(),
        status: notesMap[file.name] 
          ? 'completed' 
          : transcriptionMap[file.name] 
            ? 'transcribed' 
            : 'pending',
        hasNotes: !!notesMap[file.name],
        notesFilename: notesMap[file.name] || null,
        transcriptionFilename: transcriptionMap[file.name] || null
      }));

      setFiles(processedFiles);
      setTranscriptions(transcriptionMap);
      setNotes(notesMap);
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

  const handleViewNotes = async (file) => {
    try {
      if (!file.hasNotes) {
        alert('No notes available for this file.');
        return;
      }

      const { data, error } = await supabase
        .storage
        .from('notes')
        .download(`${user.id}/${file.notesFilename}`);

      if (error) throw error;

      const content = await data.text();
      setCurrentNote({
        title: file.name.replace('.mp3', ''),
        content: content
      });
      setShowNoteModal(true);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'transcribed':
        return 'orange';
      case 'pending':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Notes Ready';
      case 'transcribed':
        return 'Transcribed';
      case 'pending':
        return 'Processing';
      default:
        return 'Unknown';
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-container" onClick={handleClickOutside}>
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
                {/* <input
                  type="checkbox"
                  checked={selectedFiles.length === files.length && files.length > 0}
                  onChange={handleSelectAll}
                /> */}
              </th>
              <th>Name</th>
              <th>Uploaded</th>
              <th>Status</th>
              <th>Actions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map(file => (
              <tr key={file.id} className={selectedFiles.includes(file.id) ? 'selected' : ''}>
                {/* <td>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                  />
                </td> */}
                <td>{file.name}</td>
                <td>{file.uploaded}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(file.status)}`}>
                    {getStatusText(file.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {file.hasNotes && (
                      <button 
                        className="action-button notes-button"
                        onClick={() => handleViewNotes(file)}
                        title="View Notes"
                      >
                        <FaFileAlt /> Notes
                      </button>
                    )}
                    {file.transcriptionFilename && !file.hasNotes && (
                      <button 
                        className="action-button generate-button"
                        onClick={() => navigate(`/notes/${file.transcriptionFilename}`)}
                        title="Generate Notes"
                      >
                        <FaFileAlt /> Generate Notes
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <button
                    className="more-options-btn"
                    onClick={(e) => toggleDropdown(file.id, e)}
                  >
                    <FaEllipsisH />
                  </button>
                  {activeDropdown === file.id && (
                    <div
                      className="dropdown-container"
                      style={{
                        position: 'fixed',
                        top: `${dropdownPosition?.top}px`,
                        left: `${dropdownPosition?.left}px`,
                      }}
                    >
                      <div className="dropdown-menu">
                        {file.hasNotes && <button onClick={() => handleViewNotes(file)}>View Notes</button>}
                        {file.transcriptionFilename && !file.hasNotes && (
                          <button onClick={() => navigate(`/notes/${file.transcriptionFilename}`)}>Generate Notes</button>
                        )}
                        <button>Download Pdf</button>
                        <button className="delete-btn">Delete</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNoteModal && (
        <div className="note-modal-overlay" onClick={() => setShowNoteModal(false)}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-header">
              <h2>{currentNote.title}</h2>
              <button className="close-button" onClick={() => setShowNoteModal(false)}>×</button>
            </div>
            <div className="note-modal-content">
              <pre>{currentNote.content}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
