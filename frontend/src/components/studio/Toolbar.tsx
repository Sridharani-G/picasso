'use client';

import React, { useRef } from 'react';
import { 
    ArrowUturnLeftIcon, 
    ArrowPathIcon, 
    ArrowDownTrayIcon, 
    TableCellsIcon,
    SquaresPlusIcon,
    Bars3CenterLeftIcon,
    Squares2X2Icon
} from '@heroicons/react/24/solid';
import { useStudio } from '@/context/StudioContext';

interface ToolbarProps {
    onOpenStore: () => void;
    onExport: () => void;
}

export default function Toolbar({ onOpenStore, onExport }: ToolbarProps) {
    const { 
        handleUndo, 
        handleRedo, 
        showGrid, 
        setShowGrid, 
        referenceImage, 
        setReferenceImage,
        historyIndex
    } = useStudio();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setReferenceImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <header className="h-12 border-b border-[#2a2a2a] bg-[#0f0f0f]/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-50">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-[#1a1a1a] p-0.5 rounded-lg border border-[#2a2a2a]">
                    <button onClick={onOpenStore} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#252525] rounded-md transition-all text-[10px] font-bold uppercase tracking-wider text-primary group">
                        <Squares2X2Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>Asset_Store</span>
                    </button>
                    <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
                    <button onClick={onExport} className="flex items-center gap-2 px-3 py-1.5 hover:bg-[#252525] rounded-md transition-all text-[10px] font-bold uppercase tracking-wider text-[#888] hover:text-white group">
                        <ArrowDownTrayIcon className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#2a2a2a]">
                <button 
                    onClick={handleUndo} 
                    className="p-1.5 hover:bg-[#252525] rounded-full transition-colors text-[#555] hover:text-primary"
                    disabled={historyIndex <= 0}
                    title="Undo (Ctrl+Z)"
                >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                </button>
                <button 
                    onClick={handleRedo} 
                    className="p-1.5 hover:bg-[#252525] rounded-full transition-colors text-[#555] hover:text-primary"
                    title="Redo (Ctrl+Y)"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
                <button 
                    onClick={() => setShowGrid(!showGrid)} 
                    className={`p-1.5 rounded-full transition-colors ${showGrid ? 'bg-primary/20 text-primary' : 'text-[#555] hover:text-[#888]'}`} 
                    title="Toggle Grid"
                >
                    <TableCellsIcon className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-[#2a2a2a] mx-1" />
                <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`p-1.5 rounded-full transition-colors ${referenceImage ? 'bg-primary/20 text-primary' : 'text-[#555] hover:text-primary'}`} 
                    title="Load Reference Image"
                >
                    <SquaresPlusIcon className="w-4 h-4" />
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleReferenceUpload} 
                    />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-[10px] font-mono text-[#444] uppercase tracking-widest hidden md:block">
                    Elite_Artisan_Engine_v7.0
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#0f0f0f] flex items-center justify-center text-[10px] font-bold text-white">
                        AP
                    </div>
                </div>
            </div>
        </header>
    );
}
