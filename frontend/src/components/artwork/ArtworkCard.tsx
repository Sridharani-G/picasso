'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getMediaUrl } from '@/utils/apiClient';
import {
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

interface ArtworkCardProps {
  id: string;
  title: string;
  artist: {
    username: string;
    avatar?: string;
  };
  imageUrl: string;
}

export default function ArtworkCard({
  id, title, artist, imageUrl
}: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreBtnRef.current && !moreBtnRef.current.contains(event.target as Node) &&
        menuRef.current && !menuRef.current.contains(event.target as Node)
      ) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [moreOpen]);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (moreBtnRef.current) {
      const rect = moreBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX - 160 });
      setMoreOpen(!moreOpen);
    }
  };

  return (
    <div
      className="group cursor-zoom-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/artwork/${id}`)}
    >
      {/* Artwork Image Container */}
      <div className="relative rounded-[2rem] overflow-hidden bg-gray-100 mb-2">
        <Image
          src={getMediaUrl(imageUrl) as string}
          alt={title}
          width={500}
          height={750}
          className="w-full h-auto object-cover transition-all duration-300 group-hover:brightness-90"
          unoptimized
        />

        {/* Floating Save Button (Standard Pinterest) */}
        {isHovered && (
           <div className="absolute top-4 right-4 animate-in fade-in duration-200">
              <button 
                onClick={(e) => { e.stopPropagation(); }}
                className="bg-[#e60023] hover:bg-[#ad081b] text-white px-5 py-3 rounded-full text-sm font-bold shadow-md active:scale-95 transition-all"
              >
                Save
              </button>
           </div>
        )}

        {/* More Options Ellipsis */}
        {isHovered && (
           <div className="absolute bottom-4 right-4 animate-in fade-in duration-200">
              <button 
                ref={moreBtnRef}
                onClick={handleMoreClick}
                className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white rounded-full text-gray-900 shadow-md transition-all"
              >
                 <EllipsisHorizontalIcon className="w-5 h-5 font-bold" />
              </button>
           </div>
        )}
      </div>

      {/* Info Below Image (Pinterest Exact) */}
      <div className="px-2 flex items-center justify-between">
         <div className="flex flex-col">
            <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{title}</h3>
            <p className="text-[10px] text-gray-500 font-medium tracking-tight">@{artist.username}</p>
         </div>
      </div>

      {/* Portal for Menu */}
      {moreOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'absolute', top: menuPos.top, left: menuPos.left, width: '12rem' }}
          className="bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] py-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full text-left px-5 py-3 text-xs font-bold text-gray-900 hover:bg-gray-50 transition-all">Download Image</button>
          <button className="w-full text-left px-5 py-3 text-xs font-bold text-gray-900 hover:bg-gray-50 transition-all">Hide Pin</button>
          <button className="w-full text-left px-5 py-3 text-xs font-bold text-black border-t border-gray-50 mt-1">Report</button>
        </div>,
        document.body
      )}
    </div>
  );
}
