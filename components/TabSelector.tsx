
import React from 'react';
import { Tab } from '../types';

interface TabSelectorProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 text-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-purple-500 ${
        isActive
          ? 'bg-purple-600 text-white shadow-lg'
          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );
};

const TabSelector: React.FC<TabSelectorProps> = ({ activeTab, onTabChange }) => (
  <div className="mt-8 p-1.5 bg-slate-800 rounded-xl grid grid-cols-2 gap-2 max-w-sm mx-auto">
    <TabButton
      label="Generate Video"
      isActive={activeTab === Tab.Video}
      onClick={() => onTabChange(Tab.Video)}
    />
    <TabButton
      label="Generate Photo"
      isActive={activeTab === Tab.Photo}
      onClick={() => onTabChange(Tab.Photo)}
    />
  </div>
);

export default TabSelector;
