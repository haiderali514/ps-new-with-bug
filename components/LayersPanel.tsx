
import React from 'react';
import { useStore } from '../store';
import { EyeOpenIcon, EyeClosedIcon, TrashIcon, WandIcon, PlusIcon } from './Icons';

export const LayersPanel: React.FC = () => {
  const { 
    layers, 
    activeLayerId, 
    setActiveLayerId, 
    updateLayer, 
    deleteLayer, 
    removeBackground 
  } = useStore(state => ({
    layers: state.layers,
    activeLayerId: state.activeLayerId,
    setActiveLayerId: state.setActiveLayerId,
    updateLayer: state.updateLayer,
    deleteLayer: state.deleteLayer,
    removeBackground: state.removeBackground,
  }));

  const toggleVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
        updateLayer(id, { visible: !layer.visible });
    }
  };

  return (
    <div className="text-gray-300">
        <h3 className="text-sm font-bold p-2">Layers</h3>
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
            <select className="bg-[#2f2f2f] text-xs p-1 rounded">
                <option>Normal</option>
            </select>
            <div className="flex items-center">
                <label className="text-xs mr-2">Opacity</label>
                <input type="number" defaultValue="100" className="bg-[#2f2f2f] w-12 text-xs p-1 rounded" />
            </div>
        </div>
        <div className="space-y-1 mt-2">
            {layers.slice().reverse().map(layer => (
                <div key={layer.id} 
                     onClick={() => setActiveLayerId(layer.id)}
                     className={`flex items-center gap-2 p-1 rounded cursor-pointer ${activeLayerId === layer.id ? 'bg-blue-800' : 'hover:bg-gray-700'}`}>
                    <button onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }} className="p-1">
                        {layer.visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </button>
                    <div className="w-10 h-10 bg-gray-500 checkerboard flex items-center justify-center">
                        <img src={layer.image.src} alt={layer.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <span className="text-sm flex-1">{layer.name}</span>
                </div>
            ))}
        </div>
        <div className="flex items-center gap-2 p-2 mt-2 border-t border-gray-700">
            <button className="p-1 rounded hover:bg-gray-700"><PlusIcon /></button>
            <button onClick={removeBackground} className="p-1 rounded hover:bg-gray-700" title="Remove Background (AI)"><WandIcon /></button>
            <button onClick={() => activeLayerId && deleteLayer(activeLayerId)} className="p-1 rounded hover:bg-gray-700"><TrashIcon /></button>
        </div>
    </div>
  );
};
