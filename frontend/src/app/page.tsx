'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { apiFetch, getMediaUrl } from '@/utils/apiClient'
import ArtworkCard from '@/components/artwork/ArtworkCard'
import { StarIcon } from '@heroicons/react/24/outline'

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'trending', label: 'Trending' },
  { id: 'new', label: 'Newest' },
  { id: 'following', label: 'Following' },
]

export default function HomePage() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isMounted, setIsMounted] = useState(false)
  const [backendError, setBackendError] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    const fetchLandingData = async () => {
      try {
        setLoading(true)
        const response = await apiFetch(`/artworks?limit=40&category=${activeFilter === 'all' ? '' : activeFilter}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.artworks) {
            setArtworks(data.artworks)
            setBackendError(false)
          }
        } else {
          setBackendError(true)
        }
      } catch (error) {
        setBackendError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchLandingData()
  }, [activeFilter])

  // Slideshow Logic
  useEffect(() => {
    if (artworks.length > 0) {
      const interval = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % Math.min(artworks.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [artworks]);

  if (!isMounted) return null

  if (backendError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full mx-auto px-6 py-12 bg-white rounded-3xl border border-gray-100 shadow-xl text-center">
          <div className="text-6xl mb-6">🎨</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Gallery Connection Issue</h1>
          <p className="text-gray-500 mb-8 font-medium">Please refresh to check if the connection has been restored.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-[#ff4b6b] hover:bg-[#ff3b5b] text-white font-bold py-4 px-4 rounded-full transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const slideshowArtworks = artworks.slice(0, 5);

  return (
    <div className="w-full min-h-screen bg-[#fafafa] text-gray-900 font-sans overflow-x-hidden">

      {/* Hero Section */}
      <section className="bg-white pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-[800px] pt-8 pb-8">
            <span className="inline-block bg-[#f5e6ff] text-[#d447ff] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
              Human-curated art experiences
            </span>
            <h1 className="text-5xl md:text-[4rem] text-[#1f1f1f] leading-[1.05] tracking-tighter mb-6 font-playfair font-extrabold">
              Artist portfolios powered by real creators
            </h1>
            <p className="text-xl md:text-2xl text-[#555] mb-10 leading-relaxed font-pacifico">
              No AI generated noise. Every piece is crafted by artists, reviewed by artists, shared with care.
            </p>
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/explore" className="bg-[#ff335f] hover:bg-[#e62e55] text-white text-[13px] font-black uppercase tracking-widest px-8 py-3.5 rounded-full shadow-[0_10px_25px_rgb(255,51,95,0.3)] transition-all">
                  Explore Collections
              </Link>
              <Link href="/auth/register" className="border border-gray-100 bg-white hover:bg-gray-50 text-gray-900 text-[13px] font-black uppercase tracking-widest px-8 py-3.5 rounded-full shadow-[0_10px_20px_rgb(0,0,0,0.03)] transition-all">
                Join the Studio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Dark Filter Bar */}
      <nav className="sticky top-0 z-40 bg-[#2b2d31] py-5">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`text-[12px] font-bold tracking-wide transition-all relative py-1 ${
                  activeFilter === tab.id 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {activeFilter === tab.id && (
                    <div className="absolute -bottom-2.5 left-0 w-full h-[2px] bg-[#ff4b6b]"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-20 relative">

        <div className="mb-12">
           <div className="flex items-center gap-3 mb-2">
              <StarIcon className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#1f1f1f] italic font-serif">
                AUTHENTIC FEATURED WORKS
              </h2>
           </div>
           <p className="text-[15px] text-gray-500 font-medium ml-11">hand-picked by community mentors, no automation involved.</p>
        </div>

        {/* Masonry Grid */}
        <section className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-8 [column-fill:_balance] animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="break-inside-avoid mb-8 rounded-[2.5rem] bg-gray-100 animate-pulse h-[300px]" 
                   style={{ height: `${250 + (idx % 3) * 100}px` }} />
            ))
          ) : artworks.length > 0 ? (
            artworks.map((art: any) => (
              <div key={art._id || art.id} className="break-inside-avoid mb-8 hover:scale-[1.02] transition-all duration-500">
                <ArtworkCard
                  {...art}
                  id={art._id || art.id}
                  title={art.title}
                  imageUrl={art.mediaUrl || art.imageUrl}
                  mediaUrls={art.mediaUrls || []}
                  artist={{
                    name: art.artist?.name || art.artist?.username || 'Artist',
                    username: art.artist?.username || 'unknown',
                    avatar: art.artist?.avatar || art.artist?.profileImage
                  }}
                  onMore={() => {}}
                />
              </div>
            ))
          ) : (
             <div className="col-span-full py-32 text-center border-4 border-dashed border-gray-50 rounded-[4rem]">
                <div className="text-6xl mb-6 opacity-20">🎭</div>
                <h3 className="text-2xl font-black uppercase tracking-widest text-gray-200">The Canvas is Empty</h3>
             </div>
          )}
        </section>
      </main>
    </div>
  )
}
