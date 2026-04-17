'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getMediaUrl } from '@/utils/apiClient';
import { 
  HeartIcon, 
  BookmarkIcon, 
  EllipsisHorizontalIcon, 
  PaperAirplaneIcon,
  SparklesIcon,
  ChatBubbleOvalLeftIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartIconSolid, 
  BookmarkIcon as BookmarkIconSolid, 
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';

interface MobileArtworkCardProps {
  id: string;
  title: string;
  description?: string;
  artist: {
    name: string;
    username: string;
    avatar?: string;
  };
  imageUrl: string;
  category: string;
  likes: number;
  comments: number;
  trendVotes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isTrended?: boolean;
  isDailyDeviation?: boolean;
  onLike?: (id: string) => void;
  onSave?: (id: string) => void;
  onTrend?: (id: string) => void;
  onShare?: (id: string) => void;
  onMore?: () => void;
  timestamp?: string;
  collaborators?: any[];
}

export default function MobileArtworkCard({
  id,
  title,
  description,
  artist,
  imageUrl,
  category,
  likes,
  comments,
  trendVotes,
  isLiked = false,
  isSaved = false,
  isTrended = false,
  isDailyDeviation = false,
  onLike,
  onSave,
  onTrend,
  onShare,
  onMore,
  timestamp,
  collaborators = []
}: MobileArtworkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-background border-b border-border/10 pb-4 chaos-border chaos-rotate-md mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-3 shrink-0">
            {[artist, ...collaborators].slice(0, 3).map((creator: any, idx: number) => (
              <div key={idx} className={`relative h-10 w-10 rounded-full border border-border overflow-hidden bg-muted z-[${3-idx}]`}>
                <Image 
                    src={(creator.avatar || creator.profileImage) ? getMediaUrl(creator.avatar || creator.profileImage) as string : `https://ui-avatars.com/api/?name=${creator.username}`} 
                    alt={creator.username} 
                    fill 
                    className="object-cover"
                    unoptimized
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 flex-wrap">
              {[artist, ...collaborators].map((creator: any, idx: number) => (
                <span key={idx} className="text-sm font-black tracking-tight text-foreground whitespace-nowrap">
                  {creator.username}{idx < [artist, ...collaborators].length - 1 ? ',' : ''}
                </span>
              ))}
              {/* DeviantArt: DD badge */}
              {isDailyDeviation && (
                <span className="bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                  DD
                </span>
              )}
            </div>
            {/* Artfol: Category pill */}
            <span className="inline-block bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-0.5 self-start">
              {category}
            </span>
          </div>
        </div>
        <button 
          onClick={onMore}
          className="p-2 text-foreground/40"
        >
          <EllipsisHorizontalIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Media */}
      <div className="relative aspect-[4/5] w-full bg-muted/10 overflow-hidden flex items-center justify-center">
        <Image 
          src={getMediaUrl(imageUrl) as string} 
          alt={title} 
          fill 
          className="object-contain transition-all duration-500"
          unoptimized
        />
      </div>

      {/* Interactions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-6">
            <button onClick={() => onLike?.(id)} className={isLiked ? 'text-red-500' : 'text-foreground hover:scale-110 transition-transform'}>
              {isLiked ? <HeartIconSolid className="h-7 w-7" /> : <HeartIcon className="h-7 w-7" />}
            </button>
            <button onClick={onMore} className="text-foreground hover:scale-110 transition-transform">
              <ChatBubbleOvalLeftIcon className="h-7 w-7" />
            </button>
            <button onClick={() => onShare?.(id)} className="text-foreground hover:scale-110 transition-transform -rotate-45">
              <PaperAirplaneIcon className="h-7 w-7 transition-all group-active:scale-95" />
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onTrend?.(id)} className={isTrended ? 'text-primary' : 'text-foreground/40'}>
              {isTrended ? <SparklesIconSolid className="h-7 w-7" /> : <SparklesIcon className="h-7 w-7" />}
            </button>
            <button onClick={() => onSave?.(id)} className={isSaved ? 'text-primary' : 'text-foreground'}>
              {isSaved ? <BookmarkIconSolid className="h-7 w-7" /> : <BookmarkIcon className="h-7 w-7" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <p className="text-sm font-black tracking-tight text-foreground">{likes.toLocaleString()} likes</p>
          <div className="text-sm leading-relaxed">
            <span className="font-black mr-2 uppercase tracking-tight">{artist.username}</span>
            <span className="font-medium text-foreground/90">{title}</span>
            {description && (
              <div className="mt-1">
                {isExpanded ? (
                  <p className="text-foreground/70">{description}</p>
                ) : (
                  <p className="text-foreground/70 line-clamp-2">
                    {description}
                    {description.length > 100 && (
                      <button 
                        onClick={() => setIsExpanded(true)}
                        className="ml-1 text-foreground/40 font-bold"
                      >
                        more
                      </button>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={onMore}
            className="text-sm text-foreground/40 font-medium block mt-1"
          >
            View all {comments} comments
          </button>
          
          {timestamp && (
            <span className="text-[10px] text-foreground/20 font-black uppercase tracking-widest mt-2 block">
              {new Date(timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
