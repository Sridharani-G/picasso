'use client';

import React, { useEffect, useState } from 'react';
import { useStudio } from '@/context/StudioContext';

export default function StatusBar() {
    const { isDrawing, activeLayerId, layers } = useStudio();
    const [fps, setFps] = useState(60);
    const activeLayer = layers.find(l => l.id === activeLayerId);

    // Simulated telemetry for industrial feel
    useEffect(() => {
        const interval = setInterval(() => {
            setFps(58 + Math.random() * 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="h-6 border-t border-[#2a2a2a] bg-[#0f0f0f] flex items-center justify-between px-6 shrink-0 z-50 text-[7px] font-mono text-[#333] uppercase tracking-widest select-none cursor-default">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-[#555]">ENGINE_CORE:</span>
                    <span className="text-primary font-bold">ELITE_ARTISAN_v7.3</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#555]">LAYER_TARGET:</span>
                    <span className="text-white bg-[#1a1a1a] px-1 rounded truncate max-w-[80px]">
                        {activeLayer?.name || 'NONE'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#555]">STATUS:</span>
                    <span className={isDrawing ? 'text-primary' : 'text-green-500'}>
                        {isDrawing ? 'RENDERING_PIXELS' : 'OPERATIONAL_IDLE'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-[#555]">SYNC:</span>
                    <span className="text-primary">0.02ms</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[#555]">FRAMERATE:</span>
                    <span className="text-white">{fps.toFixed(1)} FPS</span>
                </div>
                <div className="flex items-center gap-2 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-green-500 font-bold group-hover:block">LIVE</span>
                </div>
            </div>
        </footer>
    );
}
