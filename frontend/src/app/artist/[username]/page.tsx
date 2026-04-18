'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { getApiUrl, getMediaUrl } from '@/utils/apiClient';
import { User, Artwork } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    SparklesIcon,
    Cog6ToothIcon as CogIcon,
    ShareIcon,
    CheckIcon,
    Squares2X2Icon,
    ListBulletIcon,
    AdjustmentsHorizontalIcon,
    ChatBubbleLeftEllipsisIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '@/utils/apiClient';
import FollowButton from '@/components/ui/FollowButton';
import UserListModal from '@/components/ui/UserListModal';
import SessionManager from '@/utils/sessionManager';
import InteractiveArtworkCard from '@/components/artwork/InteractiveArtworkCard';

export default function ArtistProfilePage() {
    const { username } = useParams();
    const router = useRouter();
    const { user: currentUser, token } = useSession();
    const [artist, setArtist] = useState<User | null>(null);

    const handleMessage = async () => {
        if (!artist) return;
        if (!token) { router.push('/auth/login'); return; }
        
        try {
            const response = await apiFetch('/chats', {
                method: 'POST',
                token,
                body: JSON.stringify({ participants: [artist.id] })
            });
            const data = await response.json();
            if (response.ok && data.chat) {
                router.push(`/chat?id=${data.chat.id}`);
            } else {
                alert(data.message || 'Failed to start conversation');
            }
        } catch (err) {
            console.error('Failed to start chat:', err);
        }
    };

    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);
    const [trendVotes, setTrendVotes] = useState<number>(0);
    const [hasVoted, setHasVoted] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalUsers, setModalUsers] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);

    // Portfolio UI state
    const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'stats'>('portfolio');
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const isSelf = currentUser && artist && (
        String(currentUser.id || (currentUser as any)._id) === String(artist.id || (artist as any)._id)
    );

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                const token = localStorage.getItem('token');
                const apiUrl = getApiUrl();
                const response = await fetch(`${apiUrl}/users/username/${encodeURIComponent(String(username))}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!response.ok) throw new Error('Artist not found');
                const data = await response.json();
                setArtist(data.user);
                setTrendVotes(data.user.trendVotes || 0);
                setHasVoted(!!data.user.hasVoted);
                setIsFollowing(data.user.isFollowing || false);
                const artworkResponse = await fetch(`${apiUrl}/users/${data.user.id}/artworks`);
                if (artworkResponse.ok) {
                    const artworkData = await artworkResponse.json();
                    setArtworks(artworkData.artworks || []);
                }
                if (data.user && currentUser?.id !== data.user.id) {
                    fetch(`${apiUrl}/users/${data.user.id}/visit`, { method: 'POST' }).catch(() => { });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        if (username) fetchArtistData();
    }, [username]);

    const handleFollowChange = (newIsFollowing: boolean, newCount: number) => {
        setIsFollowing(newIsFollowing);
        setArtist(prev => prev ? { ...prev, followersCount: newCount } : null);
    };

    const handleShare = async () => {
        const shareData = {
            title: `${artist?.username} on Picasso`,
            text: `Check out ${artist?.username}'s artistic portfolio on Picasso!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            }
        } catch (err) {
            console.error('Share failed:', err);
            // Fallback for browsers that block clipboard in non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
            } catch (copyErr) {
                console.error('Final fallback failed:', copyErr);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleTrend = async () => {
        if (!artist || !currentUser) return;
        try {
            const response = await fetch(`${getApiUrl()}/users/${artist.id}/trend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SessionManager.getToken()}` }
            });
            if (response.ok) { const data = await response.json(); setArtist(data.user); }
        } catch (err) { console.error('Failed to set trending status:', err); }
    };

    const handleVoteTrend = async () => {
        if (!artist) return;
        if (!currentUser) { router.push('/auth/login'); return; }
        try {
            const response = await fetch(`${getApiUrl()}/users/${artist.id}/vote-trend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SessionManager.getToken()}` }
            });
            if (response.ok) {
                setTrendVotes(prev => prev + 1);
                setHasVoted(true);
            } else {
                const err = await response.json().catch(() => ({}));
                alert(err.message || 'Failed to record vote');
            }
        } catch (err) { console.error('Failed to submit trend vote:', err); }
    };

    const handleOpenUserList = async (type: 'followers' | 'following') => {
        if (!artist) return;
        setModalTitle(type === 'followers' ? 'Followers' : 'Following');
        setModalOpen(true);
        setModalLoading(true);
        try {
            const response = await fetch(`${getApiUrl()}/users/${artist.id || (artist as any)._id}/${type}`);
            if (response.ok) { const data = await response.json(); setModalUsers(data[type] || []); }
        } catch (err) { console.error('Failed to fetch user list:', err); }
        finally { setModalLoading(false); }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </div>
    );

    if (error || !artist) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground px-4">
            <h1 className="text-4xl font-serif mb-4 italic tracking-tight uppercase">Artist <span className="text-foreground/20">Not Found</span></h1>
            <button 
                onClick={() => router.back()} 
                className="bg-primary text-primary-foreground px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all outline-none"
            >
                Go Back
            </button>
        </div>
    );

    // Portfolio helpers
    const categories = ['all', ...Array.from(new Set(artworks.map(a => a.category).filter(Boolean)))];
    const featuredArtwork = artworks[0];
    const filteredArtworks = activeCategory === 'all' ? artworks : artworks.filter(a => a.category === activeCategory);
    const totalLikes = artworks.reduce((sum, a) => sum + (a.likes || 0), 0);

    return (
        <div className="min-h-screen bg-background text-foreground pb-24">
            {/* ── Cinematic Hero ── */}
            <div className="relative h-[12rem] md:h-[15rem] overflow-hidden flex flex-col items-center justify-center isolate">
                {/* Base Layer (Black Fallback) */}
                <div className="absolute inset-0 bg-zinc-950 z-0"></div>

                {/* Banner Layer */}
                {artist.bannerUrl && (
                    <div className="absolute inset-0 z-10">
                        <Image 
                            src={getMediaUrl(artist.bannerUrl) as string} 
                            alt={`${artist.username} Banner`} 
                            fill 
                            className="object-cover" 
                            unoptimized 
                        />
                    </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 z-20"></div>
                
                <div className="absolute top-6 left-6 md:left-12 z-30">
                    <button 
                        onClick={() => router.back()} 
                        className="bg-white/5 backdrop-blur-md border border-white/5 hover:bg-white/10 p-2.5 rounded-xl transition-all group flex items-center gap-3 outline-none"
                    >
                        <ArrowLeftIcon className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] hidden md:block text-white opacity-40">Back</span>
                    </button>
                </div>
                
                <div className="relative z-30 text-center space-y-3 pt-6">
                    <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2 shadow-lg backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Artist Portfolio</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif italic font-black tracking-tighter text-white drop-shadow-2xl leading-tight">{artist.username}</h1>
                    <div className="h-0.5 w-16 bg-white/40 mx-auto mt-4"></div>
                </div>
            </div>

            {/* Profile Card Container (No longer overlapping) */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-20 mt-8 mb-12">

                {/* ── Profile Card ── */}
                <div className="bg-card rounded-3xl border border-border shadow-xl mb-6">
                    <div className="p-6 md:p-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border border-border overflow-hidden bg-background shadow-xl transform rotate-[-2deg]">
                                    {artist.profileImage ? (
                                        <Image src={getMediaUrl(artist.profileImage) as string} alt={artist.username} fill className="object-cover" priority unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted">
                                            <span className="text-5xl font-serif italic text-foreground/10">{artist.username.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 bg-green-500 w-6 h-6 rounded-xl border-4 border-card shadow-xl"></div>
                            </div>

                            {/* Info + Actions */}
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight mb-1">{artist.username}</h2>
                                        <p className="text-foreground/50 text-sm max-w-lg leading-relaxed">{artist.bio || 'No bio provided.'}</p>
                                        {/* ArtStation-style: skill tags */}
                                        {(artist as any).skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {(artist as any).skills.map((s: string, i: number) => (
                                                    <span key={i} className="text-[9px] font-black bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-widest">{s}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        {isSelf ? (
                                            <>
                                                <button onClick={handleTrend} className="bg-foreground text-background px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-lg">
                                                    <SparklesIcon className="w-4 h-4" /> Boost Profile
                                                </button>
                                                <Link href="/settings" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-border hover:bg-muted transition-all">
                                                    <CogIcon className="w-4 h-4" /> Settings
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex gap-2">
                                                    <FollowButton
                                                        targetUserId={String(artist.id)}
                                                        initialIsFollowing={isFollowing}
                                                        initialFansCount={artist.followersCount || 0}
                                                        targetFollowsMe={false}
                                                        size="lg"
                                                        onFollowChange={handleFollowChange}
                                                    />
                                                    <button 
                                                        onClick={handleMessage} 
                                                        className="h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                                    >
                                                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-white" />
                                                        Message
                                                    </button>
                                                    <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center rounded-xl bg-secondary border border-border hover:bg-muted transition-all text-slate-900">
                                                        {shareCopied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <ShareIcon className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <button onClick={handleVoteTrend} disabled={hasVoted} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${hasVoted ? 'bg-muted/30 text-foreground/40 border-border' : 'bg-primary/5 text-primary border-primary/40 hover:bg-primary/10'}`}>
                                                    {hasVoted ? `Voted ✨ ${trendVotes}` : `Vote ✨ ${trendVotes}`}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Stats row */}
                                <div className="flex flex-wrap gap-8 mt-8 justify-center md:justify-start">
                                    <div className="text-center md:text-left">
                                        <p className="text-3xl font-black font-serif tracking-tight">{artworks.length}</p>
                                        <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.3em] mt-0.5">Works</p>
                                    </div>
                                    <button onClick={() => handleOpenUserList('followers')} className="text-center md:text-left focus:outline-none group">
                                        <p className="text-3xl font-black font-serif tracking-tight group-hover:text-primary transition-colors">{artist.followersCount?.toLocaleString() || 0}</p>
                                        <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.3em] mt-0.5">Followers</p>
                                    </button>
                                    <button onClick={() => handleOpenUserList('following')} className="text-center md:text-left focus:outline-none group">
                                        <p className="text-3xl font-black font-serif tracking-tight group-hover:text-primary transition-colors">{(artist as any).followingCount?.toLocaleString() || 0}</p>
                                        <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.3em] mt-0.5">Following</p>
                                    </button>
                                    <div className="text-center md:text-left">
                                        <p className="text-3xl font-black font-serif tracking-tight">{totalLikes.toLocaleString()}</p>
                                        <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.3em] mt-0.5">Total Likes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Tab Navigation (ArtStation/Behance style) ── */}
                    <div className="border-t border-border px-6 md:px-10">
                        <div className="flex items-center gap-0 overflow-x-auto">
                            {(['portfolio', 'about', 'stats'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-4 text-[11px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-all ${activeTab === tab ? 'border-foreground text-foreground' : 'border-transparent text-foreground/60 hover:text-foreground/90'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PORTFOLIO TAB ── */}
                {activeTab === 'portfolio' && (
                    <div>
                        {/* Featured Work (Behance-style) */}
                        {featuredArtwork && (
                            <div className="mb-8 rounded-3xl overflow-hidden border border-border bg-card shadow-xl">
                                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                                    <SparklesIcon className="h-4 w-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Featured Work</span>
                                </div>
                                <div className="flex flex-col md:flex-row">
                                    <Link href={`/artwork/${(featuredArtwork as any)._id || featuredArtwork.id}`} className="relative md:w-72 aspect-[4/3] bg-muted block shrink-0">
                                        {featuredArtwork.imageUrl && (
                                            <Image src={getMediaUrl(featuredArtwork.imageUrl) as string} alt={featuredArtwork.title} fill className="object-cover" unoptimized />
                                        )}
                                    </Link>
                                    <div className="p-6 md:p-8 flex flex-col justify-center">
                                        <span className="inline-block bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 self-start">
                                            {featuredArtwork.category}
                                        </span>
                                        <h3 className="text-2xl font-black tracking-tight mb-2">{featuredArtwork.title}</h3>
                                        <p className="text-foreground/50 text-sm leading-relaxed mb-4 line-clamp-3">{featuredArtwork.description || 'No description.'}</p>
                                        <div className="flex items-center gap-6 text-[11px] font-black text-foreground/40 uppercase tracking-widest">
                                            <span>❤ {featuredArtwork.likes || 0} Likes</span>
                                            <span>💬 {featuredArtwork.comments || 0} Comments</span>
                                        </div>
                                        <Link href={`/artwork/${(featuredArtwork as any)._id || featuredArtwork.id}`} className="mt-5 self-start bg-foreground text-background text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl hover:scale-105 transition-all">
                                            View Full Work →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Category Filter + View Toggle (Dribbble style) */}
                        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                                <AdjustmentsHorizontalIcon className="h-4 w-4 text-foreground/40" />
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-all ${activeCategory === cat ? 'bg-foreground text-background' : 'bg-card border border-border text-foreground/40 hover:text-foreground hover:border-foreground/30'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-foreground text-background' : 'text-foreground/40 hover:text-foreground'}`}>
                                    <Squares2X2Icon className="h-4 w-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-foreground text-background' : 'text-foreground/40 hover:text-foreground'}`}>
                                    <ListBulletIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Artwork Grid / List */}
                        {filteredArtworks.length > 0 ? (
                            viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredArtworks.map((artwork, index) => (
                                        <div key={(artwork as any).id || (artwork as any)._id || index} className="group transition-transform duration-500 hover:-translate-y-1">
                                            <InteractiveArtworkCard artwork={artwork} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredArtworks.map((artwork, index) => (
                                        <Link key={(artwork as any).id || (artwork as any)._id || index} href={`/artwork/${(artwork as any)._id || artwork.id}`}
                                            className="flex items-center gap-5 bg-card border border-border rounded-2xl p-4 hover:border-foreground/20 transition-all group">
                                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                                                {artwork.imageUrl && <Image src={getMediaUrl(artwork.imageUrl) as string} alt={artwork.title} fill className="object-cover" unoptimized />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-widest">{artwork.category}</span>
                                                <h4 className="font-black text-foreground mt-1 line-clamp-1 group-hover:text-primary transition-colors">{artwork.title}</h4>
                                                <p className="text-foreground/40 text-xs line-clamp-1 mt-0.5">{artwork.description}</p>
                                            </div>
                                            <div className="text-right shrink-0 text-foreground/30">
                                                <p className="text-[10px] font-black">❤ {artwork.likes || 0}</p>
                                                <p className="text-[10px] font-black">💬 {artwork.comments || 0}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-32 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                                <SparklesIcon className="w-16 h-16 text-foreground/5 mx-auto mb-6" />
                                <p className="text-foreground/20 font-black uppercase tracking-widest text-xs">No artworks in this category yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ABOUT TAB ── */}
                {activeTab === 'about' && (
                    <div className="bg-card rounded-3xl border border-border p-8 md:p-12 space-y-8">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-3">Bio</h3>
                            <p className="text-foreground/70 leading-relaxed">{artist.bio || 'This artist has not added a bio yet.'}</p>
                        </div>
                        <div className="h-px bg-border" />
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-3">Member Since</h3>
                            <p className="font-black">{(artist as any).createdAt ? new Date((artist as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</p>
                        </div>
                        <div className="h-px bg-border" />
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-3">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.filter(c => c !== 'all').length > 0 ? categories.filter(c => c !== 'all').map((cat, i) => (
                                    <span key={i} className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{cat}</span>
                                )) : <p className="text-foreground/30 text-sm">No categories yet.</p>}
                            </div>
                        </div>

                        {(artist as any).socialMedia && Object.values((artist as any).socialMedia).some(val => val) && (
                            <>
                                <div className="h-px bg-border" />
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-4">Network & Support</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {(artist as any).socialMedia.patreon && (
                                            <a href={(artist as any).socialMedia.patreon} target="_blank" rel="noopener noreferrer" className="bg-[#FF424D] text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg hover:shadow-[#FF424D]/20">
                                                Support on Patreon
                                            </a>
                                        )}
                                        {Object.entries((artist as any).socialMedia).filter(([key, val]) => val && key !== 'patreon').map(([platform, link]) => (
                                            <a key={platform} href={link as string} target="_blank" rel="noopener noreferrer" className="bg-secondary text-secondary-foreground border border-border px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-muted transition-all">
                                                {platform}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── STATS TAB ── */}
                {activeTab === 'stats' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Works', value: artworks.length },
                            { label: 'Total Likes', value: totalLikes.toLocaleString() },
                            { label: 'Followers', value: (artist.followersCount || 0).toLocaleString() },
                            { label: 'Following', value: ((artist as any).followingCount || 0).toLocaleString() },
                            { label: 'Trend Votes', value: trendVotes },
                            { label: 'Categories', value: categories.length - 1 },
                            { label: 'Avg Likes/Work', value: artworks.length ? Math.round(totalLikes / artworks.length) : 0 },
                            { label: 'For Sale', value: artworks.filter(a => (a as any).isForSale).length },
                        ].map((stat, i) => (
                            <div key={i} className="bg-card border border-border rounded-2xl p-6 text-center">
                                <p className="text-3xl font-black font-serif tracking-tight">{stat.value}</p>
                                <p className="text-[9px] uppercase font-black text-foreground/30 tracking-[0.3em] mt-1.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <UserListModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalTitle}
                users={modalUsers}
                loading={modalLoading}
            />
        </div>
    );
}
