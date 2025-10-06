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
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  setLayers: (layers: Layer[]) => void;
  deleteLayer: (id: string) => void;
  setActiveLayerId: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
  setZoom: (zoom: number) => void;
  setSelection: (selection: DOMRect | null) => void;
  removeBackground: () => Promise<void>;
  generativeFill: (prompt: string) => Promise<void>;
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

  goToEditor: (options, initialImage) => {
    set({ currentPage: 'Editor', canvasOptions: options, isLoading: true, loadingMessage: 'Setting up canvas...' });
    
    const id = `layer-${Date.now()}`;
    
    if (initialImage) {
      const image = new Image();
      image.onload = () => {
        const newLayer: Layer = { id, name: 'Image 1', image, x: 0, y: 0, width: image.width, height: image.height, visible: true, opacity: 1 };
        set({ layers: [newLayer], activeLayerId: id, isLoading: false, loadingMessage: '' });
      };
      image.src = URL.createObjectURL(initialImage);
    } else {
      const newLayer: Layer = { id, name: 'Background', image: new Image(options.width, options.height), x: 0, y: 0, width: options.width, height: options.height, visible: true, opacity: 1 };
      set({ layers: [newLayer], activeLayerId: id, isLoading: false, loadingMessage: '' });
    }
  },
  
  addLayer: (layer) => set(state => ({ layers: [...state.layers, layer] })),
  
  updateLayer: (id, updates) => set(state => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
  })),

  setLayers: (layers) => set({ layers }),

  deleteLayer: (id) => set(state => {
    const newLayers = state.layers.filter(l => l.id !== id);
    const newActiveId = state.activeLayerId === id ? (newLayers.length > 0 ? newLayers[newLayers.length - 1].id : null) : state.activeLayerId;
    return { layers: newLayers, activeLayerId: newActiveId };
  }),

  setActiveLayerId: (id) => set({ activeLayerId: id }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, zoom) }),
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
}));