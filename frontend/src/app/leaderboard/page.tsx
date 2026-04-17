'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { getApiUrl, apiFetch, getMediaUrl } from '@/utils/apiClient';
import { Artwork, User } from '@/types';
import InteractiveArtworkCard from '@/components/artwork/InteractiveArtworkCard';
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  UserGroupIcon,
  SparklesIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

interface RankedArtist {
  id: string;
  username: string;
  profileImage?: string;
  compositeScore: number;
  profileVisits: number;
  totalTrends: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  topArtwork: {
    id: string;
    title: string;
    mediaUrl: string;
    category: string;
    trendVotes: number;
  };
}

export default function LeaderboardPage() {
  const [topArtists, setTopArtists] = useState<RankedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let isTimeout = false;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      isTimeout = true;
      if (isMounted) controller.abort();
    }, 30000);

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await apiFetch('leaderboards/weekly', {
          cache: 'no-store',
          signal: controller.signal
        });

        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setTopArtists(data.leaderboard?.topArtists || data.topArtists || []);
          }
        } else {
          if (isMounted) setError('Failed to load artist leaderboard');
        }
      } catch (err: any) {
        if (!isMounted) return; // Ignore errors caused by component unmount
        if (err.name === 'AbortError') {
          if (isTimeout) setError('Request timed out. Is the backend running?');
        } else {
          setError('Failed to load leaderboard artists');
          console.error('Failed to fetch leaderboard:', err);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timer);
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-foreground border-t-transparent rounded-full animate-spin"></div>
        <p className="text-foreground/40 font-medium animate-pulse uppercase tracking-[0.2em] text-[10px]">Ranking Artists...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-red-500/20 p-8 rounded-2xl text-center max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChartBarIcon className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 uppercase tracking-wide text-foreground">Analysis Interrupted</h1>
          <p className="text-foreground/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground pb-16">
      {/* Header Section - No internal max-width to prevent clipping in layout */}
      <div className="relative overflow-hidden pt-12 pb-12 px-4">
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-muted border border-border rounded-full px-4 py-1.5 mb-6">
            <TrophyIcon className="w-4 h-4 text-foreground/60" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">Top Artist Rankings</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-black italic tracking-tighter uppercase mb-2">{siteConfig.name} <span className="text-foreground/20 italic capitalize font-normal tracking-normal">Elite</span></h1>
            <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Global Artist Rankings</p>
          </div>
          <p className="text-lg text-foreground/40 max-w-2xl mx-auto leading-relaxed uppercase font-black text-[11px] tracking-widest">
            The pulse of {siteConfig.name}. Ranked by a composite performance score including trends, engagement, and profile curiosity.
          </p>
        </div>
      </div>

      <div className="w-full px-4 md:px-6 pb-24">
        {topArtists.length > 0 ? (
          <div className="grid grid-cols-1 gap-10">
            {topArtists.map((artist, index) => (
              <div
                key={artist.id || (artist as any)._id || index}
                className="group relative bg-card border border-border rounded-[2.5rem] overflow-hidden hover:border-foreground/20 transition-all duration-500 shadow-2xl"
              >
                {/* Ranking Badge */}
                <div className={`absolute top-6 left-6 z-20 w-12 h-12 rounded-2xl flex items-center justify-center font-serif font-black text-xl shadow-2xl border ${index === 0 ? 'bg-primary text-primary-foreground border-primary rotate-[-8deg]' :
                  index === 1 ? 'bg-muted text-foreground/40 border-border rotate-[-4deg]' :
                    index === 2 ? 'bg-muted/50 text-foreground/60 border-border rotate-[-2deg]' :
                      'bg-background text-foreground/20 border-border'
                  }`}>
                  {index + 1}
                </div>

                <div className="flex flex-col h-full">
                  {/* Artist Segment */}
                  <div className="p-8 flex flex-col items-center xl:items-start xl:border-r border-border xl:min-w-[260px] bg-foreground/5">
                    <div className="relative">
                      <div className="w-28 h-28 rounded-[2rem] border border-border overflow-hidden relative shadow-2xl transform rotate-3">
                        {artist.profileImage ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={getMediaUrl(artist.profileImage) as string}
                              alt={artist.username}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-background flex items-center justify-center text-foreground/10 text-4xl font-serif italic">
                            {artist.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-background shadow-sm"></div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-2xl font-black tracking-tight uppercase italic">{artist.username}</h3>
                    </div>

                    <div className="inline-flex items-center mt-3 px-4 py-1.5 rounded-full bg-muted text-foreground/40 text-[9px] font-black uppercase tracking-[0.2em] border border-border">
                      Top Rated
                    </div>

                    <div className="mt-auto pt-10 w-full space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-background/40 p-4 rounded-2xl border border-border flex flex-col items-center">
                          <SparklesIcon className="w-4 h-4 text-foreground/40 mb-1" />
                          <span className="text-sm font-black italic">{Math.round(artist.totalTrends)}</span>
                          <span className="text-[10px] text-foreground/20 uppercase font-bold tracking-widest">Popularity</span>
                        </div>
                        <div className="bg-background/40 p-4 rounded-2xl border border-border flex flex-col items-center">
                          <EyeIcon className="w-4 h-4 text-foreground/40 mb-1" />
                          <span className="text-sm font-black italic">{artist.profileVisits}</span>
                          <span className="text-[10px] text-foreground/20 uppercase font-bold tracking-widest">Profile Views</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-foreground/20">
                          <span>Artist Score</span>
                          <span className="text-foreground">{Math.round(artist.compositeScore)}</span>
                        </div>
                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${Math.min(100, (artist.compositeScore / (topArtists[0].compositeScore || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Artwork Segment */}
                  <div className="flex-1 p-2">
                    <div className="h-full bg-background rounded-[1.8rem] overflow-hidden flex flex-col border border-border">
                      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Featured Artwork</span>
                        <div className="flex items-center space-x-1.5 text-foreground/40">
                          <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-black">{artist.topArtwork?.trendVotes || 0}</span>
                        </div>
                      </div>

                      <div className="flex-1 relative min-h-[300px] overflow-hidden group/art">
                        {artist.topArtwork?.mediaUrl ? (
                          <>
                            <Image
                              src={getMediaUrl(artist.topArtwork.mediaUrl) as string}
                              alt={artist.topArtwork.title}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover/art:scale-110"
                              unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover/art:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                              <h4 className="text-foreground font-serif italic text-xl mb-1">{artist.topArtwork.title}</h4>
                              <p className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">{artist.topArtwork.category}</p>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/5">
                            <SparklesIcon className="w-16 h-16 mb-4 opacity-10" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-black italic">Archive Empty</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 grid grid-cols-3 gap-3">
                        <div className="flex flex-col items-center py-3 bg-muted rounded-2xl border border-border">
                          <HeartIcon className="w-4 h-4 text-foreground/20 mb-1" />
                          <span className="text-xs font-black italic">{artist.totalLikes}</span>
                        </div>
                        <div className="flex flex-col items-center py-3 bg-muted rounded-2xl border border-border">
                          <ChatBubbleOvalLeftIcon className="w-4 h-4 text-foreground/20 mb-1" />
                          <span className="text-xs font-black italic">{artist.totalComments}</span>
                        </div>
                        <div className="flex flex-col items-center py-3 bg-muted rounded-2xl border border-border">
                          <EyeIcon className="w-4 h-4 text-foreground/20 mb-1" />
                          <span className="text-xs font-black italic">{(artist.totalViews / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-card border border-dashed border-border rounded-[3rem] shadow-2xl">
            <SparklesIcon className="w-20 h-20 text-foreground/5 mx-auto mb-8" />
            <h2 className="text-3xl font-serif italic text-foreground/20 tracking-tight">The Stage is Empty</h2>
            <p className="text-foreground/10 mt-4 font-black uppercase tracking-[0.2em] text-[10px]">Pioneer the next wave of artistic excellence.</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-card border-t border-border py-32 px-6 mt-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
          {[
            { icon: SparklesIcon, title: "Popularity Based", desc: "Trend votes define the primary axis of rank, representing direct peer fascination." },
            { icon: HeartIcon, title: "Fair Scoring", desc: "Engagement ratios are balanced to ensure small-scale brilliance is recognized." },
            { icon: EyeIcon, title: "Engagement Stats", desc: "Views and profile resonance contribute to a multidimensional visibility score." },
            { icon: TrophyIcon, title: "Weekly Update", desc: "Rankings are recalibrated weekly to maintain a fluid, evolving meta." }
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-all group-hover:scale-110 duration-500 shadow-xl shadow-foreground/5">
                <item.icon className="w-7 h-7 text-foreground/40 group-hover:text-primary-foreground transition-colors" />
              </div>
              <h4 className="text-sm font-black mb-4 uppercase tracking-[0.2em] italic">{item.title}</h4>
              <p className="text-[11px] font-bold text-foreground/20 leading-relaxed uppercase tracking-wider">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
