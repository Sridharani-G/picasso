"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/SessionProvider';
import SessionManager from '@/utils/sessionManager';
import {
  Square3Stack3DIcon,
  UserGroupIcon as FansIcon,
  LightBulbIcon as InspoIcon,
  ChartBarIcon,
  HomeIcon,
  PencilSquareIcon,
  FireIcon,
  HeartIcon as SupportIcon,
  CheckBadgeIcon,
  ArrowUpTrayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import UserListModal from '@/components/ui/UserListModal';
import { getApiUrl, getMediaUrl } from '@/utils/apiClient';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('post');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [artworks, setArtworks] = useState<any[]>([]);

  useEffect(() => {
    const token = SessionManager.getToken();
    const userData = SessionManager.getUser();
    if (!token || !userData) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(userData);

    // Refresh user data from API to get accurate counts
    const fetchLatestProfile = async () => {
      try {
        const apiUrl = getApiUrl();
        const response = await fetch(`${apiUrl}/users/${userData.id || userData._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Also fetch artworks
          const artworkResponse = await fetch(`${apiUrl}/users/${data.user.id || data.user._id}/artworks`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (artworkResponse.ok) {
            const artworkData = await artworkResponse.json();
            setArtworks(artworkData.artworks || []);
          }
        }
      } catch (err) {
        console.error('Failed to refresh profile:', err);
      }
    };
    fetchLatestProfile();
  }, []);

  const handleOpenUserList = async (type: 'followers' | 'following') => {
    setModalTitle(type === 'followers' ? 'Fans' : 'Inspo');
    setModalOpen(true);
    setModalLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${user.id || user._id}/${type}`);
      if (response.ok) {
        const data = await response.json();
        setModalUsers(data[type] || []);
      }
    } catch (err) {
      console.error('Failed to fetch user list:', err);
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-foreground/20" />
      </div>
    );
  }

  const handleSubscribe = async (tierId: string) => {
    try {
      const token = SessionManager.getToken();
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${user.id || user._id}/subscribe/${tierId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Subscription successful! Welcome to the inner circle.');
      } else {
        alert(data.message || 'Subscription failed');
      }
    } catch (err) {
      alert('Network failure');
    }
  };

  return (
    <div className="w-full text-foreground pb-24">
      {/* Profile Banner */}
      <div className="relative w-full h-[20vh] md:h-[25vh] overflow-hidden group bg-muted">
        {user.bannerUrl ? (
          <Image 
            src={getMediaUrl(user.bannerUrl) as string} 
            alt="Profile Banner" 
            fill 
            className="object-cover transition-transform duration-1000 group-hover:scale-105" 
            priority
            unoptimized 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        
        {/* Banner Overlay Controls */}
        <div className="absolute top-4 right-6 flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href="/settings" className="px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-white/20 transition-all">
                Update Visuals
            </Link>
        </div>
      </div>

      {/* Profile Nav Bar (Sticky) */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl overflow-hidden border border-border transition-all duration-500 ${activeTab !== 'post' ? 'opacity-100 shadow-xl' : 'opacity-0 scale-50'}`}>
                {user.profileImage && <Image src={getMediaUrl(user.profileImage) as string} alt="Mini Avatar" width={40} height={40} className="object-cover" unoptimized />}
              </div>
              <h1 className="text-lg font-serif font-black tracking-tight uppercase italic truncate">
                {user.username} {user.isVerified && <CheckBadgeIcon className="w-5 h-5 text-primary inline-block mb-1" />}
              </h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/upload"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Link>
            <Link href="/" className="p-2.5 bg-muted rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
              <HomeIcon className="w-5 h-5" />
            </Link>
          </div>
      </div>

      <div className="px-6 md:px-12 -mt-16 relative z-10">
        {/* Main Info Card */}
        <div className="bg-card/50 backdrop-blur-3xl rounded-[2rem] border border-border shadow-2xl overflow-hidden mb-8">
          <div className="pt-16 pb-6 px-6 md:pt-20 md:pb-10 md:px-12">
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-8 md:space-y-0 md:space-x-12 border-b border-border/50 pb-10 mb-10">
              <div className="relative">
                <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-background border border-border p-1 shadow-2xl rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
                  <div className="w-full h-full rounded-[1.75rem] bg-muted flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <div className="relative w-full h-full">
                        <Image src={getMediaUrl(user.profileImage) as string} alt="avatar" fill className="object-cover" unoptimized />
                      </div>
                    ) : (
                      <span className="text-7xl font-serif italic text-foreground/10">{user.username?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest rotate-6 shadow-xl">
                  {user.role}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-6">
                  <div>
                    <p className="text-3xl md:text-4xl font-serif font-black tracking-tighter mb-1 italic leading-tight">
                      {user.displayName || user.username}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">
                      @{user.username}
                    </p>
                  </div>
                  <Link href="/settings" className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-foreground/20 hover:text-foreground transition-colors group">
                    <PencilSquareIcon className="w-4 h-4" />
                    <span>Edit Profile Content</span>
                  </Link>
                </div>
                <div className="max-w-2xl bg-muted/30 p-8 rounded-[2rem] border border-border/30">
                  <p className="text-sm font-medium text-foreground/60 leading-relaxed italic">
                    {user.bio || 'Architect has not yet declared their creative intentions.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleOpenUserList('followers')}
                className="p-5 bg-background rounded-[1.5rem] border border-border group hover:border-primary/30 transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-xl text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <FansIcon className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Fans</span>
                </div>
                <p className="text-2xl font-serif font-black italic">{(user.followersCount || 0).toLocaleString()}</p>
                <p className="text-[7px] uppercase font-black tracking-[0.2em] text-foreground/10 mt-1">Active Witnesses</p>
              </button>

              <button
                onClick={() => handleOpenUserList('following')}
                className="p-5 bg-background rounded-[1.5rem] border border-border group hover:border-primary/30 transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-xl text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <InspoIcon className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Inspo</span>
                </div>
                <p className="text-2xl font-serif font-black italic">{(user.followingCount || 0).toLocaleString()}</p>
                <p className="text-[7px] uppercase font-black tracking-[0.2em] text-foreground/10 mt-1">Entities Followed</p>
              </button>

              <div className="p-5 bg-background rounded-[1.5rem] border border-border group hover:border-primary/30 transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <Square3Stack3DIcon className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Works</span>
                </div>
                <p className="text-2xl font-serif font-black italic">{artworks.length}</p>
                <p className="text-[7px] uppercase font-black tracking-[0.2em] text-foreground/10 mt-1">Artifacts Published</p>
              </div>

              <div className="p-5 bg-background rounded-[1.5rem] border border-border group hover:border-primary/30 transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <FireIcon className="w-4 h-4 text-foreground/10 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Trend ✨</span>
                </div>
                <p className="text-2xl font-serif font-black italic">{user.trendVotes || 0}</p>
                <p className="text-[7px] uppercase font-black tracking-[0.2em] text-foreground/10 mt-1">{siteConfig.shortName} Trajectory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center space-x-8 px-4 mb-8 border-b border-border/10 pb-4 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab('post')}
            className={`text-[10px] font-black uppercase tracking-[0.4em] pb-4 -mb-4 italic transition-all shrink-0 ${activeTab === 'post' ? 'text-primary border-b-2 border-primary' : 'text-foreground/20 hover:text-foreground'}`}
          >
            Artifacts
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`text-[10px] font-black uppercase tracking-[0.4em] pb-4 -mb-4 italic transition-all shrink-0 ${activeTab === 'shop' ? 'text-primary border-b-2 border-primary' : 'text-foreground/20 hover:text-foreground'}`}
          >
            Shop
          </button>
        </div>

        {/* Dynamic Content Area */}
        {activeTab === 'post' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 px-1 md:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Upload tile — always first */}
            <Link
              href="/upload"
              className="group aspect-square relative bg-primary/5 rounded-xl md:rounded-2xl border-2 border-dashed border-primary/30 overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-2xl hover:border-primary/60 hover:bg-primary/10 flex flex-col items-center justify-center gap-3 p-4"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <PlusIcon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors text-center">New Upload</p>
            </Link>

            {artworks.length > 0 ? (
              artworks.map((artwork) => (
                <Link key={artwork.id || artwork._id} href={`/artwork/${artwork.id || artwork._id}`} className="group aspect-square relative bg-muted/20 rounded-xl md:rounded-2xl border border-border/50 overflow-hidden transition-all hover:translate-y-[-4px] hover:shadow-2xl">
                  {artwork.mediaUrl ? (
                    <Image
                      src={getMediaUrl(artwork.mediaUrl) as string}
                      alt={artwork.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Square3Stack3DIcon className="w-8 h-8 text-foreground/10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-white font-serif italic text-base mb-0.5">{artwork.title}</p>
                    <p className="text-white/60 text-[8px] font-black uppercase tracking-widest">{artwork.category}</p>
                  </div>
                </Link>
              ))
            ) : (
              /* Empty state CTA */
              <div className="col-span-2 aspect-square md:aspect-auto md:min-h-[300px] bg-muted/10 rounded-[0.5rem] md:rounded-[2.5rem] border border-dashed border-border flex flex-col items-center justify-center p-12 text-center gap-6">
                <ArrowUpTrayIcon className="w-14 h-14 text-foreground/10" />
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-foreground/30 mb-2">No Artifacts Yet</p>
                  <p className="text-[10px] text-foreground/20 uppercase tracking-wider max-w-[200px] mx-auto leading-relaxed">Share your first artwork with the world</p>
                </div>
                <Link
                  href="/upload"
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Upload Now
                </Link>
              </div>
            )}
          </div>

        ) : (
          <div className="bg-card rounded-[3rem] p-16 text-center border border-border border-dashed animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
              <FireIcon className="w-10 h-10 text-foreground/10" />
            </div>
            <h3 className="text-xl font-serif font-black mb-4 uppercase italic">Artistic Commerce</h3>
            <p className="text-[11px] font-black text-foreground/20 uppercase tracking-[0.3em] max-w-sm mx-auto leading-loose">
              You haven't listed any artifacts for direct acquisition yet. Refine your inventory and publish to the global marketplace.
            </p>
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
