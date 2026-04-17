'use client';

import { useEffect, useRef } from 'react';

interface NavigatorProps {
    layers: { id: string, visible: boolean, opacity: number, blendingMode: string }[];
    layerRefs: React.MutableRefObject<Record<string, HTMLCanvasElement | null>>;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Navigator({ layers, layerRefs, containerRef }: NavigatorProps) {
    const navCanvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const updateNavigator = () => {
            const navCanvas = navCanvasRef.current;
            const container = containerRef.current;
            if (!navCanvas || !container) return;

            const ctx = navCanvas.getContext('2d');
            if (!ctx) return;

            // Clear navigator
            ctx.clearRect(0, 0, navCanvas.width, navCanvas.height);

            // Draw all visible layers scaled down
            layers.forEach(layer => {
                const sourceCanvas = layerRefs.current[layer.id];
                if (sourceCanvas && layer.visible) {
                    ctx.globalAlpha = layer.opacity;
                    ctx.globalCompositeOperation = layer.blendingMode as any;
                    ctx.drawImage(sourceCanvas, 0, 0, navCanvas.width, navCanvas.height);
                }
            });
        };

        const interval = setInterval(updateNavigator, 500); // 2FPS for performance
        return () => clearInterval(interval);
    }, [layers, layerRefs, containerRef]);

    return (
        <div className="w-full aspect-video bg-[#0f0f0f] border border-[#2a2a2a] relative overflow-hidden group">
            <canvas 
                ref={navCanvasRef} 
                className="w-full h-full object-contain image-render-pixelated"
                width={200}
                height={120}
            />
            {/* Viewport Frame (Simulated) */}
            <div className="absolute inset-0 border-2 border-primary/40 pointer-events-none group-hover:border-primary transition-colors" />
            <div className="absolute inset-x-0 bottom-0 py-0.5 bg-black/60 text-[7px] text-center text-[#555] font-mono uppercase tracking-tighter">
                NAVIGATOR_ENGINE_v1
            </div>
        </div>
    );
}
