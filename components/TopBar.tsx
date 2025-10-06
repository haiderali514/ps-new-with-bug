
import React, { memo } from 'react';
import { useStore } from '../store';
import { PsIcon, BellIcon, UserIcon } from './Icons';

export const TopBar: React.FC = memo(() => {
  const { zoom, setZoom, goHome } = useStore(state => ({
      zoom: state.zoom,
      setZoom: state.setZoom,
      goHome: state.goHome,
  }));

  return (
    <header className="h-14 bg-[#1E1E1E] flex items-center justify-between px-4 border-b border-gray-700 text-sm">
      <div className="flex items-center gap-4">
        <button onClick={goHome}>
            <div className="p-1.5 bg-blue-600 rounded-lg"><PsIcon className="w-5 h-5" /></div>
        </button>
        <div>
          <span className="font-semibold">Untitled-1</span>
          <span className="text-gray-400"> - 29-09-2025 02:48:25</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center">
            <button onClick={() => setZoom(zoom - 0.1)} className="px-2">-</button>
            <span className="w-16 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button onClick={() => setZoom(zoom + 0.1)} className="px-2">+</button>
        </div>
        <button className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-1.5 rounded-full font-semibold">Upgrade</button>
        <button className="bg-blue-600 px-4 py-1.5 rounded-full font-semibold">Download</button>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-1.5 rounded-full hover:bg-gray-700"><BellIcon /></button>
        <button className="p-1.5 rounded-full hover:bg-gray-700"><UserIcon /></button>
      </div>
    </header>
  );
});
