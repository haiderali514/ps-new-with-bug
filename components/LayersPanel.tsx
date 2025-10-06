import React, { useState } from 'react';
import { useStore } from '../store';
import { EyeOpenIcon, EyeClosedIcon, TrashIcon, WandIcon, PlusIcon, DuplicateIcon } from './Icons';

export const LayersPanel: React.FC = () => {
  const { 
    layers, 
    activeLayerId, 
    setActiveLayerId, 
    updateLayer, 
    deleteLayer, 
    removeBackground,
    reorderLayers,
    duplicateLayer,
  } = useStore(state => ({
    layers: state.layers,
    activeLayerId: state.activeLayerId,
    setActiveLayerId: state.setActiveLayerId,
    updateLayer: state.updateLayer,
    deleteLayer: state.deleteLayer,
    removeBackground: state.removeBackground,
    reorderLayers: state.reorderLayers,
    duplicateLayer: state.duplicateLayer,
  }));

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  const toggleVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
        updateLayer(id, { visible: !layer.visible });
    }
  };
  
  const handleOpacityChange = (newOpacity: number) => {
    if (activeLayerId) {
        const clampedOpacity = Math.max(0, Math.min(1, newOpacity));
        updateLayer(activeLayerId, { opacity: clampedOpacity });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const droppedOnId = targetId;
    const draggedItemId = e.dataTransfer.getData('text/plain');
    if (draggedItemId && draggedItemId !== droppedOnId) {
        reorderLayers(draggedItemId, droppedOnId);
    }
    setDraggedId(null);
  };
  
  const handleDragEnd = () => {
      setDraggedId(null);
  }

  return (
    <div className="text-gray-300">
        <h3 className="text-sm font-bold p-2">Layers</h3>
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
            <select className="bg-[#2f2f2f] text-xs p-1 rounded">
                <option>Normal</option>
            </select>
            <div className="flex items-center gap-2">
                <label htmlFor="opacity-slider" className="text-xs">Opacity</label>
                <input
                    id="opacity-slider"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={activeLayer?.opacity ?? 1}
                    onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                    disabled={!activeLayer}
                    className="w-20 accent-blue-500"
                />
                <input 
                    type="number" 
                    value={activeLayer ? Math.round(activeLayer.opacity * 100) : 100} 
                    onChange={(e) => handleOpacityChange(parseInt(e.target.value, 10) / 100)}
                    disabled={!activeLayer}
                    className="bg-[#2f2f2f] w-12 text-xs p-1 rounded text-center"
                    min="0"
                    max="100"
                />
            </div>
        </div>
        <div className="space-y-1 mt-2">
            {layers.slice().reverse().map(layer => (
                <div key={layer.id} 
                     onClick={() => setActiveLayerId(layer.id)}
                     draggable={true}
                     onDragStart={(e) => handleDragStart(e, layer.id)}
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(e, layer.id)}
                     onDragEnd={handleDragEnd}
                     className={`flex items-center gap-2 p-1 rounded cursor-pointer transition-opacity ${activeLayerId === layer.id ? 'bg-blue-800' : 'hover:bg-gray-700'} ${draggedId === layer.id ? 'opacity-50' : ''}`}>
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
        <div className="flex items-center justify-center gap-2 p-2 mt-2 border-t border-gray-700">
            <button className="p-1 rounded hover:bg-gray-700" title="Add Layer"><PlusIcon /></button>
            <button onClick={() => activeLayerId && duplicateLayer(activeLayerId)} className="p-1 rounded hover:bg-gray-700" title="Duplicate Layer"><DuplicateIcon /></button>
            <button onClick={removeBackground} className="p-1 rounded hover:bg-gray-700" title="Remove Background (AI)"><WandIcon /></button>
            <button onClick={() => activeLayerId && deleteLayer(activeLayerId)} className="p-1 rounded hover:bg-gray-700" title="Delete Layer"><TrashIcon /></button>
        </div>
    </div>
  );
};