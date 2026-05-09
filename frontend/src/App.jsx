import React, { useState } from 'react';
import axios from 'axios';
import VideoUpload from './components/VideoUpload.jsx';
import VideoPlayer from './components/VideoPlayer.jsx';

// Yahan apne Render ke Backend ka URL daalein
const API_BASE_URL = 'https://video-editor-backend-78jq.onrender.com';

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const quickEdits = [
    'Cinematic', 'Enhance', 'Reel 9:16', 'Background Blur', 
    'WM Top L', 'WM Top R', 'WM Bottom L', 'WM Bottom R', 'WM Center', 'WM All Areas', 
    'Face Clear', 'Subtitles', 'Music'
  ];

  const handleQuickEdit = (edit) => {
    setPrompt(prev => {
      if (prev) {
        return prev.includes(edit) ? prev : `${prev}, ${edit}`;
      }
      return edit;
    });
  };

  const handleUploadSuccess = (data) => {
    setJobId(data.id);
    setStatus(data.status);
    // Assuming backend returns a temporary URL for preview or we just wait for processing
  };

  const handleProcessVideo = async () => {
    if (!jobId) {
      alert("Please upload a video first.");
      return;
    }
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    setIsProcessing(true);
    setStatus('PROCESSING');
    try {
      const response = await axios.post(`${API_BASE_URL}/api/videos/${jobId}/process`, {
        prompt: prompt
      });
      setStatus(response.data.status);
      
      // Start polling for status
      pollStatus(jobId);
    } catch (error) {
      console.error("Error processing video:", error);
      setStatus('FAILED');
      setIsProcessing(false);
    }
  };

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/videos/${id}`);
        setStatus(response.data.status);
        if (response.data.status === 'COMPLETED') {
          clearInterval(interval);
          setIsProcessing(false);
          // Set the final video URL for the player to play
          setVideoUrl(`${API_BASE_URL}/api/videos/${id}/download`);
        } else if (response.data.status === 'FAILED') {
          clearInterval(interval);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error checking status:", error);
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          AI Video Editor
        </h1>
        <p className="text-center text-gray-400 mt-2">Edit your videos locally with the power of AI</p>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">1. Upload Video</h2>
            <VideoUpload onUploadSuccess={handleUploadSuccess} />
            {jobId && <p className="text-sm text-green-400 mt-2">Video uploaded! Job ID: {jobId}</p>}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">2. Enter AI Prompt</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Quick edits</p>
              <div className="flex flex-wrap gap-2">
                {quickEdits.map((edit) => (
                  <button key={edit} onClick={() => handleQuickEdit(edit)} className="text-xs bg-gray-700 hover:bg-purple-600 px-3 py-1.5 rounded-full transition">
                    {edit}
                  </button>
                ))}
              </div>
            </div>

            <textarea 
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition"
              rows="3"
              placeholder="e.g., 'Make it cinematic', 'Add subtitles', 'Remove watermark'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button 
              onClick={handleProcessVideo}
              disabled={isProcessing || !jobId}
              className={`mt-4 w-full py-3 rounded-lg font-bold transition ${isProcessing || !jobId ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg'}`}
            >
              {isProcessing ? 'Processing...' : 'Apply AI Edit'}
            </button>
            
            {status && (
              <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-sm">Status: <span className="font-semibold text-blue-400">{status}</span></p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">3. Preview & Download</h2>
          <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-lg border border-dashed border-gray-600 overflow-hidden min-h-[300px]">
            {videoUrl ? (
              <VideoPlayer src={videoUrl} />
            ) : (
              <p className="text-gray-500 text-center p-4">Processed video will appear here.</p>
            )}
          </div>
          {videoUrl && (
            <a 
              href={videoUrl}
              download
              className="mt-4 block w-full text-center py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold transition shadow-lg"
            >
              Download Final Video
            </a>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
