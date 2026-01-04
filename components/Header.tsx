
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-4 relative">
      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-shimmer">
        YKJ-AI
      </h1>
      <p className="mt-2 text-slate-400 text-lg">
        Create & Brainstorm with AI
      </p>
    </header>
  );
};

export default Header;
