
import React, { useState, useEffect } from 'react';
import { VIDEO_LOADING_MESSAGES } from '../constants';
import { Tab } from '../types';

interface LoadingIndicatorProps {
  activeTab: Tab;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ activeTab }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (activeTab === Tab.Video) {
      const interval = setInterval(() => {
        setMessageIndex((prevIndex) => (prevIndex + 1) % VIDEO_LOADING_MESSAGES.length);
      }, 4000); // Change message every 4 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const message = activeTab === Tab.Video ? VIDEO_LOADING_MESSAGES[messageIndex] : 'Crafting your visual masterpiece...';

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 text-slate-400">
      <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-medium text-slate-300">Generating...</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
