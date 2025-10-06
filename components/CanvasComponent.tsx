
import React, { useRef, useEffect, memo } from 'react';
import { useStore } from '../store';
import { Tool } from '../types';

export const CanvasComponent: React.FC = memo(() => {
  const { 
    canvasOptions: options, 
    layers, 
    activeLayerId, 
    setActiveLayerId, 
    updateLayer, 
    activeTool, 
    zoom, 
    selection, 
    setSelection 
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const interactionState = useRef<{
    isDragging: boolean;
    isSelecting: boolean;
    startX: number;
    startY: number;
    dragOffsetX: number;
    dragOffsetY: number;
  }>({ isDragging: false, isSelecting: false, startX: 0, startY: 0, dragOffsetX: 0, dragOffsetY: 0 });

  const stateRef = useRef({ layers, activeLayerId, activeTool, zoom, selection, updateLayer, setActiveLayerId, setSelection });
  useEffect(() => {
    stateRef.current = { layers, activeLayerId, activeTool, zoom, selection, updateLayer, setActiveLayerId, setSelection };
  }, [layers, activeLayerId, activeTool, zoom, selection, updateLayer, setActiveLayerId, setSelection]);

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !options) return;

    canvas.width = options.width;
    canvas.height = options.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // The checkerboard pattern is handled by a background div, so we don't draw a background here if it's transparent.
    // This allows the checkerboard to show through. If a solid color is needed, the background layer will handle it.

    // Draw layers
    layers.forEach(layer => {
      if (layer.visible && layer.image.complete && layer.image.naturalWidth > 0) {
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation = layer.blendingMode as GlobalCompositeOperation;
        ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
      }
    });

    // Reset context properties
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';


  }, [layers, options, zoom]); // Redraw on zoom as well to ensure sharpness if needed in future
  
  // Event handlers for mouse interaction
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getCoords = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / stateRef.current.zoom,
            y: (e.clientY - rect.top) / stateRef.current.zoom
        };
    };

    const onMouseDown = (e: MouseEvent) => {
        const { x, y } = getCoords(e);
        interactionState.current.startX = e.clientX;
        interactionState.current.startY = e.clientY;
        const { activeTool, layers, setActiveLayerId, setSelection } = stateRef.current;
        
        if (activeTool === Tool.Move) {
            // Find the top-most clicked layer, ignoring the background layer for selection if other layers are present.
            const clickableLayers = layers.length > 1 ? layers.slice(1) : layers;
            const clickedLayer = [...clickableLayers].reverse().find(layer => 
                layer.visible && x >= layer.x && x <= layer.x + layer.width && y >= layer.y && y <= layer.y + layer.height
            );

            if (clickedLayer) {
                setActiveLayerId(clickedLayer.id);
                interactionState.current.isDragging = true;
                interactionState.current.dragOffsetX = x - clickedLayer.x;
                interactionState.current.dragOffsetY = y - clickedLayer.y;
            } else {
                 // If no specific layer is clicked, check if the background is clicked.
                 const backgroundLayer = layers[0];
                 if(backgroundLayer && backgroundLayer.visible && x >= backgroundLayer.x && x <= backgroundLayer.x + backgroundLayer.width && y >= backgroundLayer.y && y <= backgroundLayer.y + backgroundLayer.height){
                     setActiveLayerId(backgroundLayer.id);
                 } else {
                    setActiveLayerId(null);
                 }
            }
        } else if (activeTool === Tool.GenerativeFill) {
            interactionState.current.isSelecting = true;
            setSelection(new DOMRect(x, y, 0, 0));
        }
    };

    const onMouseMove = (e: MouseEvent) => {
        const { x, y } = getCoords(e);
        const { isDragging, isSelecting } = interactionState.current;
        const { activeTool, activeLayerId, updateLayer, setSelection, zoom, layers } = stateRef.current;
        const isBackground = activeLayerId === layers[0]?.id;

        if (activeTool === Tool.Move && isDragging && activeLayerId && !isBackground) {
            const newX = x - interactionState.current.dragOffsetX;
            const newY = y - interactionState.current.dragOffsetY;
            updateLayer(activeLayerId, { x: newX, y: newY });
        } else if (activeTool === Tool.GenerativeFill && isSelecting) {
            const startX = (interactionState.current.startX - canvas.getBoundingClientRect().left) / zoom;
            const startY = (interactionState.current.startY - canvas.getBoundingClientRect().top) / zoom;
            const rectX = Math.min(startX, x);
            const rectY = Math.min(startY, y);
            const rectW = Math.abs(x - startX);
            const rectH = Math.abs(y - startY);
            setSelection(new DOMRect(rectX, rectY, rectW, rectH));
        }
    };
    
    const onMouseUp = () => {
      interactionState.current.isDragging = false;
      if (interactionState.current.isSelecting && stateRef.current.selection?.width === 0 && stateRef.current.selection?.height === 0) {
        stateRef.current.setSelection(null);
      }
      interactionState.current.isSelecting = false;
    };

    const parent = canvas.parentElement;
    parent?.addEventListener('mousedown', onMouseDown);
    parent?.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      parent?.removeEventListener('mousedown', onMouseDown);
      parent?.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []); // Empty dependency array means this effect runs once

  if (!options) return null;

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div 
        className="relative shadow-lg"
        style={{
            width: options.width * zoom,
            height: options.height * zoom,
        }}
    >
      <div 
          className={`absolute top-0 left-0 w-full h-full ${options.backgroundColor === 'transparent' ? 'checkerboard' : ''}`}
          style={{ backgroundColor: options.backgroundColor === 'transparent' ? '' : options.backgroundColor }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            cursor: activeTool === Tool.Move && activeLayer && activeLayer.name !== 'Background' ? 'move' : (activeTool === Tool.GenerativeFill ? 'crosshair' : 'default')
        }}
      />
      {/* Active Layer Bounding Box */}
      {activeTool === Tool.Move && activeLayer && activeLayer.name !== 'Background' && (() => {
          return (
            <div 
                className="absolute border-2 border-blue-500 pointer-events-none"
                style={{
                    left: activeLayer.x * zoom,
                    top: activeLayer.y * zoom,
                    width: activeLayer.width * zoom,
                    height: activeLayer.height * zoom,
                }}
            />
          );
      })()}
      {/* Selection Box */}
       {activeTool === Tool.GenerativeFill && selection && (
           <div
            className="absolute border-2 border-dashed border-white pointer-events-none bg-blue-500 bg-opacity-20"
            style={{
                left: selection.x * zoom,
                top: selection.y * zoom,
                width: selection.width * zoom,
                height: selection.height * zoom,
            }}
           />
       )}
    </div>
  );
});