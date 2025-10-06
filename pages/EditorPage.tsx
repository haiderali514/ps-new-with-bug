
import React, { useEffect } from 'react';
import { useStore } from '../store';
import { Tool } from '../types';
import { LeftToolbar } from '../components/LeftToolbar';
import { RightSidebar } from '../components/RightSidebar';
import { CanvasComponent } from '../components/CanvasComponent';
import { ContextualBar } from '../components/ContextualBar';
import { TopBar } from '../components/TopBar';

const EditorPage: React.FC = () => {
  const { 
    isLoading, 
    loadingMessage, 
    activeTool, 
    selection, 
    canvasOptions,
    zoom,
    setZoom
  } = useStore(state => ({
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
    activeTool: state.activeTool,
    selection: state.selection,
    canvasOptions: state.canvasOptions,
    zoom: state.zoom,
    setZoom: state.setZoom
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        let zoomChanged = false;
        if (e.key === '=' || e.key === '+') {
          setZoom(zoom + 0.1);
          zoomChanged = true;
        } else if (e.key === '-') {
          setZoom(zoom - 0.1);
          zoomChanged = true;
        } else if (e.key === '0') {
          setZoom(1);
          zoomChanged = true;
        }

        if (zoomChanged) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [zoom, setZoom]);
  
  if (!canvasOptions) {
    // This can happen briefly if state is cleared, maybe redirect home
    return null; 
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#1E1E1E]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftToolbar />
        <main className="flex-1 flex items-center justify-center bg-[#2f2f2f] relative overflow-hidden">
          {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                  <p className="text-white mt-4">{loadingMessage}</p>
              </div>
          )}
          <CanvasComponent />
          {(activeTool === Tool.GenerativeFill && selection) && (
            <ContextualBar />
          )}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
};

export default EditorPage;