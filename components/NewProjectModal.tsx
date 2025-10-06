
import React, { useState } from 'react';
import type { CanvasOptions } from '../types';
import { CloseIcon, SavePresetIcon } from './Icons';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (options: CanvasOptions) => void;
}

const presets = {
  "Film & video": [
    { name: "HDTV 1080p", width: 1920, height: 1080 },
    { name: "UHDTV/4K/2160p", width: 3840, height: 2160 },
  ],
  "Most common": [
    { name: "Instagram post, Square", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "YouTube thumbnail", width: 1280, height: 720 },
  ],
};

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreate }) => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [docName, setDocName] = useState('Untitled-1');
  const [activeTab, setActiveTab] = useState('Film & video');

  const handlePresetClick = (p: {name: string, width: number, height: number}) => {
    setWidth(p.width);
    setHeight(p.height);
  };

  const handleCreate = () => {
    onCreate({ width, height, backgroundColor });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2f2f2f] text-gray-200 rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <header className="flex justify-end p-2">
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700"><CloseIcon/></button>
        </header>

        <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar */}
            <aside className="w-64 p-4 border-r border-gray-700">
                <h2 className="font-bold mb-4">Quick start</h2>
                <nav>
                    <ul>
                        <li><button className="w-full text-left p-2 rounded hover:bg-gray-700">All quick actions</button></li>
                        <li><button className="w-full text-left p-2 rounded bg-gray-700 font-semibold">Document sizes</button></li>
                        <li><button className="w-full text-left p-2 rounded hover:bg-gray-700">Custom size</button></li>
                    </ul>
                </nav>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center border-b border-gray-700 mb-6">
                    {Object.keys(presets).map(tab => (
                        <button key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm ${activeTab === tab ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(presets[activeTab as keyof typeof presets] || []).map(preset => (
                        <button key={preset.name} onClick={() => handlePresetClick(preset)} className="bg-[#3a3a3a] p-4 rounded-lg text-center hover:ring-2 ring-blue-500">
                            <p className="font-semibold text-sm">{preset.name}</p>
                            <p className="text-xs text-gray-400">{preset.width} x {preset.height} px</p>
                        </button>
                    ))}
                </div>

            </main>

            {/* Right Panel */}
            <aside className="w-80 p-6 bg-[#3a3a3a] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">Preset details</h3>
                  <button className="text-sm text-blue-400 flex items-center gap-1 hover:underline"><SavePresetIcon /> Save preset</button>
                </div>
                <div className="space-y-4">
                    <div>
                        <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)} className="bg-[#2f2f2f] w-full p-2 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-gray-400">Width</label>
                            <input type="number" value={width} onChange={e => setWidth(parseInt(e.target.value))} className="bg-[#2f2f2f] w-full p-2 rounded border border-gray-600" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-gray-400">Height</label>
                            <input type="number" value={height} onChange={e => setHeight(parseInt(e.target.value))} className="bg-[#2f2f2f] w-full p-2 rounded border border-gray-600" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Background contents</label>
                        <div className="flex items-center gap-2 mt-1">
                             <select value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="bg-[#2f2f2f] flex-1 p-2 rounded border border-gray-600">
                                <option value="#FFFFFF">White</option>
                                <option value="#000000">Black</option>
                                <option value="transparent">Transparent</option>
                            </select>
                            <input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="h-9 w-9 p-0.5 bg-[#2f2f2f] rounded border border-gray-600 cursor-pointer" />
                        </div>
                    </div>
                    <button onClick={handleCreate} className="w-full bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">Create</button>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};
