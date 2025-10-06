
import React, { memo } from 'react';
import { useStore } from '../store';
import { Tool } from '../types';
import { MoveIcon, WandIcon, SparklesIcon, SelectIcon, RetouchIcon, QuickActionsIcon, EffectsIcon, PaintIcon, ShapesIcon, TypeIcon, AddImageIcon, EyedropperIcon, ColorsIcon } from './Icons';

interface ToolButtonProps {
  tool: Tool;
  children: React.ReactNode;
}

const ToolButton: React.FC<ToolButtonProps> = ({ tool, children }) => {
    const { activeTool, setActiveTool } = useStore(state => ({ activeTool: state.activeTool, setActiveTool: state.setActiveTool }));
    const isActive = activeTool === tool;
    return (
        <button 
            onClick={() => setActiveTool(tool)} 
            className={`p-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        >
            {children}
        </button>
    );
};

export const LeftToolbar: React.FC = memo(() => {
  return (
    <aside className="w-16 bg-[#1E1E1E] p-2 flex flex-col items-center gap-2">
      <ToolButton tool={Tool.Move}><MoveIcon className="w-6 h-6"/></ToolButton>
      <ToolButton tool={Tool.GenerativeFill}><SparklesIcon className="w-6 h-6"/></ToolButton>
      <ToolButton tool={Tool.RemoveBackground}><WandIcon className="w-6 h-6"/></ToolButton>
      <div className="w-full border-t border-gray-700 my-2"></div>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><SelectIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><RetouchIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><QuickActionsIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><EffectsIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><PaintIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><ShapesIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><TypeIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><AddImageIcon className="w-6 h-6" /></button>
      <div className="w-full border-t border-gray-700 my-2"></div>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><EyedropperIcon className="w-6 h-6" /></button>
      <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><ColorsIcon className="w-6 h-6" /></button>
    </aside>
  );
});
