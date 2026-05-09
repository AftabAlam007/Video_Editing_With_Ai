import React, { useState } from 'react';
import axios from 'axios';
import VideoUpload from './components/VideoUpload.jsx';
import VideoPlayer from './components/VideoPlayer.jsx';

const EDIT_PRESETS = [
  { label: 'Cinematic', prompt: 'cinematic karo' },
  { label: 'Enhance', prompt: 'quality badhao video clear karo' },
  { label: 'Reel 9:16', prompt: 'reel banao vertical karo' },
  { label: 'Background Blur', prompt: 'background blur karo' },
  { label: 'WM Top L', prompt: 'top left watermark hatao' },
  { label: 'WM Top R', prompt: 'top right watermark hatao' },
  { label: 'WM Bottom L', prompt: 'bottom left watermark hatao' },
  { label: 'WM Bottom R', prompt: 'bottom right watermark hatao' },
  { label: 'WM Center', prompt: 'center watermark hatao' },
  { label: 'WM All Areas', prompt: 'kahi bhi watermark hatao' },
  { label: 'Face Clear', prompt: 'face clear karo' },
  { label: 'Subtitles', prompt: 'subtitle lagao' },
  { label: 'Music', prompt: 'music lagao' },
];

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const progressValue = Math.max(0, Math.min(100, Number(progressPercentage) || 0));

  const handlePresetClick = (presetPrompt) => {
    setPrompt((currentPrompt) => {
      const promptParts = currentPrompt
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);

      if (promptParts.includes(presetPrompt)) {
        return promptParts.filter((part) => part !== presetPrompt).join(', ');
      }

      return [...promptParts, presetPrompt].join(', ');
    });
  };

  const isPresetSelected = (presetPrompt) => {
    return prompt
      .split(',')
      .map((part) => part.trim())
      .includes(presetPrompt);
  };

  const handleUploadSuccess = (data) => {
    setJobId(data.id);
    setStatus(data.status);
    setProgressPercentage(data.progressPercentage || 0);
    setProgressMessage(data.progressMessage || 'Video uploaded');
    setVideoUrl(null);
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
    setProgressPercentage(5);
    setProgressMessage('Preparing AI edit');
    try {
      const response = await axios.post(`http://localhost:8080/api/videos/${jobId}/process`, {
        prompt: prompt
      });
      setStatus(response.data.status);
      
      // Start polling for status
      pollStatus(jobId);
    } catch (error) {
      console.error("Error processing video:", error);
      setStatus('FAILED');
      setProgressMessage('Processing failed');
      setIsProcessing(false);
    }
  };

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/videos/${id}`);
        const job = response.data;
        setStatus(job.status);
        setProgressPercentage(job.progressPercentage || 0);
        setProgressMessage(job.progressMessage || '');
        if (job.status === 'COMPLETED') {
          clearInterval(interval);
          setIsProcessing(false);
          setProgressPercentage(100);
          // Set the final video URL for the player to play
          setVideoUrl(`http://localhost:8080/api/videos/${id}/download?t=${Date.now()}`);
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          setProgressMessage(job.errorMessage || 'Processing failed');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error("Error checking status:", error);
        clearInterval(interval);
        setProgressMessage('Could not check processing status');
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
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-gray-300">Quick edits</p>
                {prompt && (
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="text-xs font-semibold text-gray-400 hover:text-white transition"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EDIT_PRESETS.map((preset) => {
                  const selected = isPresetSelected(preset.prompt);

                  return (
                    <button
                      key={preset.prompt}
                      type="button"
                      onClick={() => handlePresetClick(preset.prompt)}
                      className={`min-h-10 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                        selected
                          ? 'border-purple-400 bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                          : 'border-gray-600 bg-gray-900 text-gray-200 hover:border-blue-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
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
              {isProcessing ? `Processing... ${progressValue}%` : 'Apply AI Edit'}
            </button>
            
            {status && (
              <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700">
                <p className="text-sm">Status: <span className="font-semibold text-blue-400">{status}</span></p>
                {(isProcessing || progressValue > 0) && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>{progressMessage || 'Processing video'}</span>
                      <span className="font-semibold text-blue-300">{progressValue}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${progressValue}%` }}
                      />
                    </div>
                  </div>
                )}
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
