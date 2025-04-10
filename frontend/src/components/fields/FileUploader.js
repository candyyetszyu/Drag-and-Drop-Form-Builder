import React, { useState, useRef } from 'react';
import { useFormSubmission } from '../../hooks/useFormSubmission';

const FileUploader = ({ formId, fieldId, label, multiple = false, acceptedTypes = '*' }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadProgress, error } = useFormSubmission();
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    if (multiple) {
      setFiles(Array.from(e.target.files));
    } else {
      setFiles(e.target.files.length > 0 ? [e.target.files[0]] : []);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (multiple) {
      setFiles(droppedFiles);
    } else {
      setFiles(droppedFiles.length > 0 ? [droppedFiles[0]] : []);
    }
  };
  
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="file-uploader">
      <label className="form-label">
        {label} {multiple && '(Multiple files allowed)'}
      </label>
      
      <div 
        className={`file-drop-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="file-drop-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
        <p className="file-drop-message">
          Drag & drop files here or <span className="file-browse-link">browse</span>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleFileChange}
          multiple={multiple}
          accept={acceptedTypes}
          style={{ display: 'none' }}
        />
      </div>
      
      {files.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files:</h4>
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                <button 
                  type="button" 
                  className="file-remove-btn"
                  onClick={() => handleRemoveFile(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <div className="progress-bg">
            <div 
              className="progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className="progress-text">{uploadProgress}%</span>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .file-drop-area {
          border: 2px dashed #cbd5e1;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #f8fafc;
        }
        
        .file-drop-area.dragging {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
        
        .file-drop-icon {
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        
        .file-drop-message {
          color: #64748b;
          margin: 0;
        }
        
        .file-browse-link {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .file-list {
          list-style: none;
          padding: 0;
          margin: 1rem 0;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background-color: #f1f5f9;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        
        .file-icon {
          margin-right: 0.5rem;
          color: #64748b;
        }
        
        .file-name {
          flex-grow: 1;
          font-size: 0.875rem;
        }
        
        .file-size {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0 0.5rem;
        }
        
        .file-remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .file-remove-btn:hover {
          background-color: #fee2e2;
        }
        
        .upload-progress {
          margin-top: 1rem;
          display: flex;
          align-items: center;
        }
        
        .progress-bg {
          flex-grow: 1;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-right: 0.5rem;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #3b82f6;
          border-radius: 4px;
        }
        
        .progress-text {
          font-size: 0.75rem;
          color: #3b82f6;
          min-width: 2.5rem;
        }
        
        .error-message {
          margin-top: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default FileUploader;
