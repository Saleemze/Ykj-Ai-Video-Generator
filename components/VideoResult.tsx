
import React from 'react';

interface VideoResultProps {
  src: string;
}

const VideoResult: React.FC<VideoResultProps> = ({ src }) => (
  <div className="w-full h-full p-2 flex items-center justify-center">
    <video
      key={src} // Force re-mount on new src to avoid issues
      src={src}
      controls
      autoPlay
      loop
      className="max-w-full max-h-full rounded-lg shadow-lg"
    >
      Your browser does not support the video tag.
    </video>
  </div>
);

export default VideoResult;
