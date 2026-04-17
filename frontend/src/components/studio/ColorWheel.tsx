'use client';

import { useEffect, useRef, useState } from 'react';

interface ColorWheelProps {
    color: string;
    onChange: (color: string) => void;
    size?: number;
}

export default function ColorWheel({ color, onChange, size = 180 }: ColorWheelProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDragging, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const cx = size / 2;
        const cy = size / 2;
        const radius = size / 2 - 10;

        // Draw Hue Circle
        for (let angle = 0; angle < 360; angle++) {
            const startAngle = (angle - 2) * Math.PI / 180;
            const endAngle = (angle) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
            ctx.fill();
        }

        // Add a "Hole" in the center to make it a ring
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx, cy, radius - 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Draw Saturation/Value Square in the center (Simplified for now as a gradient box)
        // In a real pro app, this would be a triangle or square
    }, [size]);

    const handlePointer = (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const angle = Math.atan2(y, x) * 180 / Math.PI;
        const hue = (angle + 360) % 360;
        
        onChange(`hsl(${Math.round(hue)}, 100%, 50%)`);
    };

    return (
        <div className="relative flex items-center justify-center bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 shadow-inner">
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                onPointerDown={(e) => { setIsDrawing(true); handlePointer(e); }}
                onPointerMove={(e) => { if (isDragging) handlePointer(e); }}
                onPointerUp={() => setIsDrawing(false)}
                className="cursor-crosshair rounded-full border border-[#2a2a2a]"
            />
            {/* Center Color Preview */}
            <div 
                className="absolute w-12 h-12 rounded-full border-4 border-[#141414] shadow-lg"
                style={{ backgroundColor: color }}
            />
        </div>
    );
}
