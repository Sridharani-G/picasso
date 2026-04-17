'use client';

import React, { useState } from 'react';
import { StudioProvider } from '@/context/StudioContext';
import Toolbar from '@/components/studio/Toolbar';
import SidebarLeft from '@/components/studio/SidebarLeft';
import SidebarRight from '@/components/studio/SidebarRight';
import CanvasEngine from '@/components/studio/CanvasEngine';
import AssetStore from '@/components/studio/AssetStore';
import StatusBar from '@/components/studio/StatusBar';
import { useStudio } from '@/context/StudioContext';

function StudioInner() {
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    
    // We can still use some local UI state here if needed, 
    // but most is in StudioProvider
    const { 
        handleExport, 
        installedAssets,
        handleInstallAsset
    } = useStudio();

    return (
        <div className="h-screen w-screen flex flex-col bg-[#050505] overflow-hidden text-white font-sans selection:bg-primary/30">
            {/* Top Toolbar */}
            <Toolbar 
                onOpenStore={() => setIsStoreOpen(true)} 
                onExport={handleExport} 
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Tool Strip */}
                <SidebarLeft />

                {/* Main Drawing Area */}
                <main className="flex-1 flex flex-col relative overflow-hidden bg-[#111]">
                    <CanvasEngine />
                    
                    {/* Industrial Footer HUD */}
                    <StatusBar />
                </main>

                {/* Right Registry & Stack */}
                <SidebarRight />
            </div>

            {/* Asset Store Modal */}
            <AssetStore 
                isOpen={isStoreOpen} 
                onClose={() => setIsStoreOpen(false)} 
                onInstall={handleInstallAsset}
                installedIds={installedAssets?.map((a: any) => a._id) || []}
            />
        </div>
    );
}

// Special wrapper to ensure useStudio works
export default function StudioPage() {
    return (
        <StudioProvider>
            <StudioInner />
        </StudioProvider>
    );
}
