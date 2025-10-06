
import React, { useState } from 'react';
import { useStore } from '../store';
import { EyeOpenIcon, EyeClosedIcon, TrashIcon, WandIcon, PlusIcon, DuplicateIcon } from './Icons';

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 
  'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 
  'exclusion', 'hue', 'saturation', 'color', 'luminosity'
];

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
    addNewLayer,
  } = useStore(state => ({
    layers: state.layers,
    activeLayerId: state.activeLayerId,
    setActiveLayerId: state.setActiveLayerId,
    updateLayer: state.updateLayer,
    deleteLayer: state.deleteLayer,
    removeBackground: state.removeBackground,
    reorderLayers: state.reorderLayers,
    duplicateLayer: state.duplicateLayer,
    addNewLayer: state.addNewLayer,
  }));

  const [draggedId, setDraggedId] = useState<string | null>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const isBackgroundLayerSelected = activeLayerId === layers[0]?.id;

  const toggleVisibility = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
        updateLayer(id, { visible: !layer.visible });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    // Prevent dragging the background layer
    if (layers.length > 0 && layers[0].id === id) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const draggedItemId = e.dataTransfer.getData('text/plain');
    if (draggedItemId && draggedItemId !== targetId) {
        reorderLayers(draggedItemId, targetId);
    }
    setDraggedId(null);
  };
  
  const handleDragEnd = () => {
      setDraggedId(null);
  }

  const handleOpacityChange = (newOpacity: number) => {
      if (activeLayerId) {
          updateLayer(activeLayerId, { opacity: Math.max(0, Math.min(1, newOpacity)) });
      }
  }

  const handleBlendModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (activeLayerId) {
          updateLayer(activeLayerId, { blendingMode: e.target.value });
      }
  }

  return (
    <div className="text-gray-300">
        <h3 className="text-sm font-bold p-2">Layers</h3>
        <div className="flex flex-col p-2 border-b border-gray-700 space-y-2">
            <div className="flex items-center justify-between">
                <select 
                  value={activeLayer?.blendingMode || 'normal'}
                  onChange={handleBlendModeChange}
                  disabled={!activeLayer || isBackgroundLayerSelected}
                  className="bg-[#2f2f2f] text-xs p-1 rounded capitalize w-full disabled:opacity-50">
                    {blendModes.map(mode => <option key={mode} value={mode}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</option>)}
                </select>
            </div>
            <div className="flex items-center space-x-2">
                <label className="text-xs mr-2">Opacity</label>
                <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={(activeLayer?.opacity ?? 1) * 100} 
                    onChange={(e) => handleOpacityChange(parseInt(e.target.value) / 100)}
                    disabled={!activeLayer || isBackgroundLayerSelected}
                    className="flex-grow disabled:opacity-50"
                />
                <input 
                    type="number" 
                    value={Math.round((activeLayer?.opacity ?? 1) * 100)} 
                    onChange={(e) => handleOpacityChange(parseInt(e.target.value) / 100)}
                    disabled={!activeLayer || isBackgroundLayerSelected}
                    className="bg-[#2f2f2f] w-14 text-xs p-1 rounded disabled:opacity-50" 
                />
            </div>
        </div>
        <div className="space-y-1 mt-2">
            {layers.slice().reverse().map((layer, index) => {
                const isBackground = index === layers.length -1;
                return (
                    <div key={layer.id} 
                         onClick={() => setActiveLayerId(layer.id)}
                         draggable={!isBackground}
                         onDragStart={(e) => handleDragStart(e, layer.id)}
                         onDragOver={handleDragOver}
                         onDrop={(e) => handleDrop(e, layer.id)}
                         onDragEnd={handleDragEnd}
                         className={`flex items-center gap-2 p-1 rounded transition-opacity ${!isBackground ? 'cursor-pointer' : 'cursor-default'} ${activeLayerId === layer.id ? 'bg-blue-800' : 'hover:bg-gray-700'} ${draggedId === layer.id ? 'opacity-50' : ''}`}>
                        <button onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }} className="p-1">
                            {layer.visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
                        </button>
                        <div className="w-10 h-10 bg-gray-500 checkerboard flex items-center justify-center">
                            <img src={layer.image.src} alt={layer.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className={`text-sm flex-1 ${isBackground ? 'italic' : ''}`}>{layer.name}</span>
                    </div>
                )
            })}
        </div>
        <div className="flex items-center justify-center gap-2 p-2 mt-2 border-t border-gray-700">
            <button onClick={addNewLayer} className="p-1 rounded hover:bg-gray-700" title="Add Layer"><PlusIcon /></button>
            <button disabled={!activeLayerId || isBackgroundLayerSelected} onClick={() => activeLayerId && duplicateLayer(activeLayerId)} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50" title="Duplicate Layer"><DuplicateIcon /></button>
            <button disabled={!activeLayerId || isBackgroundLayerSelected} onClick={removeBackground} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50" title="Remove Background (AI)"><WandIcon /></button>
            <button disabled={!activeLayerId || isBackgroundLayerSelected} onClick={() => activeLayerId && deleteLayer(activeLayerId)} className="p-1 rounded hover:bg-gray-700 disabled:opacity-50" title="Delete Layer"><TrashIcon /></button>
        </div>
    </div>
  );
};