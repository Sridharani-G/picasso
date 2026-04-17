'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/utils/apiClient';
import { siteConfig } from '@/config/site';

export default function RightSidebar() {
    const [trendingTags, setTrendingTags] = useState<{ name: string; count: number }[]>([]);
    const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch trending categories
                const categoriesRes = await apiFetch('/artworks/categories');
                if (categoriesRes.ok) {
                    const data = await categoriesRes.json();
                    setTrendingTags(data.categories.slice(0, 5) || []);
                }

                // Fetch suggested artists from leaderboard
                const leaderboardRes = await apiFetch('/leaderboards/weekly');
                if (leaderboardRes.ok) {
                    const data = await leaderboardRes.json();
                    setSuggestedUsers(data.leaderboard.topArtists.slice(0, 3) || []);
                }
            } catch (err) {
                console.error('Failed to fetch sidebar data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="hidden lg:block w-[350px] h-screen sticky top-0 py-6 px-6 overflow-y-auto custom-scrollbar border-l border-border bg-background text-foreground">

            {/* Search Bar */}
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder={`Search ${siteConfig.name}...`}
                    className="w-full bg-muted text-foreground rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-primary border border-border focus:border-border transition-all placeholder:text-foreground/20 text-sm chaos-skew"
                />
            </div>

            {/* Trending Section */}
            <div className="bg-card rounded-3xl p-6 mb-6 border border-border shadow-2xl shadow-foreground/5 chaos-rotate-sm">
                <h2 className="text-xl font-bold mb-6 font-serif uppercase italic chaos-text">Chaotic <span className="text-foreground/60">Signals</span></h2>
                <div className="space-y-6">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse space-y-2">
                                <div className="h-2 w-12 bg-muted rounded"></div>
                                <div className="h-4 w-24 bg-muted rounded"></div>
                                <div className="h-2 w-16 bg-muted rounded"></div>
                            </div>
                        ))
                    ) : trendingTags.length > 0 ? (
                        trendingTags.map((tag, i) => (
                            <Link key={i} href={`/explore?category=${tag.name}`} className="block group cursor-pointer">
                                <p className="text-[9px] uppercase font-black tracking-widest text-foreground/60 mb-1">Trend</p>
                                <p className="text-sm font-bold text-foreground group-hover:underline transition-colors">#{tag.name}</p>
                                <p className="text-[10px] text-foreground/40 mt-1 uppercase font-black">{tag.count} Artworks</p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-[10px] text-foreground/20 uppercase font-black">No signals detected</p>
                    )}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                    <Link href="/explore" className="text-foreground/40 font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-colors">
                        See More
                    </Link>
                </div>
            </div>


            {/* Footer Links */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-[9px] uppercase font-black tracking-widest text-foreground/60 px-4">
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/help" className="hover:text-foreground transition-colors">Index</Link>
                <span>© {new Date().getFullYear()} {siteConfig.name}</span>
            </div>
        </div>
    );
}
