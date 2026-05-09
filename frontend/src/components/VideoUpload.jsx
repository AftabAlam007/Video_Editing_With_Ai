import React, { useState, useRef } from 'react';
import axios from 'axios';

const VideoUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please drop a valid video file.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8080/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      onUploadSuccess(response.data);
      setUploading(false);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload video. Please try again.');
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div 
        className="border-2 border-dashed border-gray-500 hover:border-purple-500 rounded-xl p-8 text-center cursor-pointer transition bg-gray-900"
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="video/*" 
          className="hidden" 
        />
        {file ? (
          <p className="text-purple-400 font-medium">{file.name}</p>
        ) : (
          <div>
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-300">Drag and drop a video, or click to select</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {uploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-400 mt-1 text-center">{progress}% Uploaded</p>
        </div>
      )}

      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className={`mt-4 w-full py-2 rounded-lg font-semibold transition ${(!file || uploading) ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 shadow-lg'}`}
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
};

export default VideoUpload;
