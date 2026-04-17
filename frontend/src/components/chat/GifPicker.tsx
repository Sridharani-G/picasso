'use client';

import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GifPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const FALLBACK_GIFS = [
  { id: 'f1', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndTVueHBybmp4bmV4eHV4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfZ2lmc19zZWFyY2gmY3Q9Zw/3o7TKVUn7iM8FMEU24/giphy.gif' },
  { id: 'f2', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndTVueHBybmp4bmV4eHV4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfZ2lmc19zZWFyY2gmY3Q9Zw/l0HlIDZ0u58872j7S/giphy.gif' },
  { id: 'f3', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJndTVueHBybmp4bmV4eHV4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfZ2lmc19zZWFyY2gmY3Q9Zw/3o7TKMGpxP5D1C3mZW/giphy.gif' },
  { id: 'f4', url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjIxNHJndTVueHBybmp4bmV4eHV4eHh4eHh4eHh4eHh4eHh4eHh4eHgmZXA9djFfZ2lmc19zZWFyY2gmY3Q9Zw/u26m3tM7qN6vW/giphy.gif' }
];

export default function GifPicker({ onSelect, onClose }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'QopugoDqU4GhGnG4Rvz4ZlBeqtKUstnN'; 

  const fetchGifs = async (searchQuery: string = '') => {
    setLoading(true);
    setUseFallback(false);
    try {
      const endpoint = searchQuery 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=12&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&limit=12&rating=g`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        setGifs(data.data);
      } else {
        setUseFallback(true);
      }
    } catch (error) {
      console.error('Giphy API Error, using fallbacks:', error);
      setUseFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) fetchGifs(query);
      else fetchGifs();
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const displayGifs = useFallback ? FALLBACK_GIFS.map((f: any) => ({ 
    id: f.id, 
    images: { fixed_height: { url: f.url } },
    title: 'Fallback GIF' 
  })) : gifs;

  return (
    <div className="absolute bottom-[100%] left-0 mb-4 w-[320px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">Choose a GIF</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-full transition-colors">
          <XMarkIcon className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="p-3">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Giphy..."
            className="w-full bg-[#F0F4F9] border-none rounded-full pl-9 pr-4 py-2 text-[12px] font-medium outline-none focus:ring-1 focus:ring-slate-200 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 min-h-[250px] max-h-[350px] custom-scrollbar">
        {loading && gifs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-widest">
            Fetching...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {displayGifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.images.fixed_height.url)}
                className="group relative aspect-video rounded-lg overflow-hidden bg-slate-100 hover:ring-2 hover:ring-slate-800 transition-all"
              >
                <img 
                  src={gif.images.fixed_height.url} 
                  alt={gif.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
