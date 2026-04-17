"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiFetch, getApiUrl, getMediaUrl } from '@/utils/apiClient';
import { useSession } from '@/components/SessionProvider';
import FeedbackSection from '@/components/FeedbackSection';
import ArtworkCard from '@/components/artwork/ArtworkCard';

/* ─── Types ──────────────────────────────────────────────── */

interface ArtworkItem {
  id: string;
  title: string;
  description: string;
  category?: string;
  style?: string;
  thumbnailUrl?: string;
  artist?: any;
  feedbackRequested?: boolean;
}

interface ArtistItem {
  id: string;
  username: string;
  profileImage?: string;
  bio?: string;
  followersCount?: number;
  feedbackCount?: number;
  isFollowing?: boolean;
}

interface ArtistFeedback {
  _id: string;
  user: { _id: string; username: string; profileImage?: string };
  content: string;
  rating: number;
  createdAt: string;
}

const TABS = ['Overview', 'Artists', 'Artworks', 'Feedback'] as const;
type Tab = typeof TABS[number];

/* ─── Page ───────────────────────────────────────────────── */

export default function CommunityPage() {
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [artworks, setArtworks] = useState<ArtworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  // Artwork feedback composer state
  const [artworkFeedbackId, setArtworkFeedbackId] = useState<string | null>(null);
  const [artworkFeedbackText, setArtworkFeedbackText] = useState('');
  const [sendingArtworkFeedback, setSendingArtworkFeedback] = useState(false);

  // Artist feedback composer state
  const [artistFeedbackId, setArtistFeedbackId] = useState<string | null>(null);
  const [artistFeedbackText, setArtistFeedbackText] = useState('');
  const [artistFeedbackRating, setArtistFeedbackRating] = useState(5);
  const [sendingArtistFeedback, setSendingArtistFeedback] = useState(false);
  const [artistFeedbackHistory, setArtistFeedbackHistory] = useState<Record<string, ArtistFeedback[]>>({});
  const [loadingArtistFeedback, setLoadingArtistFeedback] = useState<string | null>(null);

  const { user, isLoggedIn } = useSession();

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  /* fetch page data */
  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [artistsResp, artworksResp] = await Promise.all([
          apiFetch('users/artists?limit=8&sortBy=feedback'),
          apiFetch('artworks?limit=8'),
        ]);
        if (!artistsResp.ok || !artworksResp.ok) throw new Error('Unable to load community feed');
        const artistsData = await artistsResp.json();
        const artworksData = await artworksResp.json();
        if (!active) return;
        setArtists(artistsData.users || artistsData.artists || []);
        setArtworks(artworksData.artworks || []);
      } catch (err: any) {
        setError(err?.message || 'Could not load community content');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  /* fetch feedback for a specific artist */
  const loadArtistFeedback = async (artistId: string) => {
    if (artistFeedbackHistory[artistId]) return; // already loaded
    setLoadingArtistFeedback(artistId);
    try {
      const apiUrl = getApiUrl();
      const resp = await fetch(`${apiUrl}/feedback?artistId=${artistId}`, { cache: 'no-store' });
      const data = await resp.json();
      if (data.success) {
        setArtistFeedbackHistory(prev => ({ ...prev, [artistId]: data.feedback }));
      }
    } catch {
      // silent
    } finally {
      setLoadingArtistFeedback(null);
    }
  };

  /* open artist feedback panel */
  const openArtistFeedback = (artistId: string) => {
    if (!isLoggedIn) { window.location.href = '/auth/login'; return; }
    if (artistFeedbackId === artistId) {
      setArtistFeedbackId(null); // toggle
    } else {
      setArtistFeedbackId(artistId);
      setArtistFeedbackText('');
      setArtistFeedbackRating(5);
      loadArtistFeedback(artistId);
    }
  };

  /* submit feedback for an artist */
  const submitArtistFeedback = async (artist: ArtistItem) => {
    if (!artistFeedbackText.trim()) { alert('Please write your feedback.'); return; }
    const token = getToken();
    if (!token) { window.location.href = '/auth/login'; return; }
    setSendingArtistFeedback(true);
    try {
      const apiUrl = getApiUrl();
      const resp = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          kind: 'feedback',
          content: artistFeedbackText.trim(),
          rating: artistFeedbackRating,
          targetArtist: artist.id,
          threadLink: '',
        }),
      });
      const data = await resp.json();
      if (data.success) {
        // refresh feedback list for this artist
        setArtistFeedbackHistory(prev => ({
          ...prev,
          [artist.id]: [data.feedback, ...(prev[artist.id] || [])],
        }));
        setArtistFeedbackText('');
        setArtistFeedbackRating(5);
        setArtistFeedbackId(null);
        // bump feedbackCount locally
        setArtists(prev => prev.map(a => a.id === artist.id ? { ...a, feedbackCount: (a.feedbackCount || 0) + 1 } : a));
      } else {
        alert(data.message || 'Could not post feedback');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setSendingArtistFeedback(false);
    }
  };

  /* follow artist */
  const connectArtist = async (artistId: string) => {
    const token = getToken();
    if (!isLoggedIn || !token) { window.location.href = '/auth/login'; return; }
    setBusyId(artistId);
    try {
      const result = await apiFetch(`users/${artistId}/follow`, { method: 'POST', token });
      if (!result.ok) throw new Error('Failed to connect');
      setArtists(prev => prev.map(a => a.id === artistId ? { ...a, isFollowing: true } : a));
    } catch {
      alert('Could not follow artist yet.');
    } finally {
      setBusyId(null);
    }
  };

  /* request feedback on artwork */
  const requestFeedback = async (artwork: ArtworkItem) => {
    const token = getToken();
    if (!isLoggedIn || !token) { window.location.href = '/auth/login'; return; }
    setBusyId(artwork.id);
    try {
      const res = await apiFetch(`/artworks/${artwork.id}/request-feedback`, { method: 'POST', token });
      if (!res.ok) { const body = await res.json().catch(() => null); throw new Error(body?.message || 'Error'); }
      setArtworks(prev => prev.map(a => a.id === artwork.id ? { ...a, feedbackRequested: true } : a));
      alert('Feedback request sent!');
    } catch (err: any) {
      alert(`Could not request feedback: ${err?.message || 'Unknown error'}`);
    } finally {
      setBusyId(null);
    }
  };

  /* artwork feedback */
  const openArtworkFeedback = (artworkId: string) => {
    if (!isLoggedIn) { window.location.href = '/auth/login'; return; }
    setArtworkFeedbackId(artworkId);
    setArtworkFeedbackText('');
  };

  const postArtworkFeedback = async (artwork: ArtworkItem) => {
    if (!artworkFeedbackText.trim()) { alert('Please write your feedback.'); return; }
    const token = getToken();
    if (!token) { window.location.href = '/auth/login'; return; }
    setSendingArtworkFeedback(true);
    try {
      const resp = await apiFetch('/feedback', {
        method: 'POST', token,
        body: JSON.stringify({ kind: 'feedback', targetArtwork: artwork.id, content: artworkFeedbackText.trim(), rating: 4, threadLink: '' }),
      });
      if (!resp.ok) { const body = await resp.json().catch(() => null); throw new Error(body?.message || 'Error'); }
      setArtworkFeedbackId(null);
      setArtworkFeedbackText('');
      alert('Feedback posted!');
    } catch (error: any) {
      alert(`Could not post feedback: ${error?.message || 'Unknown error'}`);
    } finally {
      setSendingArtworkFeedback(false);
    }
  };

  /* ─── Loading / Error states ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Synchronizing Collective...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-8">
        <div>
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-3">Node Offline</h2>
          <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-8">{error}</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 rounded-full bg-foreground text-background text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ─── Tab renders ─────────────────────────────────────── */

  const renderOverview = () => (
    <div className="space-y-20">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Artists', value: artists.length > 0 ? `${artists.length}+` : '—', icon: '🎨' },
          { label: 'Artworks', value: artworks.length > 0 ? `${artworks.length}+` : '—', icon: '🖼️' },
          { label: 'Feedbacks', value: 'Live', icon: '💬' },
          { label: 'Status', value: 'Active', icon: '⚡' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-[2rem] p-8 text-center hover:border-primary/30 transition-all duration-300">
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div className="text-2xl font-black text-foreground mb-1">{stat.value}</div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top Artists preview */}
      <div>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-l-2 border-primary/40 pl-6">Top Artists</h2>
          <button onClick={() => setActiveTab('Artists')} className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors">View All →</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {artists.slice(0, 4).map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              busy={busyId === artist.id}
              isCurrentUser={artist.id === user?.id}
              feedbackOpen={artistFeedbackId === artist.id}
              feedbackText={artistFeedbackText}
              feedbackRating={artistFeedbackRating}
              sendingFeedback={sendingArtistFeedback}
              feedbackHistory={artistFeedbackHistory[artist.id]}
              loadingHistory={loadingArtistFeedback === artist.id}
              onConnect={() => connectArtist(artist.id)}
              onFeedbackOpen={() => openArtistFeedback(artist.id)}
              onFeedbackTextChange={setArtistFeedbackText}
              onFeedbackRatingChange={setArtistFeedbackRating}
              onFeedbackSubmit={() => submitArtistFeedback(artist)}
              onFeedbackCancel={() => setArtistFeedbackId(null)}
            />
          ))}
        </div>
      </div>

      {/* Top Artworks preview */}
      <div>
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-l-2 border-primary/40 pl-6">Suggested Artworks</h2>
          <button onClick={() => setActiveTab('Artworks')} className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors">View All →</button>
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
          {artworks.slice(0, 8).map((art) => (
            <div key={art.id} className="break-inside-avoid mb-6">
              <ArtworkCard 
                id={art.id}
                title={art.title}
                imageUrl={art.thumbnailUrl || ''}
                artist={{
                   username: art.artist?.username || 'artist',
                }}
              />
            </div>
          ))}
          {artworks.length === 0 && <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">No artworks available</div>}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-card border border-border rounded-[3rem] p-16 text-center relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-40 -mt-40 group-hover:bg-primary/10 transition-colors" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 mb-6">Join the Collective</h2>
        <p className="text-2xl font-black uppercase italic tracking-tighter text-foreground mb-10">
          Share your art.<br /><span className="text-primary">Grow with feedback.</span>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/upload" className="bg-foreground text-background px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">Upload Artwork</Link>
          <Link href="/explore" className="px-10 py-5 rounded-full border border-border text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all">Explore Gallery</Link>
        </div>
      </div>
    </div>
  );

  const renderArtists = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-l-2 border-primary/40 pl-6">Community Artists</h2>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">Click an artist to leave feedback</p>
      </div>
      {artists.length === 0 ? (
        <div className="text-center py-24 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">No artists yet</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {artists.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              busy={busyId === artist.id}
              isCurrentUser={artist.id === user?.id}
              feedbackOpen={artistFeedbackId === artist.id}
              feedbackText={artistFeedbackText}
              feedbackRating={artistFeedbackRating}
              sendingFeedback={sendingArtistFeedback}
              feedbackHistory={artistFeedbackHistory[artist.id]}
              loadingHistory={loadingArtistFeedback === artist.id}
              onConnect={() => connectArtist(artist.id)}
              onFeedbackOpen={() => openArtistFeedback(artist.id)}
              onFeedbackTextChange={setArtistFeedbackText}
              onFeedbackRatingChange={setArtistFeedbackRating}
              onFeedbackSubmit={() => submitArtistFeedback(artist)}
              onFeedbackCancel={() => setArtistFeedbackId(null)}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderArtworks = () => (
    <div className="space-y-8">
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-l-2 border-primary/40 pl-6">Community Artworks</h2>
      {artworks.length === 0 ? (
        <div className="text-center py-24 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">No artworks yet</div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-6 [column-fill:_balance]">
          {artworks.map((art) => (
            <div key={art.id} className="break-inside-avoid mb-6">
              <ArtworkCard 
                id={art.id}
                title={art.title}
                imageUrl={art.thumbnailUrl || ''}
                artist={{
                   username: art.artist?.username || 'artist',
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-8">
      <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-l-2 border-primary/40 pl-6">Community Feedback Thoughts</h2>
      <FeedbackSection />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-8xl font-serif font-black mb-8 uppercase italic tracking-tighter text-foreground">
            The <span className="text-foreground/20">Collective</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.5em] text-foreground/40 max-w-2xl mx-auto leading-relaxed">
            Connect with artists, give feedback, and build collaborative networks within the Picasso community.
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex justify-center mb-16">
          <div className="bg-primary/5 border border-primary/10 rounded-full px-8 py-3 flex items-center space-x-4">
            <div className="w-2 h-2 rounded-full bg-[#00FFBD] animate-pulse shadow-[0_0_10px_#00FFBD]" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/60">Collective Status: Active</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
          <div className="bg-card border border-border rounded-full p-1.5 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`community-tab-${tab.toLowerCase()}`}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeTab === tab ? 'bg-foreground text-background shadow-sm' : 'text-foreground/40 hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'Overview' && renderOverview()}
          {activeTab === 'Artists' && renderArtists()}
          {activeTab === 'Artworks' && renderArtworks()}
          {activeTab === 'Feedback' && renderFeedback()}
        </div>

        {/* Footer nav */}
        <div className="mt-20 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 hover:text-foreground transition-colors">
            Return to Matrix Home
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── ArtistCard ─────────────────────────────────────────── */

interface ArtistCardProps {
  artist: ArtistItem;
  busy: boolean;
  isCurrentUser: boolean;
  feedbackOpen: boolean;
  feedbackText: string;
  feedbackRating: number;
  sendingFeedback: boolean;
  feedbackHistory?: ArtistFeedback[];
  loadingHistory: boolean;
  onConnect: () => void;
  onFeedbackOpen: () => void;
  onFeedbackTextChange: (v: string) => void;
  onFeedbackRatingChange: (v: number) => void;
  onFeedbackSubmit: () => void;
  onFeedbackCancel: () => void;
}

function ArtistCard({
  artist, busy, isCurrentUser,
  feedbackOpen, feedbackText, feedbackRating, sendingFeedback, feedbackHistory, loadingHistory,
  onConnect, onFeedbackOpen, onFeedbackTextChange, onFeedbackRatingChange, onFeedbackSubmit, onFeedbackCancel,
}: ArtistCardProps) {
  return (
    <div className={`group bg-card border rounded-[2rem] transition-all duration-300 overflow-hidden ${feedbackOpen ? 'border-primary/40 ring-1 ring-primary/10' : 'border-border hover:border-primary/20'}`}>
      {/* Card header */}
      <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/artist/${artist.username}`} className="flex items-center gap-3 w-full group-hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-border flex-shrink-0">
                {artist.profileImage ? (
                  <Image src={getMediaUrl(artist.profileImage) as string} width={48} height={48} className="w-full h-full object-cover" alt={artist.username} unoptimized />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-xs font-black uppercase text-foreground/60">
                    {artist.username.slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm truncate">{artist.username}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-foreground/40">
                {artist.followersCount || 0} followers · {artist.feedbackCount || 0} feedbacks
              </p>
            </div>
          </Link>
        </div>

        <p className="text-[10px] text-foreground/50 mb-5 leading-relaxed line-clamp-2">
          {artist.bio || 'No bio yet.'}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isCurrentUser && (
            <>
              <button
                onClick={onConnect}
                disabled={busy || !!artist.isFollowing}
                className="flex-1 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none bg-primary text-white hover:bg-primary/90"
              >
                {artist.isFollowing ? '✓ Following' : busy ? '...' : 'Follow'}
              </button>
              <button
                id={`give-feedback-${artist.id}`}
                onClick={onFeedbackOpen}
                className={`flex-1 px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
                  feedbackOpen
                    ? 'bg-foreground text-background'
                    : 'border border-border hover:bg-foreground hover:text-background'
                }`}
              >
                {feedbackOpen ? '✕ Close' : '💬 Feedback'}
              </button>
            </>
          )}
          {isCurrentUser && (
            <Link href="/profile" className="w-full text-center px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-border hover:bg-foreground hover:text-background transition-all">
              My Profile →
            </Link>
          )}
        </div>
      </div>

      {/* Feedback composer — slides open */}
      {feedbackOpen && (
        <div className="border-t border-border px-6 pb-6 pt-5 bg-muted/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/40">
            Leave feedback for {artist.username}
          </p>

          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onFeedbackRatingChange(star)}
                className={`text-xl transition-transform hover:scale-125 ${star <= feedbackRating ? 'text-yellow-400' : 'text-foreground/20'}`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-[9px] font-black uppercase tracking-wider text-foreground/40">
              {feedbackRating}/5
            </span>
          </div>

          {/* Text input */}
          <textarea
            value={feedbackText}
            onChange={(e) => onFeedbackTextChange(e.target.value)}
            placeholder={`Share your thoughts on ${artist.username}'s work...`}
            rows={3}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-foreground/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary/30"
          />

          {/* Submit / Cancel */}
          <div className="flex gap-2">
            <button
              onClick={onFeedbackSubmit}
              disabled={sendingFeedback || !feedbackText.trim()}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-wider disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              {sendingFeedback ? 'Posting...' : 'Post Feedback'}
            </button>
            <button
              onClick={onFeedbackCancel}
              className="px-4 py-2.5 rounded-xl border border-border text-[9px] font-black uppercase tracking-wider hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Existing feedback history */}
          {loadingHistory ? (
            <p className="text-[9px] text-foreground/30 font-black uppercase tracking-wider text-center">Loading feedback...</p>
          ) : feedbackHistory && feedbackHistory.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto hide-scrollbar">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30">Previous feedback</p>
              {feedbackHistory.slice(0, 5).map((fb) => (
                <div key={fb._id} className="bg-background border border-border rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-black text-foreground/60">{fb.user.username}</span>
                    <div className="flex items-center gap-1">
                      {'★'.repeat(fb.rating).split('').map((s, i) => (
                        <span key={i} className="text-yellow-400 text-[10px]">{s}</span>
                      ))}
                      {'☆'.repeat(5 - fb.rating).split('').map((s, i) => (
                        <span key={i} className="text-foreground/20 text-[10px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-foreground/70 leading-relaxed">{fb.content}</p>
                </div>
              ))}
            </div>
          ) : feedbackHistory ? (
            <p className="text-[9px] text-foreground/20 font-black uppercase tracking-wider text-center">No feedback yet — be the first!</p>
          ) : null}
        </div>
      )}
    </div>
  );
}


