'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiClient';
import { Artwork } from '@/types';
import InteractiveArtworkCard from '@/components/artwork/InteractiveArtworkCard';
import PageShell from '@/components/ui/PageShell';

export default function ShopPage() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<string>('');
    const [style, setStyle] = useState<string>('');
    const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
    const [styles, setStyles] = useState<{ name: string; count: number }[]>([]);

    useEffect(() => {
        fetchMetadata();
        fetchShopArtworks();
    }, [category, style]);

    const fetchMetadata = () => {
        fetchCategories();
        fetchStyles();
    };

    const fetchCategories = async () => {
        let resolved = false;
        let lastError: string | null = null;
        const apiUrl = getApiUrl();
        const candidates = [
            `${apiUrl}/artworks/categories`,
            '/api/artworks/categories',
            `${window.location.origin}/api/artworks/categories`,
            `${process.env.NEXT_PUBLIC_API_URL}/api/artworks/categories`
        ];

        for (const endpoint of candidates) {
            try {
                const resp = await fetch(endpoint);
                if (!resp) {
                    lastError = `No response from ${endpoint}`;
                    continue;
                }
                if (!resp.ok) {
                    lastError = `Request to ${endpoint} failed with status ${resp.status}`;
                    console.warn(lastError);
                    continue;
                }

                const data = await resp.json();
                setCategories(data.categories || []);
                resolved = true;
                break;
            } catch (err: any) {
                lastError = err?.message || String(err);
                console.warn(`Fetch to ${endpoint} threw:`, err);
                continue;
            }
        }

        if (!resolved) {
            console.warn('Failed to fetch categories:', lastError || 'unknown');
            setCategories([]);
        }
    };

    const fetchStyles = async () => {
        let resolved = false;
        let lastError: string | null = null;
        const apiUrl = getApiUrl();
        const candidates = [
            `${apiUrl}/artworks/styles`,
            '/api/artworks/styles',
            `${window.location.origin}/api/artworks/styles`,
            `${process.env.NEXT_PUBLIC_API_URL}/api/artworks/styles`
        ];

        for (const endpoint of candidates) {
            try {
                const resp = await fetch(endpoint);
                if (!resp || !resp.ok) continue;

                const data = await resp.json();
                setStyles(data.styles || []);
                resolved = true;
                break;
            } catch (err) {
                continue;
            }
        }
    };

    const fetchShopArtworks = async () => {
        setLoading(true);
        try {
            const apiUrl = getApiUrl();
            const base = `${apiUrl}/artworks?isForSale=true&limit=24`;
            const filterStr = `${category ? `&category=${encodeURIComponent(category)}` : ''}${style ? `&style=${encodeURIComponent(style)}` : ''}`;
            
            const candidates = [
                `${base}${filterStr}`,
                `/api/artworks?isForSale=true&limit=24${filterStr}`,
                `${window.location.origin}/api/artworks?isForSale=true&limit=24${filterStr}`,
                `${process.env.NEXT_PUBLIC_API_URL}/api/artworks?isForSale=true&limit=24${filterStr}`
            ];

            let resolved = false;
            let lastError: string | null = null;
            for (const url of candidates) {
                try {
                    const resp = await fetch(url);
                    if (!resp) {
                        lastError = `No response from ${url}`;
                        continue;
                    }
                    if (!resp.ok) {
                        lastError = `Request to ${url} failed with status ${resp.status}`;
                        console.warn(lastError);
                        continue;
                    }

                    const data = await resp.json();
                    setArtworks(data.artworks || []);
                    resolved = true;
                    break;
                } catch (err: any) {
                    lastError = err?.message || String(err);
                    console.warn(`Fetch to ${url} threw:`, err);
                    continue;
                }
            }

            if (!resolved) {
                console.warn('Failed to fetch shop artworks:', lastError || 'unknown');
                setArtworks([]);
            }
        } catch (error) {
            console.error('Error fetching shop artworks:', error);
            setArtworks([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell title="The Exchange" subtitle="Directly support creators with secure commerce and bidding.">
            <div className="w-full text-foreground">
                <div className="border rounded-3xl p-6 bg-card border-border">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-serif font-black uppercase tracking-[0.2em]">The Exchange</h2>
                        <p className="text-foreground/60 mt-2 max-w-3xl mx-auto text-sm">Directly support your favorite creators with unique artifacts and secure peer-to-peer settlement.</p>
                    </div>

                    {/* Professional Filter Menu */}
                    <div className="mb-10 space-y-6">
                        {/* Genre Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Filter by Genre</h3>
                                {(category || style) && (
                                    <button 
                                        onClick={() => { setCategory(''); setStyle(''); }}
                                        className="text-[9px] font-bold text-primary hover:underline transition-all uppercase tracking-widest"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setCategory('')}
                                    className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${category === ''
                                        ? 'bg-black text-white shadow-xl scale-105'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    }`}
                                >
                                    All Genres
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setCategory(cat.name)}
                                        className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${category === cat.name
                                            ? 'bg-black text-white shadow-xl scale-105'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Style Section */}
                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 px-2">Filter by Style</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setStyle('')}
                                    className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${style === ''
                                        ? 'bg-[#e60023] text-white shadow-xl scale-105'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                    }`}
                                >
                                    All Styles
                                </button>
                                {styles.map((st) => (
                                    <button
                                        key={st.name}
                                        onClick={() => setStyle(st.name)}
                                        className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${style === st.name
                                            ? 'bg-[#e60023] text-white shadow-xl scale-105'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
                                        }`}
                                    >
                                        {st.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : artworks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {artworks.map((artwork, index) => (
                                <InteractiveArtworkCard key={artwork.id || (artwork as any)._id || index} artwork={artwork} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 rounded-2xl border border-dashed border-border bg-muted">
                            <p className="text-sm text-foreground/40">No items for sale yet.</p>
                        </div>
                    )}


                </div>
            </div>
        </PageShell>
    );
}
