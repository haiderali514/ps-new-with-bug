
import { create } from 'zustand';
import type { CanvasOptions, Layer } from './types';
import { Tool } from './types';
import * as geminiService from './services/geminiService';

interface AppState {
  currentPage: 'Home' | 'Editor';
  canvasOptions: CanvasOptions | null;
  layers: Layer[];
  activeLayerId: string | null;
  activeTool: Tool;
  zoom: number;
  selection: DOMRect | null;
  isLoading: boolean;
  loadingMessage: string;
}

interface AppActions {
  goToEditor: (options: CanvasOptions, initialImage?: File) => void;
  goHome: () => void;
  addLayer: (layer: Layer) => void;
  addNewLayer: () => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  setLayers: (layers: Layer[]) => void;
  deleteLayer: (id: string) => void;
  setActiveLayerId: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setSelection: (selection: DOMRect | null) => void;
  removeBackground: () => Promise<void>;
  generativeFill: (prompt: string) => Promise<void>;
  reorderLayers: (draggedId: string, targetId: string) => void;
  duplicateLayer: (id: string) => void;
}

export const useStore = create<AppState & AppActions>((set, get) => ({
  // Initial State
  currentPage: 'Home',
  canvasOptions: null,
  layers: [],
  activeLayerId: null,
  activeTool: Tool.Move,
  zoom: 1,
  selection: null,
  isLoading: false,
  loadingMessage: '',

  // Actions
  goHome: () => set({ 
    currentPage: 'Home', 
    canvasOptions: null, 
    layers: [], 
    activeLayerId: null, 
    selection: null, 
    zoom: 1, 
    activeTool: Tool.Move 
  }),

  goToEditor: (options, initialImageFile) => {
    set({ currentPage: 'Editor', canvasOptions: options, isLoading: true, loadingMessage: 'Creating document...' });
    
    // Create Background Layer
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = options.width;
    bgCanvas.height = options.height;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx && options.backgroundColor !== 'transparent') {
        bgCtx.fillStyle = options.backgroundColor;
        bgCtx.fillRect(0, 0, options.width, options.height);
    }
    
    const bgImage = new Image();
    bgImage.onload = () => {
        const bgId = `layer-bg-${Date.now()}`;
        const backgroundLayer: Layer = { 
            id: bgId, 
            name: 'Background', 
            image: bgImage, 
            x: 0, 
            y: 0, 
            width: options.width, 
            height: options.height, 
            visible: true, 
            opacity: 1,
            blendingMode: 'normal'
        };
        
        const layers: Layer[] = [backgroundLayer];
        let activeLayerId: string | null = bgId;

        if (initialImageFile) {
            const initialImage = new Image();
            initialImage.onload = () => {
                const imgId = `layer-img-${Date.now()}`;
                const imageLayer: Layer = {
                    id: imgId,
                    name: 'Layer 1',
                    image: initialImage,
                    x: (options.width - initialImage.width) / 2, // Center the image
                    y: (options.height - initialImage.height) / 2,
                    width: initialImage.width,
                    height: initialImage.height,
                    visible: true,
                    opacity: 1,
                    blendingMode: 'normal'
                };
                layers.push(imageLayer);
                set({ layers, activeLayerId: imgId, isLoading: false, loadingMessage: '' });
            };
            initialImage.src = URL.createObjectURL(initialImageFile);
        } else {
            set({ layers, activeLayerId, isLoading: false, loadingMessage: '' });
        }
    };
    bgImage.src = bgCanvas.toDataURL();
  },
  
  addLayer: (layer) => set(state => {
    const activeIndex = state.activeLayerId ? state.layers.findIndex(l => l.id === state.activeLayerId) : -1;
    const newLayers = [...state.layers];
    if (activeIndex !== -1) {
        newLayers.splice(activeIndex + 1, 0, layer);
    } else {
        newLayers.push(layer);
    }
    return { layers: newLayers };
  }),

  addNewLayer: () => {
    const { canvasOptions, addLayer, setActiveLayerId } = get();
    if (!canvasOptions) return;
    
    const id = `layer-${Date.now()}`;
    // Create a new blank (transparent) image
    const newImage = new Image(canvasOptions.width, canvasOptions.height);
    
    const newLayer: Layer = {
      id,
      name: `Layer ${get().layers.length}`,
      image: newImage,
      x: 0,
      y: 0,
      width: canvasOptions.width,
      height: canvasOptions.height,
      visible: true,
      opacity: 1,
      blendingMode: 'normal'
    };

    addLayer(newLayer);
    setActiveLayerId(id);
  },
  
  updateLayer: (id, updates) => set(state => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
  })),

  setLayers: (layers) => set({ layers }),

  deleteLayer: (id) => set(state => {
    // Prevent deleting the background layer
    if (state.layers.length > 0 && state.layers[0].id === id) return {};
    
    const newLayers = state.layers.filter(l => l.id !== id);
    let newActiveId = state.activeLayerId;
    if (state.activeLayerId === id) {
      const deletedIndex = state.layers.findIndex(l => l.id === id);
      // Select the layer below, or the new bottom-most layer if the deleted one was at the bottom
      const newIndex = Math.max(0, deletedIndex - 1);
      newActiveId = newLayers.length > 0 ? newLayers[newIndex].id : null;
    }
    return { layers: newLayers, activeLayerId: newActiveId };
  }),

  setActiveLayerId: (id) => set({ activeLayerId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(zoom, 16)) }),
  setSelection: (selection) => set({ selection }),

  removeBackground: async () => {
    const { activeLayerId, layers, updateLayer } = get();
    if (!activeLayerId) return;
    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.image.src) return;

    set({ isLoading: true, loadingMessage: 'Removing background with AI...' });

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = activeLayer.image.naturalWidth;
    tempCanvas.height = activeLayer.image.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {
      set({ isLoading: false, loadingMessage: '' });
      return;
    }
    ctx.drawImage(activeLayer.image, 0, 0);
    const imageDataUrl = tempCanvas.toDataURL('image/png');

    try {
      const resultUrl = await geminiService.removeBackground(imageDataUrl);
      if (resultUrl) {
        const newImage = new Image();
        newImage.onload = () => {
          updateLayer(activeLayerId, { image: newImage, width: newImage.width, height: newImage.height });
          set({ isLoading: false, loadingMessage: '' });
        };
        newImage.src = resultUrl;
      } else {
         set({ isLoading: false, loadingMessage: '' });
      }
    } catch (error) {
      console.error("Failed to remove background:", error);
      set({ isLoading: false, loadingMessage: 'Error removing background' });
    }
  },
  
  generativeFill: async (prompt) => {
    const { selection, addLayer, setActiveLayerId } = get();
    if (!selection) return;

    set({ isLoading: true, loadingMessage: 'Generating image with AI...' });

    try {
        const resultUrl = await geminiService.generativeFill(prompt, Math.round(selection.width), Math.round(selection.height));
        if (resultUrl) {
            const newImage = new Image();
            newImage.crossOrigin = "anonymous";
            newImage.onload = () => {
                const id = `layer-${Date.now()}`;
                const newLayer: Layer = {
                    id,
                    name: `Fill: ${prompt.substring(0, 15)}`,
                    image: newImage,
                    x: selection.x,
                    y: selection.y,
                    width: newImage.width,
                    height: newImage.height,
                    visible: true,
                    opacity: 1,
                    blendingMode: 'normal',
                };
                addLayer(newLayer);
                setActiveLayerId(id);
                 set({ isLoading: false, loadingMessage: '', selection: null, activeTool: Tool.Move });
            };
            newImage.src = resultUrl;
        } else {
             set({ isLoading: false, loadingMessage: '', selection: null, activeTool: Tool.Move });
        }
    } catch (error) {
        console.error("Failed to generate fill:", error);
        set({ isLoading: false, loadingMessage: 'Error generating image', selection: null, activeTool: Tool.Move });
    }
  },

  reorderLayers: (draggedId, targetId) => set(state => {
    const { layers } = state;
    // Prevent dragging below the background layer
    if (layers.length > 0 && targetId === layers[0].id) {
        return {};
    }

    const draggedIndex = layers.findIndex(l => l.id === draggedId);
    let targetIndex = layers.findIndex(l => l.id === targetId);
  
    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === 0) {
      return {};
    }
    
    const newLayers = [...layers];
    const [draggedLayer] = newLayers.splice(draggedIndex, 1);
    
    // Adjust target index if dragged item was moved from below
    targetIndex = newLayers.findIndex(l => l.id === targetId);

    newLayers.splice(targetIndex, 0, draggedLayer);
  
    return { layers: newLayers };
  }),
  
  duplicateLayer: (id) => set(state => {
      const { layers } = state;
      const layerToDuplicate = layers.find(l => l.id === id);
      if (!layerToDuplicate) return {};
  
      const newImage = new Image();
      newImage.src = layerToDuplicate.image.src;
      newImage.width = layerToDuplicate.width;
      newImage.height = layerToDuplicate.height;
  
      const newId = `layer-${Date.now()}`;
      const newLayer: Layer = {
          ...layerToDuplicate,
          id: newId,
          name: `${layerToDuplicate.name} copy`,
          image: newImage,
      };
  
      const originalIndex = layers.findIndex(l => l.id === id);
      const newLayers = [...layers];
      newLayers.splice(originalIndex + 1, 0, newLayer);
  
      return {
          layers: newLayers,
          activeLayerId: newId,
      };
  }),
}));