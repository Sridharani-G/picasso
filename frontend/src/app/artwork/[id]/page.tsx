'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl, apiFetch } from '@/utils/apiClient';
import ArtworkCard from '@/components/artwork/ArtworkCard';
import { 
  HeartIcon, 
  ShareIcon, 
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  ChatBubbleOvalLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid, 
} from '@heroicons/react/24/solid';

export default function ArtworkDetailPage() {
  const params = useParams() as { id?: string | string[] };
  const id = params.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
  const router = useRouter();
  const [artwork, setArtwork] = useState<any>(null);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [displayMedia, setDisplayMedia] = useState<string[]>([]);

  useEffect(() => {
    const fetchArtworkData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/artworks/${id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setArtwork(data.artwork);
            setIsLiked(data.artwork.isLiked);
            setIsSaved(data.artwork.isSaved);
            setLikesCount(data.artwork.likesCount);
            
            // Collect all media items
            const mediaList = data.artwork.mediaUrls && data.artwork.mediaUrls.length > 0
              ? data.artwork.mediaUrls
              : [data.artwork.mediaUrl];
            // Ensure the primary mediaUrl is at the start if it exists separately
            setDisplayMedia(mediaList);
            
            // Fetch Related Artworks for the sidebar and bottom grid
            const relatedResp = await apiFetch(`/artworks?category=${data.artwork.category}&limit=20`);
            if (relatedResp.ok) {
              const relatedData = await relatedResp.json();
              let related = relatedData.artworks?.filter((a: any) => (a._id || a.id) !== id) || [];
              
              // Fallback: If no related items by category, fetch latest general artworks
              if (related.length === 0) {
                const latestResp = await apiFetch(`/artworks?limit=20`);
                if (latestResp.ok) {
                   const latestData = await latestResp.json();
                   related = latestData.artworks?.filter((a: any) => (a._id || a.id) !== id) || [];
                }
              }
              setRelatedArtworks(related);
            }
          } else {
            setError(data.message || 'Artifact not found');
          }
        } else {
          setError('Failed to fetch artifact');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArtworkData();
  }, [id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiFetch(`/artworks/${id}/like`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikesCount(data.likes);
      }
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiFetch(`/artworks/${id}/save`, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
      }
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#e60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Piece not found</h2>
        <button onClick={() => router.push('/')} className="px-8 py-3 bg-[#e60023] text-white rounded-full font-bold">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20">


      <main className="max-w-screen-2xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Artwork Card (Moved to Left Side) */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] shadow-[0_15px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
           <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-white/50">
              <div className="flex items-center gap-1">
                 <button onClick={handleLike} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
                    {isLiked ? <HeartIconSolid className="w-5 h-5 text-[#e60023]" /> : <HeartIcon className="w-5 h-5" />}
                 </button>
                 <span className="text-[10px] font-bold text-gray-900 -ml-1 pr-2">{likesCount}</span>
                 <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
                    <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                 </button>
                 <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
                    <ShareIcon className="w-5 h-5" />
                 </button>
                 <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                 </button>
              </div>
              <div className="flex items-center gap-6 pr-2">
                 <span className="text-xs font-bold text-gray-900 hover:underline cursor-pointer">Profile</span>
                 <button 
                   onClick={handleSave}
                   className={`px-6 py-2.5 rounded-full font-bold text-base transition-all shadow-md active:scale-95 ${isSaved ? 'bg-black text-white' : 'bg-[#e60023] text-white hover:bg-[#ad081b]'}`}
                 >
                   {isSaved ? 'Saved' : 'Save'}
                 </button>
              </div>
           </div>

           {/* Image Carousel Area */}
           <div className="relative w-full h-auto min-h-[400px] flex items-center justify-center bg-gray-50 overflow-hidden cursor-zoom-in group">
              {/* Floating Back Button */}
              <button 
                onClick={() => router.back()}
                className="absolute top-6 left-6 z-20 w-12 h-12 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all active:scale-90"
              >
                 <ArrowLeftIcon className="w-6 h-6 text-gray-900" />
              </button>

              {/* Navigation Arrows */}
              {displayMedia.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(prev => (prev === 0 ? displayMedia.length - 1 : prev - 1)); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/10 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                     <ChevronLeftIcon className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(prev => (prev === displayMedia.length - 1 ? 0 : prev + 1)); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/10 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  >
                     <ChevronRightIcon className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Pagination Dots */}
              {displayMedia.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                   {displayMedia.map((_, idx) => (
                     <button 
                       key={idx}
                       onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(idx); }}
                       className={`w-2.5 h-2.5 rounded-full transition-all ${currentMediaIndex === idx ? 'bg-[#e60023] w-6' : 'bg-gray-300'}`}
                     />
                   ))}
                </div>
              )}

              <Image 
                src={getMediaUrl(displayMedia[currentMediaIndex] || artwork.mediaUrl) as string} 
                alt={artwork.title} 
                width={1200}
                height={1600}
                className="w-full h-auto max-h-[60vh] object-contain transition-all duration-500 ease-in-out"
                unoptimized
              />
           </div>

           {/* Merged Info Area (Yellow Circle Request) */}
           <div className="p-8 bg-white space-y-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{artwork.title}</h1>
              
              <div className="flex items-center justify-between mt-6">
                 <Link href={`/artist/${artwork.artist.username}`} className="flex items-center gap-3 decoration-none">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-100 flex items-center justify-center font-bold text-gray-400">
                      {artwork.artist.profileImage ? (
                        <Image src={getMediaUrl(artwork.artist.profileImage) as string} alt={artwork.artist.username} width={48} height={48} className="object-cover" />
                      ) : (
                        artwork.artist.username?.charAt(0)
                      )}
                    </div>
                    <div>
                       <p className="text-base font-bold text-gray-900">@{artwork.artist.username}</p>
                       <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Artist Portfolio</p>
                    </div>
                 </Link>
                 <button className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-bold transition-all">Follow</button>
              </div>

              {/* No comments yet text - as per Pinterest exact */}
              <div className="pt-10 border-t border-gray-50">
                 <p className="text-lg font-bold text-gray-900 mb-4">No comments yet</p>
                 <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-full border border-gray-100 overflow-hidden">
                    <input type="text" placeholder="Add a comment" className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-900 px-2" />
                 </div>
              </div>
           </div>
        </div>

        {/* Suggestion Sidebar (Right Side) */}
        <div className="lg:col-span-5 hidden lg:block space-y-4">
           <h3 className="text-lg font-black text-gray-900 mb-4 px-2">More like this</h3>
           <div className="columns-2 gap-4 [column-fill:_balance]">
              {relatedArtworks.slice(0, 10).map((art) => (
                <div key={art._id || art.id} className="break-inside-avoid mb-4 group/item">
                   <div className="scale-95 transition-transform group-hover/item:scale-100">
                      <ArtworkCard {...art} id={art._id || art.id} imageUrl={art.mediaUrl || art.imageUrl} artist={{ username: art.artist?.username || 'user' }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Bottom Exploration Grid */}
        <div className="lg:col-span-12 mt-20">
           <h2 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-4">Explore more like this</h2>
           <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 [column-fill:_balance]">
              {relatedArtworks.map((art) => (
                <div key={art._id || art.id} className="break-inside-avoid mb-4">
                  <ArtworkCard
                    {...art}
                    id={art._id || art.id}
                    title={art.title}
                    imageUrl={art.mediaUrl || art.imageUrl}
                    artist={{
                      username: art.artist?.username || 'unknown',
                    }}
                  />
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}
