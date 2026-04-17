'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiClient';

interface Layer {
    id: string;
    name: string;
    visible: boolean;
    opacity: number;
    blendingMode: string;
    isClipping: boolean;
    alphaLock: boolean;
}

interface StudioContextType {
    // Tools State
    activeTool: 'brush' | 'eraser' | 'fill' | 'select' | 'move' | 'blender';
    setActiveTool: (tool: any) => void;
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    brushSize: number;
    setBrushSize: React.Dispatch<React.SetStateAction<number>>;
    brushOpacity: number;
    setBrushOpacity: React.Dispatch<React.SetStateAction<number>>;
    brushFlow: number;
    setBrushFlow: React.Dispatch<React.SetStateAction<number>>;
    brushHardness: number;
    setBrushHardness: React.Dispatch<React.SetStateAction<number>>;
    stabilization: number;
    setStabilization: React.Dispatch<React.SetStateAction<number>>;
    rotation: number;
    setRotation: React.Dispatch<React.SetStateAction<number>>;
    showGrid: boolean;
    setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
    symmetryEnabled: boolean;
    setSymmetryEnabled: React.Dispatch<React.SetStateAction<boolean>>;

    // Selection State
    selectionType: 'none' | 'lasso' | 'rect';
    setSelectionType: React.Dispatch<React.SetStateAction<'none' | 'lasso' | 'rect'>>;
    selectionPath: { x: number, y: number }[];
    setSelectionPath: React.Dispatch<React.SetStateAction<{ x: number, y: number }[]>>;

    // Layers State
    layers: Layer[];
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    activeLayerId: string;
    setActiveLayerId: (id: string) => void;
    layerRefs: React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;

    // Reference State
    referenceImage: string | null;
    setReferenceImage: (img: string | null) => void;
    referenceOpacity: number;
    setReferenceOpacity: (v: number) => void;
    referenceScale: number;
    setReferenceScale: (v: number) => void;
    referencePos: { x: number, y: number };
    setReferencePos: (pos: { x: number, y: number }) => void;

    // History
    historyIndex: number;
    handleUndo: () => void;
    handleRedo: () => void;
    saveState: () => void;

