'use client';

import { useState, useEffect } from 'react';
import { getApiUrl, getMediaUrl } from '@/utils/apiClient';
import { 
    XMarkIcon, 
    MagnifyingGlassIcon, 
    ArrowDownCircleIcon, 
    CheckCircleIcon,
    StarIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';

interface Asset {
    _id: string;
    name: string;
    type: string;
    category: string;
    config: any;
    thumbnail: string;
    isFree: boolean;
    price: number;
    downloads: number;
    tags: string[];
}

interface AssetStoreProps {
    isOpen: boolean;
    onClose: () => void;
    onInstall: (asset: Asset) => void;
    installedIds: string[];
}

export default function AssetStore({ isOpen, onClose, onInstall, installedIds }: AssetStoreProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchAssets();
        }
    }, [isOpen]);

    const fetchAssets = async () => {
        try {
            const apiUrl = getApiUrl();
            const res = await fetch(`${apiUrl}/assets`);
            const data = await res.json();
            setAssets(data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch assets:', err);
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || 
                             a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesFilter = filter === 'all' || a.type === filter;
        return matchesSearch && matchesFilter;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-6xl h-full max-h-[90vh] bg-[#141414] border border-[#2a2a2a] shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Store Header */}
                <header className="h-16 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center space-x-4">
                        <SparklesIcon className="w-5 h-5 text-primary" />
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.4em] text-white">Picasso_Asset_Hub</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#252525] rounded-lg transition-colors text-[#666] hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                {/* Search & Filters */}
                <div className="p-8 border-b border-[#2a2a2a] bg-[#1a1a1a]/50 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="relative flex-1 group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search high-fidelity brushes, textures, materials..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg pl-12 pr-4 py-3 text-[11px] uppercase tracking-wider focus:border-primary/50 focus:ring-0 transition-all placeholder:text-[#333]"
                        />
                    </div>
                    <div className="flex bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-1">
                        {['all', 'brush', 'texture'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-[#555] hover:text-[#888]'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Asset Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f0f0f]">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAssets.map(asset => {
                                const isInstalled = installedIds.includes(asset._id);
                                return (
                                    <div 
                                        key={asset._id}
                                        className="group bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-primary/40 transition-all flex flex-col"
                                    >
                                        <div className="aspect-video relative overflow-hidden bg-[#1a1a1a]">
                                            <img 
                                                src={getMediaUrl(asset.thumbnail) as string} 
                                                alt={asset.name}
                                                className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-100"
                                            />
                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                <span className="px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[8px] font-bold uppercase tracking-tighter text-primary border border-primary/20">
                                                    {asset.isFree ? 'FREE' : `$${asset.price}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[8px] font-bold text-primary tracking-[0.2em] uppercase">{asset.category}</span>
                                                <div className="flex items-center gap-1">
                                                    <StarIcon className="w-3 h-3 text-yellow-500/50" />
                                                    <span className="text-[9px] font-mono text-[#444]">{(asset.downloads / 10).toFixed(1)}k</span>
                                                </div>
                                            </div>
                                            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-4">{asset.name}</h3>
                                            
                                            <div className="mt-auto flex flex-col gap-3">
                                                <button
                                                    onClick={() => !isInstalled && onInstall(asset)}
                                                    disabled={isInstalled}
                                                    className={`w-full py-2.5 rounded text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isInstalled ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white'}`}
                                                >
                                                    {isInstalled ? (
                                                        <>
                                                            <CheckCircleIcon className="w-4 h-4" />
                                                            <span>Installed</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowDownCircleIcon className="w-4 h-4" />
                                                            <span>Port Asset</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Store Footer */}
                <footer className="h-10 border-t border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between px-8 shrink-0 text-[8px] font-mono text-[#444] uppercase tracking-widest">
                    <div className="flex items-center gap-6">
                        <span>Synced_Engine: Picasso_Core_v2</span>
                        <span>Region: Global_Hub_1</span>
                    </div>
                    <div>Authorized by Picasso_Industrial_Protocol</div>
                </footer>
            </div>
        </div>
    );
}
