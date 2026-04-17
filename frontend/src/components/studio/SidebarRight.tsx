'use client';

import React, { useState } from 'react';
import { 
    EyeIcon, 
    EyeSlashIcon, 
    PlusIcon, 
    TrashIcon,
    Bars3CenterLeftIcon,
    DocumentDuplicateIcon,
    TableCellsIcon,
    LockClosedIcon,
    Squares2X2Icon,
    FolderIcon,
    Square2StackIcon
} from '@heroicons/react/24/solid';
import { useStudio } from '@/context/StudioContext';
import Navigator from './Navigator';

export default function SidebarRight() {
    const { 
        layers, 
        setLayers, 
        activeLayerId, 
        setActiveLayerId, 
        layerRefs, 
        addLayer, 
        duplicateLayer,
        mergeDown,
        deleteLayer,
        rotation,
        setRotation,
        referenceImage,
        referenceOpacity,
        setReferenceOpacity,
        referenceScale,
        setReferenceScale,
        setReferenceImage,
        brushFlow,
        setBrushFlow,
        brushHardness,
        setBrushHardness,
        selectionPath,
        setSelectionPath,
        symmetryEnabled,
        setSymmetryEnabled
    } = useStudio();

    const [activeTab, setActiveTab] = useState<'props' | 'layers'>('layers');
    const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, layerId: string } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, layerId: id });
    };

    const renameLayer = (id: string, name: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, name } : l));
        setEditingLayerId(null);
    };

    const toggleVisibility = (id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
    };

    const toggleAlphaLock = (id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, alphaLock: !l.alphaLock } : l));
    };

    const toggleClipping = (id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, isClipping: !l.isClipping } : l));
    };

    return (
        <aside className="w-64 border-l border-[#2a2a2a] bg-[#0f0f0f] flex flex-col shrink-0 z-40 shadow-2xl transition-all">
            {/* Right Side Header (Navigator) */}
            <div className="p-3 border-b border-[#2a2a2a]">
                <header className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Navigator</span>
                    <span className="text-[8px] font-mono text-[#444]">v1.0</span>
                </header>
                <Navigator 
                    layers={layers} 
                    layerRefs={layerRefs} 
                    containerRef={{ current: typeof document !== 'undefined' ? document.getElementById('canvas-root') as HTMLDivElement : null }} 
                />
            </div>

            {/* Industrial Tabs */}
            <div className="flex bg-[#141414] border-b border-[#2a2a2a]">
                <button 
                    onClick={() => setActiveTab('props')}
                    className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'props' ? 'bg-[#0f0f0f] text-primary border-b-2 border-primary' : 'text-[#444] hover:text-[#888]'}`}
                >
                    Registry
                </button>
                <button 
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'layers' ? 'bg-[#0f0f0f] text-primary border-b-2 border-primary' : 'text-[#444] hover:text-[#888]'}`}
                >
                    Stack
                </button>
            </div>

            {/* Tab Secret Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f0f0f]">
                {activeTab === 'layers' ? (
                    <div className="flex flex-col">
                        <div className="p-3 bg-[#111] flex items-center justify-between border-b border-[#2a2a2a]">
                            <button onClick={addLayer} className="p-1 px-3 bg-primary/10 border border-primary/20 rounded text-primary text-[9px] font-bold uppercase tracking-tighter hover:bg-primary/20 transition-all flex items-center gap-2">
                                <PlusIcon className="w-3 h-3" />
                                New_Layer
                            </button>
                            <div className="flex gap-2">
                                <button className="p-1 text-[#444] hover:text-[#888]"><FolderIcon className="w-4 h-4" /></button>
                                <button className="p-1 text-[#444] hover:text-[#888]"><Square2StackIcon className="w-4 h-4" /></button>
                            </div>
                        </div>
                        
                        {[...layers].reverse().map((layer, index) => (
                            <div 
                                key={layer.id}
                                onClick={() => setActiveLayerId(layer.id)}
                                onContextMenu={(e) => handleContextMenu(e, layer.id)}
                                className={`group flex items-center gap-3 p-3 border-b border-[#1a1a1a] transition-all cursor-pointer ${activeLayerId === layer.id ? 'bg-[#1a1a1a] border-l-4 border-l-primary' : 'hover:bg-[#141414]'}`}
                            >
                                <div className="flex flex-col gap-1 items-center shrink-0">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id); }}
                                        className={`transition-colors ${layer.visible ? 'text-primary' : 'text-[#333] hover:text-[#555]'}`}
                                    >
                                        {layer.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                                    </button>
                                    {layer.id !== '1' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); toggleClipping(layer.id); }}
                                            className={`text-[8px] font-bold transition-all ${layer.isClipping ? 'text-primary border border-primary/50 rounded px-0.5' : 'text-[#333] hover:text-[#555]'}`}
                                            title="Clipping Mask"
                                        >
                                            CLIP
                                        </button>
                                    )}
                                </div>
                                
                                <div className="w-10 h-10 rounded border border-[#2a2a2a] bg-[#050505] overflow-hidden flex items-center justify-center shrink-0 relative">
                                    <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                                    {layer.alphaLock && (
                                        <div className="absolute top-0 right-0 p-0.5 bg-primary/80">
                                            <LockClosedIcon className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {editingLayerId === layer.id ? (
                                        <input 
                                            autoFocus
                                            className="bg-[#252525] text-white text-[10px] w-full px-1 border border-primary rounded"
                                            defaultValue={layer.name}
                                            onBlur={(e) => renameLayer(layer.id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') renameLayer(layer.id, e.currentTarget.value);
                                                if (e.key === 'Escape') setEditingLayerId(null);
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col">
                                            <span 
                                                className={`text-[10px] font-bold truncate ${activeLayerId === layer.id ? 'text-white' : 'text-[#666]'}`}
                                                onDoubleClick={(e) => { e.stopPropagation(); setEditingLayerId(layer.id); }}
                                            >
                                                {layer.name}
                                            </span>
                                            <span className="text-[8px] font-mono text-[#333]">Mode: Normal / {Math.round(layer.opacity * 100)}%</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleAlphaLock(layer.id); }}
                                        className={`p-1 transition-all ${layer.alphaLock ? 'text-primary' : 'text-[#444] hover:text-white'}`}
                                        title="Alpha Lock"
                                    >
                                        <LockClosedIcon className="w-3 h-3" />
                                    </button>
                                    {layer.id !== '1' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                            className="p-1 hover:text-red-500 text-[#444] transition-all"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                        <section className="space-y-4">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 flex justify-between">
                                <span>Brush_Dynamics</span>
                                <span className="text-[#333]">v8.0</span>
                            </label>
                            
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] font-mono"><span className="text-[#444]">FLOW</span><span className="text-primary">{Math.round(brushFlow * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={brushFlow} onChange={(e) => setBrushFlow(parseFloat(e.target.value))} className="w-full accent-primary h-1 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] font-mono"><span className="text-[#444]">HARDNESS</span><span className="text-primary">{Math.round(brushHardness * 100)}%</span></div>
                                    <input type="range" min="0" max="1" step="0.01" value={brushHardness} onChange={(e) => setBrushHardness(parseFloat(e.target.value))} className="w-full accent-primary h-1 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer" />
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-[8px] font-mono text-[#444]">MIRROR_SYMMETRY</span>
                                    <button 
                                        onClick={() => setSymmetryEnabled(!symmetryEnabled)}
                                        className={`px-3 py-1 rounded text-[8px] font-bold tracking-widest transition-all ${symmetryEnabled ? 'bg-primary text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-[#1a1a1a] text-[#444] hover:text-[#888]'}`}
                                    >
                                        {symmetryEnabled ? 'ENABLED' : 'DISABLED'}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 flex justify-between">
                                <span>Canvas_Registry</span>
                                <span className="text-[#333]">v7.4</span>
                            </label>
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-[8px] font-mono"><span className="text-[#444]">ROTATION</span><span className="text-primary">{rotation}°</span></div>
                                <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-[#1a1a1a] rounded-full appearance-none cursor-pointer" />
                            </div>
                        </section>

                        {selectionPath.length > 0 && (
                            <section className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 border-b border-red-500/20 pb-1 flex justify-between">
                                    <span>Selection_Mask</span>
                                    <button 
                                        onClick={() => setSelectionPath([])}
                                        className="hover:underline cursor-pointer text-red-500/80"
                                    >
                                        DESELECT
                                    </button>
                                </label>
                                <div className="flex items-center justify-between text-[7px] font-mono text-[#444]">
                                    <span>PATH_NODES</span>
                                    <span>{selectionPath.length}</span>
                                </div>
                                <div className="h-10 bg-[#0a0a0a] rounded border border-[#1a1a1a] flex items-center justify-center">
                                    <span className="text-[6px] text-[#222]">RENDERING_OVERLAY_ACTIVE</span>
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            {/* Context Menu Portal */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }} />
                    <div 
                        className="fixed z-[101] w-40 bg-[#1a1a1a] border border-[#333] shadow-2xl rounded-lg py-1 animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button 
                            onClick={() => { duplicateLayer(contextMenu.layerId); setContextMenu(null); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#888] hover:text-white hover:bg-[#252525] flex items-center gap-2 uppercase tracking-wide group"
                        >
                            <DocumentDuplicateIcon className="w-3 h-3 group-hover:text-primary" />
                            Duplicate_Layer
                        </button>
                        <button 
                            onClick={() => { mergeDown(contextMenu.layerId); setContextMenu(null); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#888] hover:text-white hover:bg-[#252525] flex items-center gap-2 uppercase tracking-wide group"
                        >
                            <Bars3CenterLeftIcon className="w-3 h-3 group-hover:text-primary rotate-180" />
                            Merge_Down
                        </button>
                        <div className="h-px bg-[#333] my-1mx-2" />
                        <button 
                            onClick={() => { setEditingLayerId(contextMenu.layerId); setContextMenu(null); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-[#888] hover:text-white hover:bg-[#252525] flex items-center gap-2 uppercase tracking-wide"
                        >
                            Rename_Layer
                        </button>
                        <button 
                            onClick={() => { deleteLayer(contextMenu.layerId); setContextMenu(null); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-red-500/60 hover:text-red-500 hover:bg-red-500/10 flex items-center gap-2 uppercase tracking-wide"
                        >
                            <TrashIcon className="w-3 h-3" />
                            Delete_Layer
                        </button>
                    </div>
                </>
            )}
            
            {/* Context Telemetry Footer */}
            <div className="h-6 border-t border-[#2a2a2a] bg-[#141414] px-3 flex items-center justify-between">
                <div className="text-[7px] font-mono text-[#333]">STACK_HEALTH: OPTIMAL</div>
                <div className="text-[7px] font-mono text-primary animate-pulse">LIVE</div>
            </div>
        </aside>
    );
}
