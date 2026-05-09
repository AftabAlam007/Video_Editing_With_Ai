import React from 'react';

const VideoPlayer = ({ src }) => {
  return (
    <video 
      src={src} 
      controls 
      className="w-full h-full object-contain bg-black"
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