    // Utils
    addLayer: () => void;
    duplicateLayer: (id: string) => void;
    mergeDown: (id: string) => void;
    deleteLayer: (id: string) => void;
    handleClear: () => void;
    handleExport: () => void;
    handleInstallAsset: (asset: any) => void;
    installedAssets: any[];
    isDrawing: boolean;
    setIsDrawing: (v: boolean) => void;
    leftSidebarTab: 'tools' | 'subtool';
    setLeftSidebarTab: (v: 'tools' | 'subtool') => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: React.ReactNode }) {
    const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'fill' | 'select' | 'move' | 'blender'>('brush');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [brushOpacity, setBrushOpacity] = useState(1);
    const [brushFlow, setBrushFlow] = useState(1);
    const [brushHardness, setBrushHardness] = useState(1);
    const [stabilization, setStabilization] = useState(5);
    const [rotation, setRotation] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [symmetryEnabled, setSymmetryEnabled] = useState(false);

    const [selectionType, setSelectionType] = useState<'none' | 'lasso' | 'rect'>('none');
    const [selectionPath, setSelectionPath] = useState<{ x: number, y: number }[]>([]);

    const [layers, setLayers] = useState<Layer[]>([
        { id: '1', name: 'Background', visible: true, opacity: 1, blendingMode: 'source-over', isClipping: false, alphaLock: false },
        { id: '2', name: 'Layer 1', visible: true, opacity: 1, blendingMode: 'source-over', isClipping: false, alphaLock: false }
    ]);
    const [activeLayerId, setActiveLayerId] = useState('2');
    const layerRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

    const [history, setHistory] = useState<Record<string, ImageData>[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [installedAssets, setInstalledAssets] = useState<any[]>([]);
    const [leftSidebarTab, setLeftSidebarTab] = useState<'tools' | 'subtool'>('tools');

    const [referenceImage, setReferenceImage] = useState<string | null>(null);
    const [referenceOpacity, setReferenceOpacity] = useState(0.5);
    const [referenceScale, setReferenceScale] = useState(1);
    const [referencePos, setReferencePos] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null); // To be assigned by CanvasEngine if needed for export

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const apiUrl = getApiUrl();
                const res = await fetch(`${apiUrl}/assets`);
                const data = await res.json();
                setInstalledAssets(data.slice(0, 4));
            } catch (err) {
                console.error('Failed to fetch initial assets:', err);
            }
        };
        fetchInitial();
    }, []);

    const handleInstallAsset = (asset: any) => {
        setInstalledAssets(prev => [...prev, asset]);
    };

    const handleExport = async () => {
        // Find the canvas container to get dimensions
        const root = document.getElementById('canvas-root');
        if (!root) return;

        const offscreen = document.createElement('canvas');
        offscreen.width = root.clientWidth;
        offscreen.height = root.clientHeight;
        const oCtx = offscreen.getContext('2d');
        if (!oCtx) return;

        layers.forEach(layer => {
            if (!layer.visible) return;
            const canvas = layerRefs.current[layer.id];
            if (canvas) {
                oCtx.globalAlpha = layer.opacity;
                oCtx.globalCompositeOperation = layer.blendingMode as any;
                oCtx.drawImage(canvas, 0, 0);
            }
        });

        const dataUrl = offscreen.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `art_studio_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const saveState = useCallback(() => {
        const state: Record<string, ImageData> = {};
        layers.forEach(l => {
            const canvas = layerRefs.current[l.id];
            const ctx = canvas?.getContext('2d', { willReadFrequently: true });
            if (ctx && canvas) {
                state[l.id] = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
        });
        
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(state);
            return newHistory;
        });
        setHistoryIndex(prev => prev + 1);
    }, [historyIndex, layers]);

    const handleUndo = () => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        const prevState = history[newIndex];
        Object.entries(prevState).forEach(([id, data]) => {
            const canvas = layerRefs.current[id];
            const ctx = canvas?.getContext('2d', { willReadFrequently: true });
            if (ctx) ctx.putImageData(data, 0, 0);
        });
        setHistoryIndex(newIndex);
    };

    const handleRedo = () => {
        if (historyIndex >= history.length - 1) return;
        const nextIndex = historyIndex + 1;
        const nextState = history[nextIndex];
        Object.entries(nextState).forEach(([id, data]) => {
            const canvas = layerRefs.current[id];
            const ctx = canvas?.getContext('2d', { willReadFrequently: true });
            if (ctx) ctx.putImageData(data, 0, 0);
        });
        setHistoryIndex(nextIndex);
    };

    const addLayer = () => {
        const newId = Date.now().toString();
        setLayers(prev => [...prev, { id: newId, name: `Layer ${prev.length}`, visible: true, opacity: 1, blendingMode: 'source-over', isClipping: false, alphaLock: false }]);
        setActiveLayerId(newId);
    };

    const duplicateLayer = (id: string) => {
        const sourceLayer = layers.find(l => l.id === id);
        if (!sourceLayer) return;

        const newId = Date.now().toString();
        const newLayer = { ...sourceLayer, id: newId, name: `${sourceLayer.name} Copy` };
        
        setLayers(prev => {
            const index = prev.findIndex(l => l.id === id);
            const next = [...prev];
            next.splice(index + 1, 0, newLayer);
            return next;
        });

        // Copy pixels on next tick after new canvas is ready
        setTimeout(() => {
            const sourceCanvas = layerRefs.current[id];
            const destCanvas = layerRefs.current[newId];
            if (sourceCanvas && destCanvas) {
                const sCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
                const dCtx = destCanvas.getContext('2d', { willReadFrequently: true });
                if (sCtx && dCtx) {
                    dCtx.putImageData(sCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height), 0, 0);
                }
            }
            saveState();
        }, 100);
        
        setActiveLayerId(newId);
    };

    const mergeDown = (id: string) => {
        const index = layers.findIndex(l => l.id === id);
        if (index <= 0) return; // Cannot merge bottom layer

        const topLayer = layers[index];
        const bottomLayer = layers[index - 1];
        
        const topCanvas = layerRefs.current[topLayer.id];
        const bottomCanvas = layerRefs.current[bottomLayer.id];
        
        if (topCanvas && bottomCanvas) {
            const bCtx = bottomCanvas.getContext('2d', { willReadFrequently: true });
            if (bCtx) {
                bCtx.globalAlpha = topLayer.opacity;
                bCtx.globalCompositeOperation = topLayer.blendingMode as any;
                bCtx.drawImage(topCanvas, 0, 0);
            }
        }

        setLayers(prev => prev.filter(l => l.id !== id));
        setActiveLayerId(bottomLayer.id);
        saveState();
    };

    const deleteLayer = (id: string) => {
        if (id === '1') return;
        setLayers(prev => {
            const next = prev.filter(l => l.id !== id);
            if (activeLayerId === id) setActiveLayerId(next[next.length - 1].id);
            return next;
        });
    };

    const handleClear = () => {
        const canvas = layerRefs.current[activeLayerId];
        const ctx = canvas?.getContext('2d', { willReadFrequently: true });
        if (!ctx || !canvas) return;
        if (activeLayerId === '1') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        saveState();
    };

    return (
        <StudioContext.Provider value={{
            activeTool, setActiveTool, color, setColor, brushSize, setBrushSize, 
            brushOpacity, setBrushOpacity, brushFlow, setBrushFlow, brushHardness, setBrushHardness,
            stabilization, setStabilization, rotation, setRotation, showGrid, setShowGrid,
            selectionType, setSelectionType, selectionPath, setSelectionPath,
            symmetryEnabled, setSymmetryEnabled,
            layers, setLayers, activeLayerId, setActiveLayerId, layerRefs,
            referenceImage, setReferenceImage, referenceOpacity, setReferenceOpacity, referenceScale, setReferenceScale, referencePos, setReferencePos,
            historyIndex, handleUndo, handleRedo, saveState,
            addLayer, duplicateLayer, mergeDown, deleteLayer, handleClear, handleExport, handleInstallAsset, installedAssets, isDrawing, setIsDrawing,
            leftSidebarTab, setLeftSidebarTab
        }}>
            {children}
        </StudioContext.Provider>
    );
}

export function useStudio() {
    const context = useContext(StudioContext);
    if (!context) throw new Error('useStudio must be used within StudioProvider');
    return context;
}
