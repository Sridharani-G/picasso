'use client';

import React, { useState } from 'react';
import { 
    PaintBrushIcon, 
    SwatchIcon, 
    BeakerIcon,
    Bars3CenterLeftIcon,
    RectangleGroupIcon,
    SparklesIcon,
    CursorArrowRaysIcon
} from '@heroicons/react/24/solid';
import { useStudio } from '@/context/StudioContext';

export default function SidebarLeft() {
    const { 
        activeTool, 
        setActiveTool, 
        color, 
        setColor,
        setBrushSize,
        setBrushOpacity,
        setStabilization,
        installedAssets,
        leftSidebarTab,
        setLeftSidebarTab
    } = useStudio();

    const tools = [
        { id: 'brush', icon: PaintBrushIcon, label: 'Brush' },
        { id: 'eraser', icon: SwatchIcon, label: 'Eraser' },
        { id: 'blender', icon: BeakerIcon, label: 'Blender' },
        { id: 'fill', icon: Bars3CenterLeftIcon, label: 'Fill' },
        { id: 'select', icon: RectangleGroupIcon, label: 'Select' },
        { id: 'move', icon: CursorArrowRaysIcon, label: 'Move' },
    ];

    // Filter assets based on active tool
    const filteredAssets = (installedAssets || []).filter(asset => {
        if (activeTool === 'brush') return asset.category === 'Ink' || asset.category === 'Paint';
        if (activeTool === 'blender') return asset.category === 'Blender';
        if (activeTool === 'eraser') return asset.category === 'Eraser';
        return false;
    });

    const selectSubTool = (asset: any) => {
        if (asset.config) {
            if (asset.config.size) setBrushSize(asset.config.size);
            if (asset.config.opacity) setBrushOpacity(asset.config.opacity);
            if (asset.config.stabilization) setStabilization(asset.config.stabilization);
        }
    };

    return (
        <div className="flex h-full shrink-0 z-40">
            {/* Main Tool Strip */}
            <aside className="w-14 border-r border-[#2a2a2a] bg-[#0f0f0f] flex flex-col items-center py-4 gap-4 shrink-0 shadow-2xl transition-all">
                <div className="flex flex-col gap-2 w-full px-2">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`group relative p-2.5 rounded-xl transition-all duration-300 ${
                                activeTool === tool.id 
                                    ? 'bg-primary/20 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                                    : 'text-[#444] hover:text-[#888] hover:bg-[#1a1a1a]'
                            }`}
                            title={tool.label}
                        >
                            <tool.icon className={`w-5 h-5 transition-transform duration-300 ${activeTool === tool.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {activeTool === tool.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            )}
                            <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2 py-1 bg-[#1a1a1a] border border-[#333] text-[8px] font-bold text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                {tool.label.toUpperCase()}
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-auto w-full px-2 space-y-4">
                    <div className="relative group">
                        <input 
                            type="color" 
                            value={color} 
                            onChange={(e) => setColor(e.target.value)}
                            className="w-10 h-10 rounded-full border-2 border-[#2a2a2a] bg-transparent cursor-pointer overflow-hidden appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none shadow-inner"
                        />
                    </div>
                </div>
            </aside>

            {/* Sub-Tool Palette (CSP Style) */}
            {(activeTool === 'brush' || activeTool === 'blender' || activeTool === 'eraser') && (
                <aside className="w-48 border-r border-[#2a2a2a] bg-[#141414] flex flex-col transition-all duration-300 animate-in slide-in-from-left-2">
                    <div className="p-3 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                            <SparklesIcon className="w-3 h-3 text-primary animate-pulse" />
                            {activeTool}_Tools
                        </label>
                        <div className="text-[7px] font-mono text-[#444]">v7.1</div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                        {filteredAssets.length > 0 ? (
                            <div className="space-y-1">
                                {filteredAssets.map((asset) => (
                                    <button 
                                        key={asset._id}
                                        onClick={() => selectSubTool(asset)}
                                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#252525] transition-all group border border-transparent hover:border-[#333]"
                                    >
                                        <div className="w-8 h-8 bg-[#0a0a0a] rounded border border-[#222] flex items-center justify-center shrink-0">
                                            <div className="text-[10px] font-bold text-primary/40 group-hover:text-primary transition-colors">
                                                {asset.name.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start min-w-0">
                                            <span className="text-[10px] font-bold text-[#888] group-hover:text-white truncate w-full transition-colors font-sans uppercase tracking-tighter">
                                                {asset.name}
                                            </span>
                                            <span className="text-[7px] font-mono text-[#444] uppercase">{asset.category} / {asset.type}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-3 opacity-30">
                                <div className="p-3 rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
                                    <BeakerIcon className="w-6 h-6 text-[#555]" />
                                </div>
                                <div className="text-[9px] font-bold uppercase tracking-widest text-[#555]">
                                    No_SubTools_Installed
                                </div>
                                <button className="text-[8px] text-primary hover:underline uppercase tracking-tighter">Open_Asset_Store</button>
                            </div>
                        )}
                    </div>
                </aside>
            )}
        </div>
    );
}
