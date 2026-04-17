'use client';

import { useState, useEffect, memo } from 'react';
import { apiFetch, getMediaUrl } from '@/utils/apiClient';
import { siteConfig } from '@/config/site';
import ArtworkCard from './ArtworkCard';
import MobileArtworkCard from './MobileArtworkCard';
import { Artwork } from '@/types';
import Image from 'next/image';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface InteractiveArtworkCardProps {
  artwork: Artwork;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const InteractiveArtworkCard = memo(function InteractiveArtworkCard({ artwork, onEdit, onDelete }: InteractiveArtworkCardProps) {
  const [localArtwork, setLocalArtwork] = useState<any>({
    ...artwork,
    trendVotes: artwork.trendVotes || 0,
    isTrended: artwork.isTrended || false,
    likes: artwork.likes || 0,
    isLiked: artwork.isLiked || false,
    isSaved: artwork.isSaved || false,
    commentList: (artwork as any).commentList || [],
    tags: artwork.tags || [],
    collaborators: artwork.collaborators || []
  });
  useEffect(() => {
    setLocalArtwork({
      ...artwork,
      trendVotes: artwork.trendVotes || 0,
      isTrended: artwork.isTrended || false,
      likes: artwork.likes || 0,
      isLiked: artwork.isLiked || false,
      isSaved: artwork.isSaved || false,
      commentList: (artwork as any).commentList || [],
      tags: artwork.tags || [],
      collaborators: artwork.collaborators || []
    });
  }, [artwork]);

  const handleLike = async (id: string) => {
    const wasLiked = localArtwork.isLiked;
    setLocalArtwork((prev: any) => ({
      ...prev,
      isLiked: !wasLiked,
      likes: wasLiked ? prev.likes - 1 : prev.likes + 1
    }));

    try {
      const response = await apiFetch(`/artworks/${id}/like`, {
        method: 'POST',
        token: localStorage.getItem('token') || ''
      });

      if (!response.ok) {
        setLocalArtwork((prev: any) => ({
          ...prev,
          isLiked: wasLiked,
          likes: wasLiked ? prev.likes + 1 : prev.likes - 1
        }));
      }
    } catch (error) {
      setLocalArtwork((prev: any) => ({ ...prev, isLiked: wasLiked, likes: wasLiked ? prev.likes + 1 : prev.likes - 1 }));
      console.error('Failed to update like:', error);
    }
  };

  const handleSave = async (id: string) => {
    const wasSaved = localArtwork.isSaved;
    setLocalArtwork((prev: any) => ({ ...prev, isSaved: !wasSaved }));

    try {
      const response = await apiFetch(`/artworks/${id}/save`, {
        method: 'POST',
        token: localStorage.getItem('token') || ''
      });

      if (!response.ok) {
        setLocalArtwork((prev: any) => ({ ...prev, isSaved: wasSaved }));
      }
    } catch (error) {
      setLocalArtwork((prev: any) => ({ ...prev, isSaved: wasSaved }));
      console.error('Failed to update save:', error);
    }
  };

  const handleTrend = async (id: string) => {
    const wasTrended = localArtwork.isTrended;
    const currentVotes = localArtwork.trendVotes;

    setLocalArtwork((prev: any) => ({
      ...prev,
      isTrended: !wasTrended,
      trendVotes: wasTrended ? Math.max(0, currentVotes - 1) : currentVotes + 1
    }));

    try {
      const response = await apiFetch(`/artworks/${id}/trend`, {
        method: 'POST',
        token: localStorage.getItem('token') || ''
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setLocalArtwork((prev: any) => ({
            ...prev,
            trendVotes: data.trendVotes,
            isTrended: data.trended
          }));
        }
      } else {
        setLocalArtwork((prev: any) => ({
          ...prev,
          isTrended: wasTrended,
          trendVotes: currentVotes
        }));
      }
    } catch (error) {
      setLocalArtwork((prev: any) => ({ ...prev, isTrended: wasTrended, trendVotes: currentVotes }));
      console.error('Failed to update trend:', error);
    }
  };

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleShare = async (id: string) => {
    const shareUrl = `${window.location.origin}/artwork/${id}`;
    const shareData = {
      title: localArtwork.title,
      text: `Check out this masterpiece: ${localArtwork.title} on ${siteConfig.name}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
        setShareStatus('error');
        setTimeout(() => setShareStatus('idle'), 2000);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/artworks/${localArtwork.id}/comment`, {
        method: 'POST',
        token: localStorage.getItem('token') || '',
        body: JSON.stringify({ comment: commentText })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.comment) {
          setLocalArtwork((prev: any) => ({
            ...prev,
            comments: (prev.comments || 0) + 1,
            commentList: [...(prev.commentList || []), data.comment]
          }));
          setCommentText('');
        }
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <MobileArtworkCard
        id={localArtwork.id}
        title={localArtwork.title}
        description={localArtwork.description}
        artist={{
          name: localArtwork.artist?.name || 'Unknown',
          username: localArtwork.artist?.username || 'unknown',
          avatar: localArtwork.artist?.avatar
        }}
        collaborators={localArtwork.collaborators || []}
        imageUrl={localArtwork.mediaUrl}
        category={localArtwork.category}
        likes={localArtwork.likes || 0}
        comments={localArtwork.comments || 0}
        trendVotes={localArtwork.trendVotes}
        isLiked={localArtwork.isLiked}
        isSaved={localArtwork.isSaved}
        isTrended={localArtwork.isTrended}
        onLike={handleLike}
        onSave={handleSave}
        onTrend={handleTrend}
        onShare={handleShare}
        onMore={() => setShowComments(!showComments)}
        timestamp={(localArtwork as any).createdAt}
      />
    );
  }

  return (
    <div className="flex flex-col space-y-4 relative">
      {shareStatus === 'copied' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl animate-in fade-in zoom-in duration-300">
          Transmission Link Copied
        </div>
      )}
      <ArtworkCard
        id={localArtwork.id}
        title={localArtwork.title}
        artist={{
          username: localArtwork.artist?.username || 'unknown',
          avatar: localArtwork.artist?.avatar
        }}
        imageUrl={localArtwork.mediaUrl}
      />

      {/* Basic Inline Comments Section */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors mb-4"
        >
          {showComments ? 'Hide Insights' : `View Insights (${localArtwork.comments || 0})`}
        </button>

        {showComments && (
          <div className="space-y-6 fade-in">
            <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {(localArtwork as any).commentList?.map((c: any, idx: number) => (
                <div key={idx} className="flex space-x-3">
                  {c.user?.profileImage ? (
                    <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 relative">
                      <Image src={getMediaUrl(c.user.profileImage) as string} alt={c.user.username} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[8px] font-bold">{(c.user?.username || 'U')[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black truncate">{c.user?.username}</p>
                      <span className="text-[8px] text-foreground/20 italic">
                        {new Date(c.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground/70 leading-relaxed">{c.comment}</p>
                  </div>
                </div>
              ))}
              {(!(localArtwork as any).commentList || (localArtwork as any).commentList.length === 0) && (
                <p className="text-[9px] text-foreground/20 italic uppercase tracking-widest text-center py-4">No insights shared yet</p>
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your resonance..."
                className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-12"
              />
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="absolute right-2 top-1.5 p-1.5 text-primary hover:scale-110 transition-transform disabled:opacity-20 disabled:scale-100"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
});

export default InteractiveArtworkCard;
