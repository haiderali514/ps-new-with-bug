
import React, { useState } from 'react';
import { useStore } from '../store';
import { Tool } from '../types';
import { SparklesIcon } from './Icons';

export const ContextualBar: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const { generativeFill, setSelection, setActiveTool } = useStore(state => ({
      generativeFill: state.generativeFill,
      setSelection: state.setSelection,
      setActiveTool: state.setActiveTool,
  }));

  const handleFill = () => {
    if (prompt) {
      generativeFill(prompt);
    }
  };
  
  const handleCancel = () => {
      setSelection(null);
      setActiveTool(Tool.Move);
  };

  return (
    <div className="absolute bottom-10 bg-[#3a3a3a] p-2 rounded-lg shadow-2xl flex items-center gap-2">
      <div className="flex items-center bg-[#2f2f2f] rounded border border-gray-600 px-2">
        <SparklesIcon className="w-5 h-5 text-gray-400"/>
        <input 
          type="text" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like to generate?"
          className="bg-transparent p-2 text-sm focus:outline-none w-64"
          onKeyDown={(e) => e.key === 'Enter' && handleFill()}
        />
      </div>
      <button 
        onClick={handleFill} 
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-50"
        disabled={!prompt}
      >
        Fill
      </button>
      <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm">
        Cancel
      </button>
    </div>
  );
};
