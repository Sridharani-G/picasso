'use client';

import { useState, useEffect } from 'react';
import { getApiUrl, apiFetch } from '@/utils/apiClient';
import InteractiveArtworkCard from '@/components/artwork/InteractiveArtworkCard';
import { Artwork } from '@/types';
import { SparklesIcon } from '@heroicons/react/24/outline';
import PageShell from '@/components/ui/PageShell';

export default function ExplorePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch('/artworks/categories');
        if (!response.ok) {
          console.error('Categories fetch failed:', response.status);
          return;
        }

        const data = await response.json();
        if (data && data.success) {
          setCategories(['All', 'Shop', ...(data.categories || []).map((c: any) => c.name)]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchArtworks = async () => {
      try {
        const response = await apiFetch('/artworks?limit=20');
        if (response.ok) {
          const data = await response.json();
          const mappedArtworks = (data.artworks || []).map((art: any) => ({
            ...art,
            artist: {
              id: art.artist?._id || art.artist?.id || '',
              name: art.artist?.username || 'Unknown Artist',
              username: art.artist?.username || 'unknown',
              avatar: art.artist?.profileImage
            }
          }))
          setArtworks(mappedArtworks);
        } else {
          setArtworks([]);
        }
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    fetchArtworks();
  }, []);

  const filteredArtworks = activeFilter === 'All'
    ? artworks
    : artworks.filter(art => art.category === activeFilter || (activeFilter === 'Traditional' && art.category === 'Traditional Art'));

  return (
    <PageShell title="Explore Archive" subtitle="Discover new works from creators around the world">
      <div className="w-full text-foreground font-sans pb-20 md:pb-0">

        {/* Feed Header */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-6 py-5 mb-8 hidden md:block">
          <h1 className="text-2xl font-bold font-serif tracking-tight uppercase italic">Explore <span className="text-foreground/20 italic capitalize font-normal tracking-normal">Archive</span></h1>
        </div>

        <div className="px-6">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {categories.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeFilter === filter
                  ? 'bg-primary text-primary-foreground shadow-2xl scale-105'
                  : 'bg-muted text-foreground/40 border border-border hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <select className="w-full sm:w-auto appearance-none bg-background border border-border text-foreground rounded-xl pl-4 pr-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-all shadow-xl shadow-foreground/5">
              <option>Trending Now</option>
              <option>Recently Unveiled</option>
              <option>Price: Floor</option>
              <option>Price: Ceiling</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground/20">
              <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredArtworks.length > 0 ? (
              filteredArtworks.map((artwork, index) => (
                <div key={artwork.id || (artwork as any)._id || index} className="fade-in">
                  <InteractiveArtworkCard artwork={artwork} />
                </div>
              ))
            ) : (
              <div className="text-center py-40 bg-card rounded-[3rem] border border-dashed border-border shadow-2xl shadow-foreground/5">
                <p className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.3em] italic">No artifacts found in this sector</p>
              </div>
            )}
          </div>
        )}

        {/* Load More Button */}
        {filteredArtworks.length > 0 && (
          <div className="mt-16 mb-24 text-center">
            <button className="bg-primary text-primary-foreground border border-border px-12 py-4 text-[10px] font-black rounded-xl hover:scale-105 transition-all uppercase tracking-[0.3em] active:scale-95 shadow-2xl">
              Sync More Data
            </button>
          </div>
        )}
      </div>
    </div>
  </PageShell>
  );
}
