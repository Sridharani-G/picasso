'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStudio } from '@/context/StudioContext';

export default function CanvasEngine() {
    const { 
        activeTool, 
        color, 
        brushSize, 
        brushOpacity, 
        brushFlow,
        brushHardness,
        stabilization, 
        layers, 
        activeLayerId, 
        layerRefs, 
        isDrawing, 
        setIsDrawing,
        saveState,
        referenceImage,
        referenceOpacity,
        referenceScale,
        referencePos,
        showGrid,
        selectionType,
        setSelectionType,
        selectionPath,
        setSelectionPath,
        symmetryEnabled
    } = useStudio();

    const containerRef = useRef<HTMLDivElement>(null);
    const selectionCanvasRef = useRef<HTMLCanvasElement>(null);
    const lastPoint = useRef<{ x: number, y: number } | null>(null);

    // Initialize/Resize Canvases
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const initCanvas = (canvas: HTMLCanvasElement | null, isFirstTime: boolean, isMain: boolean, id?: string) => {
            if (!canvas) return;
            
            const rect = container.getBoundingClientRect();
            if (canvas.width !== rect.width || canvas.height !== rect.height) {
                const ctx = canvas.getContext('2d', { willReadFrequently: isMain });
                const temp = isFirstTime ? null : ctx?.getImageData(0, 0, canvas.width, canvas.height);
                
                canvas.width = rect.width;
                canvas.height = rect.height;
                
                if (ctx) {
                    if (id === '1' && isFirstTime) {
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                    }
                    if (temp) ctx.putImageData(temp, 0, 0);
                }
            }
        };

        layers.forEach(layer => initCanvas(layerRefs.current[layer.id], true, true, layer.id));
        initCanvas(selectionCanvasRef.current, true, false);

        const handleResize = () => {
            layers.forEach(layer => initCanvas(layerRefs.current[layer.id], false, true, layer.id));
            initCanvas(selectionCanvasRef.current, false, false);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [layers.length]);

    // Draw Selection Overlay
    useEffect(() => {
        const canvas = selectionCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (selectionPath.length < 2) return;

        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;

        if (selectionType === 'lasso') {
            ctx.beginPath();
            ctx.moveTo(selectionPath[0].x, selectionPath[0].y);
            selectionPath.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
        } else if (selectionType === 'rect') {
            const start = selectionPath[0];
            const end = selectionPath[1];
            ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
        }
    }, [selectionPath, selectionType]);

    const [moveData, setMoveData] = useState<{ data: ImageData, startX: number, startY: number } | null>(null);

    const stampBrush = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, flow: number, hardness: number, brushColor: string) => {
        const rad = size / 2;
        const grad = ctx.createRadialGradient(x, y, rad * hardness, x, y, rad);
        grad.addColorStop(0, brushColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.globalAlpha = opacity * flow;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
    };

    const startDrawing = (e: React.PointerEvent) => {
        const canvas = layerRefs.current[activeLayerId];
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        if (activeTool === 'select') {
            setSelectionType('lasso'); // Default to lasso for now
            setSelectionPath([{ x, y }]);
            setIsDrawing(true);
            return;
        }

        if (activeTool === 'move') {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
                setMoveData({ data, startX: x, startY: y });
            }
            setIsDrawing(true);
            return;
        }

        setIsDrawing(true);
        lastPoint.current = { x, y };
        
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            const layerIndex = layers.findIndex(l => l.id === activeLayerId);
            const layer = layers[layerIndex];
            
            // Industrial Clipping Logic
            if (layer?.isClipping && layerIndex > 0) {
                ctx.globalCompositeOperation = 'source-atop';
            } else if (layer?.alphaLock) {
                ctx.globalCompositeOperation = 'source-atop';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            // Apply Selection Mask if it exists
            if (selectionPath.length > 2) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(selectionPath[0].x, selectionPath[0].y);
                selectionPath.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
                ctx.clip();
            }
        }
    };

    const draw = (e: React.PointerEvent) => {
        if (!isDrawing) return;

        const canvas = layerRefs.current[activeLayerId];
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        if (activeTool === 'select') {
            setSelectionPath((prev: { x: number, y: number }[]) => [...prev, { x, y }]);
            return;
        }

        if (activeTool === 'move' && moveData) {
            const dx = x - moveData.startX;
            const dy = y - moveData.startY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.putImageData(moveData.data, dx, dy);
            return;
        }

        if (!lastPoint.current) return;
        
        const pressure = e.pressure !== 0 ? e.pressure : 1;
        const dynamicSize = brushSize * pressure;
        const dynamicAlpha = brushOpacity * (e.pointerType === 'pen' ? pressure : 1);
        const dynamicFlow = brushFlow;

        // Stabilization
        const weight = stabilization / 20; 
        const smoothedX = lastPoint.current.x * weight + x * (1 - weight);
        const smoothedY = lastPoint.current.y * weight + y * (1 - weight);

        if (activeTool === 'brush' || activeTool === 'eraser' || activeTool === 'blender') {
            const brushColor = activeTool === 'eraser' ? '#FFFFFF' : color;
            
            // Distance-based stamping for smooth flow
            const dist = Math.hypot(smoothedX - lastPoint.current.x, smoothedY - lastPoint.current.y);
            const steps = Math.max(1, Math.floor(dist / (dynamicSize / 4))); // 25% overlap for smoothness
            
            for (let i = 0; i < steps; i++) {
                const lerpX = lastPoint.current.x + (smoothedX - lastPoint.current.x) * (i / steps);
                const lerpY = lastPoint.current.y + (smoothedY - lastPoint.current.y) * (i / steps);
                
                if (activeTool === 'blender') {
                    const sampleSize = dynamicSize;
                    const sample = ctx.getImageData(lerpX - sampleSize/2, lerpY - sampleSize/2, sampleSize, sampleSize);
                    ctx.putImageData(sample, lerpX - sampleSize/2 + (lerpX - lastPoint.current.x), lerpY - sampleSize/2 + (lerpY - lastPoint.current.y));
                } else {
                    stampBrush(ctx, lerpX, lerpY, dynamicSize, dynamicAlpha, dynamicFlow, brushHardness, brushColor);
                    
                    if (symmetryEnabled) {
                        const centerX = canvas.width / 2;
                        const mirroredX = centerX + (centerX - lerpX);
                        stampBrush(ctx, mirroredX, lerpY, dynamicSize, dynamicAlpha, dynamicFlow, brushHardness, brushColor);
                    }
                }
            }
        }

        lastPoint.current = { x: smoothedX, y: smoothedY };
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            if (activeTool !== 'select') {
                const ctx = layerRefs.current[activeLayerId]?.getContext('2d');
                if (ctx && selectionPath.length > 2) ctx.restore(); // Restore from clip
                saveState();
            }
            setMoveData(null);
        }
        lastPoint.current = null;
    };

    return (
        <div 
            id="canvas-root"
            ref={containerRef}
            className="flex-1 relative bg-[#141414] overflow-hidden cursor-crosshair touch-none"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
        >
            {/* Grid Overlay */}
            {showGrid && (
                <div className="absolute inset-0 pointer-events-none opacity-10 z-[1]" style={{ backgroundImage: 'radial-gradient(#555 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            )}

            {/* Selection Overlay Canvas */}
            <canvas 
                ref={selectionCanvasRef}
                className="absolute inset-0 z-[50] pointer-events-none w-full h-full"
            />

            {/* Reference Image Engine Overlay */}
            {referenceImage && (
                <div 
                    className="absolute inset-0 z-[5] pointer-events-none overflow-hidden select-none"
                    style={{ opacity: referenceOpacity }}
                >
                    <img 
                        src={referenceImage} 
                        alt="Reference" 
                        className="max-w-none origin-top-left pointer-events-none"
                        style={{ 
                            transform: `translate(${referencePos.x}px, ${referencePos.y}px) scale(${referenceScale})`,
                        }}
                    />
                </div>
            )}

            {/* Layer Stack */}
            {layers.map((layer) => (
                <canvas
                    key={layer.id}
                    ref={(el) => { layerRefs.current[layer.id] = el; }}
                    className={`absolute inset-0 w-full h-full object-contain ${layer.visible ? 'block' : 'hidden'}`}
                    style={{ 
                        opacity: layer.opacity,
                        mixBlendMode: layer.blendingMode as any,
                        zIndex: layers.indexOf(layer) + 10
                    }}
                />
            ))}
        </div>
    );
}
