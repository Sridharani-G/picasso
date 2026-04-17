'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { getApiUrl, getMediaUrl } from '@/utils/apiClient';
import SessionManager from '@/utils/sessionManager';
import { User } from '@/types';
import Button from '@/components/ui/Button';
import InteractiveArtworkCard from '@/components/artwork/InteractiveArtworkCard';
import {
  UserIcon,
  Square3Stack3DIcon,
  BookmarkIcon,
  ClockIcon,
  NoSymbolIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeIcon,
  ShoppingBagIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  HeartIcon as SupportIcon,
  PlusIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSegment, setActiveSegment] = useState('account');
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
    socialLinks: {
      instagram: '',
      tiktok: '',
      youtube: '',
      twitter: '',
      artstation: '',
    },
    upiId: '',
    timeSettings: {
      syncLimit: 60,
      quietMode: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    commentSettings: {
      globalModeration: true,
      allowInteractions: 'all' as 'all' | 'following' | 'none'
    },
    bannerUrl: '',
    patronTiers: [] as { name: string; price: number; description: string; perks: string[] }[]
  });
  const [savedArtworks, setSavedArtworks] = useState<any[]>([]);
  const [ownArtworks, setOwnArtworks] = useState<any[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  const [segmentLoading, setSegmentLoading] = useState(false);

  const menuItems = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'patronage', label: 'Subscriptions', icon: SupportIcon },
    { id: 'post', label: 'My Posts', icon: Square3Stack3DIcon },
    { id: 'save_post', label: 'Saved Posts', icon: BookmarkIcon },
    { id: 'time', label: 'Time Management', icon: ClockIcon },
    { id: 'block', label: 'Blocked Accounts', icon: NoSymbolIcon },
    { id: 'comment', label: 'Comment Settings', icon: ChatBubbleBottomCenterTextIcon },
    { id: 'security', label: 'Password & Security', icon: ShieldCheckIcon },
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon },
    { id: 'shop', label: 'Shop Settings', icon: ShoppingBagIcon },
    { id: 'help', label: 'Help Center', icon: QuestionMarkCircleIcon },
    { id: 'support', label: 'Support & Feedback', icon: LifebuoyIcon },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheckIcon },
    { id: 'about', label: 'About', icon: InformationCircleIcon },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_UPLOAD = 250 * 1024 * 1024;
      if (file.size > MAX_UPLOAD) {
        alert('File is too large. Max 250MB allowed.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          avatar: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          bannerUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      patronTiers: [...prev.patronTiers, { name: 'New Tier', price: 5, description: 'Exclusive perks for supporters.', perks: ['Discord Access'] }]
    }));
  };

  const removeTier = (index: number) => {
    setFormData(prev => ({
      ...prev,
      patronTiers: prev.patronTiers.filter((_, i) => i !== index)
    }));
  };

  const updateTier = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newTiers = [...prev.patronTiers];
      (newTiers[index] as any)[field] = value;
      return { ...prev, patronTiers: newTiers };
    });
  };

  const addPerk = (tierIndex: number) => {
    setFormData(prev => {
      const newTiers = [...prev.patronTiers];
      newTiers[tierIndex].perks.push('New Perk');
      return { ...prev, patronTiers: newTiers };
    });
  };

  const removePerk = (tierIndex: number, perkIndex: number) => {
    setFormData(prev => {
      const newTiers = [...prev.patronTiers];
      newTiers[tierIndex].perks = newTiers[tierIndex].perks.filter((_, i) => i !== perkIndex);
      return { ...prev, patronTiers: newTiers };
    });
  };

  const updatePerk = (tierIndex: number, perkIndex: number, value: string) => {
    setFormData(prev => {
      const newTiers = [...prev.patronTiers];
      newTiers[tierIndex].perks[perkIndex] = value;
      return { ...prev, patronTiers: newTiers };
    });
  };

  useEffect(() => {
    const token = SessionManager.getToken();
    const userData = SessionManager.getUser();

    if (!token || !userData) {
      window.location.href = '/auth/login';
      return;
    }

    setUser(userData);
    setFormData({
      username: userData.username || '',
      email: userData.email || '',
      bio: userData.bio || '',
      avatar: userData.profileImage || '',
      socialLinks: userData.socialMedia || {
        instagram: '',
        tiktok: '',
        youtube: '',
        twitter: '',
        artstation: '',
      },
      upiId: userData.upiId || '',
      timeSettings: userData.timeSettings || {
        syncLimit: 60,
        quietMode: { enabled: false, start: '22:00', end: '08:00' }
      },
      commentSettings: userData.commentSettings || {
        globalModeration: true,
        allowInteractions: 'all'
      },
      bannerUrl: userData.bannerUrl || '',
      patronTiers: userData.patronTiers || []
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    if (activeSegment === 'save_post') fetchSavedPosts();
    if (activeSegment === 'post') fetchOwnPosts();
    if (activeSegment === 'block') fetchBlockedUsers();
  }, [activeSegment]);

  const fetchSavedPosts = async () => {
    setSegmentLoading(true);
    try {
      const { apiFetch } = await import('@/utils/apiClient');
      const res = await apiFetch('/users/profile/saved');
      if (res.ok) {
        const data = await res.json();
        setSavedArtworks(data.artworks || []);
      }
    } catch (err) {
      console.error('Failed to fetch saved posts', err);
    } finally {
      setSegmentLoading(false);
    }
  };

  const fetchOwnPosts = async () => {
    setSegmentLoading(true);
    try {
      const { apiFetch } = await import('@/utils/apiClient');
      const res = await apiFetch(`/users/${user?.id}/artworks`);
      if (res.ok) {
        const data = await res.json();
        setOwnArtworks(data.artworks || []);
      }
    } catch (err) {
      console.error('Failed to fetch own posts', err);
    } finally {
      setSegmentLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    setSegmentLoading(true);
    try {
      const { apiFetch } = await import('@/utils/apiClient');
      const res = await apiFetch('/users/block');
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (err) {
      console.error('Failed to fetch blocked users', err);
    } finally {
      setSegmentLoading(false);
    }
  };

  const handleUnblock = async (targetId: string) => {
    try {
      const { apiFetch } = await import('@/utils/apiClient');
      const res = await apiFetch(`/users/unblock/${targetId}`, { method: 'POST' });
      if (res.ok) {
        setBlockedUsers(prev => prev.filter(u => u.id !== targetId));
      }
    } catch (err) {
      console.error('Failed to unblock user', err);
    }
  };

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!window.confirm('Delete this artwork permanently?')) return;
    try {
      const { apiFetch } = await import('@/utils/apiClient');
      const res = await apiFetch(`/artworks/${artworkId}`, { method: 'DELETE' });
      if (res.ok) {
        setOwnArtworks(prev => prev.filter(a => a.id !== artworkId && a._id !== artworkId));
      }
    } catch (err) {
      console.error('Failed to delete artwork', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SessionManager.getToken()}`
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          bio: formData.bio,
          profileImage: formData.avatar,
          socialMedia: formData.socialLinks,
          upiId: formData.upiId,
          timeSettings: formData.timeSettings,
          commentSettings: formData.commentSettings,
          bannerUrl: formData.bannerUrl,
          patronTiers: formData.patronTiers
        })
      });

      if (response.ok) {
        alert('Settings updated successfully!');
        const data = await response.json();
        const updatedUser = { ...user, ...data.user };
        SessionManager.saveSession(SessionManager.getToken() || '', updatedUser, true);
        setUser(updatedUser);
        
        // Redirect to profile page
        router.push('/profile');
      } else {
        const errorData = await response.json();
        alert(`Failed to update settings: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data.'
    );
    if (!confirmed) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        SessionManager.logout();
        window.location.href = '/';
      } else {
        const err = await response.json();
        alert('Failed to delete account: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Delete account error', err);
      alert('Error deleting account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif font-black mb-12 tracking-tight uppercase italic">
          Settings <span className="text-foreground/60 italic capitalize font-normal tracking-normal">// Preferences</span>
        </h1>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Settings Sidebar */}
          <aside className={`${showMobileMenu ? 'block' : 'hidden'} md:block w-full md:w-80 shrink-0`}>
            <div className="sticky top-24 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSegment(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${activeSegment === item.id
                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20'
                    : 'hover:bg-muted text-foreground/40 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRightIcon className={`w-4 h-4 transition-transform ${activeSegment === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>
          </aside>

          {/* Settings Content */}
          <main className={`${!showMobileMenu ? 'block' : 'hidden'} md:block flex-1`}>
            {/* Mobile Back Button */}
            {!showMobileMenu && (
              <button 
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-8 transition-all active:scale-95"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Settings
              </button>
            )}

            {activeSegment === 'account' && (
              <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                  <h2 className="text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-foreground/60">Profile Images</h2>
                  <div className="space-y-12">
                     <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-10">
                        <div className="relative group">
                          <div className="w-40 h-40 rounded-[2.5rem] border border-border shadow-2xl overflow-hidden bg-background flex items-center justify-center rotate-[-3deg]">
                            {formData.avatar ? (
                              <img src={getMediaUrl(formData.avatar) as string} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-6xl font-serif italic text-foreground/10">
                                {formData.username.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 group-hover:opacity-100 rounded-[2.5rem] cursor-pointer transition-opacity border border-white/20">
                            <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                          </label>
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </div>

                        <div className="flex-1 w-full">
                          <div className="flex items-center justify-between mb-4">
                            <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em]">
                              Profile Picture
                            </label>
                            <button
                                type="button"
                                onClick={() => document.getElementById('avatar-upload')?.click()}
                                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline transition-all"
                              >
                                Upload Avatar
                            </button>
                          </div>
                          <p className="text-[11px] text-foreground/40 italic leading-relaxed">Choose an image for your profile on Picasso.</p>
                        </div>
                     </div>

                     <div className="pt-12 border-t border-border/50">
                        <div className="flex items-center justify-between mb-6">
                            <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-[0.3em]">Profile Banner</label>
                            <div className="space-x-4">
                                {formData.bannerUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, bannerUrl: '' }))}
                                        className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:underline transition-all"
                                    >
                                        Remove Banner
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => document.getElementById('banner-upload')?.click()}
                                    className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline transition-all"
                                >
                                    Upload Banner
                                </button>
                            </div>
                        </div>
                        <div className="relative h-48 rounded-[2rem] border border-border bg-background overflow-hidden group">
                           {formData.bannerUrl ? (
                             <img src={getMediaUrl(formData.bannerUrl) as string} alt="Banner" className="w-full h-full object-cover" />
                           ) : (
                             <div className="w-full h-full bg-gradient-to-r from-muted/20 via-background to-muted/20 flex items-center justify-center">
                                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-foreground/5 italic">No Banner Image</span>
                             </div>
                           )}
                           <label htmlFor="banner-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                              <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-6 py-3 rounded-full">Replace Banner</span>
                           </label>
                           <input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                        </div>
                        <p className="mt-4 text-[10px] text-foreground/30 font-medium italic">High-resolution banners (1500x500px suggested) look best.</p>
                     </div>
                  </div>
                </div>

                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                  <h2 className="text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-foreground/60">Account Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                      <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  {user?.isArtist && (
                    <div className="mt-12 pt-12 border-t border-border">
                      <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">
                        Payment Info (UPI ID)
                      </label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleChange}
                        placeholder="yourname@upi"
                        className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm placeholder:text-foreground/10"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                  <h2 className="text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-foreground/60">Bio / Description</h2>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-background border border-border rounded-2xl px-6 py-6 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm resize-none placeholder:text-foreground/10 leading-relaxed font-medium"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                  <h2 className="text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-foreground/60">Social Media</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {[
                      { id: 'patreon', label: 'Patreon' },
                      { id: 'instagram', label: 'Instagram' },
                      { id: 'tiktok', label: 'TikTok' },
                      { id: 'youtube', label: 'YouTube' },
                      { id: 'twitter', label: 'X (Twitter)' },
                      { id: 'artstation', label: 'ArtStation' }
                    ].map((social) => (
                      <div key={social.id}>
                        <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">
                          {social.label}
                        </label>
                        <input
                          type="url"
                          name={social.id}
                          value={(formData.socialLinks as any)[social.id]}
                          onChange={handleSocialChange}
                          className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm placeholder:text-foreground/10"
                          placeholder={`https://${social.id}.com/username`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-12 gap-8 border-t border-border">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.3em] hover:text-red-500 transition-colors italic px-4 py-2"
                  >
                    Delete My Account
                  </button>

                  <button
                    type="submit"
                    className="w-full md:w-auto bg-primary text-primary-foreground px-16 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeSegment === 'patronage' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-12 border border-border shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 pb-12 border-b border-border/50">
                      <div>
                        <h2 className="text-2xl font-serif font-black uppercase italic mb-2 tracking-tighter">Subscription Tiers</h2>
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Manage your membership tiers for supporters.</p>
                      </div>
                      <button 
                        onClick={addTier}
                        className="px-10 py-4 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center space-x-3"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add New Tier</span>
                      </button>
                   </div>

                   <div className="space-y-8">
                      {formData.patronTiers.length > 0 ? (
                        formData.patronTiers.map((tier, tIdx) => (
                           <div key={tIdx} className="bg-background/50 border border-border p-10 rounded-[2.5rem] relative group">
                              <button 
                                onClick={() => removeTier(tIdx)}
                                className="absolute top-6 right-6 p-2 text-foreground/20 hover:text-red-500 transition-colors"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                                 <div className="space-y-6">
                                    <div>
                                       <label className="block text-[9px] font-black text-foreground/40 mb-3 uppercase tracking-widest">Tier Name</label>
                                       <input 
                                          type="text" 
                                          value={tier.name}
                                          onChange={(e) => updateTier(tIdx, 'name', e.target.value)}
                                          className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-primary text-sm font-black uppercase tracking-wider"
                                       />
                                    </div>
                                    <div>
                                       <label className="block text-[9px] font-black text-foreground/40 mb-3 uppercase tracking-widest">Monthly Price ($)</label>
                                       <input 
                                          type="number" 
                                          value={tier.price}
                                          onChange={(e) => updateTier(tIdx, 'price', Number(e.target.value))}
                                          className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-primary text-lg font-mono font-black italic"
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="block text-[9px] font-black text-foreground/40 mb-3 uppercase tracking-widest">Description</label>
                                    <textarea 
                                       value={tier.description}
                                       onChange={(e) => updateTier(tIdx, 'description', e.target.value)}
                                       rows={4}
                                       className="w-full bg-background border border-border rounded-xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-primary text-xs font-medium resize-none leading-relaxed italic"
                                       placeholder="What makes this bracket special?"
                                    />
                                 </div>
                              </div>

                              <div>
                                 <div className="flex items-center justify-between mb-4">
                                    <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">Tier Benefits / Perks</label>
                                    <button 
                                       onClick={() => addPerk(tIdx)}
                                       className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
                                    >
                                       + Add Perk
                                    </button>
                                 </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tier.perks.map((perk, pIdx) => (
                                       <div key={pIdx} className="flex items-center space-x-3 group/perk">
                                          <input 
                                             type="text" 
                                             value={perk}
                                             onChange={(e) => updatePerk(tIdx, pIdx, e.target.value)}
                                             className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary transition-all"
                                          />
                                          <button 
                                             onClick={() => removePerk(tIdx, pIdx)}
                                             className="p-2 opacity-0 group-perk-hover:opacity-100 text-foreground/20 hover:text-red-500 transition-all"
                                          >
                                             <TrashIcon className="w-4 h-4" />
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        ))
                      ) : (
                        <div className="text-center py-16">
                           <p className="text-[11px] font-black text-foreground/20 uppercase tracking-[0.4em] italic mb-8 italic">No tiers created yet.</p>
                           <SupportIcon className="w-12 h-12 text-foreground/5 mx-auto" />
                        </div>
                      )}
                   </div>

                   <div className="mt-12 pt-12 border-t border-border/50 flex justify-end">
                      <button 
                        onClick={handleSubmit}
                        className="px-16 py-4 bg-primary text-primary-foreground rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Save Tiers
                      </button>
                   </div>
                </div>
              </div>
            )}

            {activeSegment === 'save_post' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 italic">Saved Artworks</h2>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{savedArtworks.length} Items</span>
                </div>
                {segmentLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square bg-muted animate-pulse rounded-[2.5rem] border border-border" />
                    ))}
                  </div>
                ) : savedArtworks.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10">
                    {savedArtworks.map((art, idx) => (
                      <div key={art.id || (art as any)._id || idx} className="relative group">
                        <InteractiveArtworkCard artwork={art} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-[2.5rem] p-12 md:p-20 border border-border shadow-2xl text-center">
                    <BookmarkIcon className="w-16 h-16 text-foreground/5 mx-auto mb-8" />
                    <p className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.3em]">You haven't saved any artworks yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'post' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 italic">Manage My Artworks</h2>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">{ownArtworks.length} Items</span>
                </div>
                {segmentLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl border border-border" />
                    ))}
                  </div>
                ) : ownArtworks.length > 0 ? (
                  <div className="space-y-4">
                    {ownArtworks.map((art, idx) => (
                      <div key={art.id || (art as any)._id || idx} className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between hover:border-foreground/20 transition-all group shadow-xl">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-background">
                            <img src={getMediaUrl(art.mediaUrl) as string} alt={art.title} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-black text-xs uppercase tracking-widest">{art.title}</h4>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-tight mt-1">{art.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => window.location.href = `/art/${art.id || art._id}`}
                            className="text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDeleteArtwork(art.id || art._id)}
                            className="text-[9px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-[2.5rem] p-12 md:p-20 border border-border shadow-2xl text-center">
                    <Square3Stack3DIcon className="w-16 h-16 text-foreground/5 mx-auto mb-8" />
                    <p className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.3em]">You haven't uploaded any artworks yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'block' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 italic">Blocked Users</h2>
                {segmentLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl border border-border" />
                    ))}
                  </div>
                ) : blockedUsers.length > 0 ? (
                  <div className="space-y-4">
                    {blockedUsers.map((bu, idx) => (
                      <div key={bu.id || (bu as any)._id || idx} className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between group shadow-xl">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-xl border border-border overflow-hidden bg-background flex items-center justify-center">
                            {bu.profileImage ? (
                                <img src={bu.profileImage} alt={bu.username} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xl font-serif italic text-foreground/10">{bu.username.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-xs uppercase tracking-widest">{bu.username}</h4>
                            <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-tight mt-1">Blocked</p>
                          </div>
                        </div>
                        <button 
                            onClick={() => handleUnblock(bu.id || bu._id)}
                            className="bg-muted hover:bg-foreground hover:text-background text-[9px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-lg transition-all"
                        >
                            Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-card rounded-[2.5rem] p-12 md:p-20 border border-border shadow-2xl text-center">
                    <NoSymbolIcon className="w-16 h-16 text-foreground/5 mx-auto mb-8" />
                    <p className="text-[11px] font-black text-foreground/60 uppercase tracking-[0.3em]">No blocked users found.</p>
                  </div>
                )}
              </div>
            )}

            {activeSegment === 'shop' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-8 uppercase tracking-[0.3em] text-foreground/60">Payment Settings</h2>
                    <div className="space-y-12">
                        <div>
                            <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">
                                Payment Method (UPI ID)
                            </label>
                            <input
                                type="text"
                                name="upiId"
                                value={formData.upiId}
                                onChange={handleChange}
                                placeholder="yourname@upi"
                                className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
                            />
                            <p className="mt-4 text-[9px] font-bold text-foreground/60 uppercase tracking-widest italic">This UPI ID will be used for payments when someone buys your art.</p>
                        </div>
                        <button 
                            onClick={handleSubmit}
                            className="bg-primary text-primary-foreground px-12 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Save Payment Info
                        </button>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'about' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <div className="flex items-center space-x-6 mb-12">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-serif text-3xl font-black italic text-primary-foreground shadow-2xl rotate-[-6deg]">A</div>
                        <div>
                            <h2 className="text-2xl font-serif font-black uppercase italic tracking-tighter">{siteConfig.shortName} <span className="text-foreground/60 italic capitalize font-normal tracking-normal">Platform</span></h2>
                            <p className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.3em]">v4.0.2 Stable Core</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest">About the System</h4>
                            <p className="text-[11px] leading-loose text-foreground/60 font-medium uppercase tracking-tight">{siteConfig.name} is a creative community designed for artists to share and explore art freely.</p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Connectivity</h4>
                            <div className="flex flex-col space-y-3">
                                <span className="text-[10px] font-black uppercase text-foreground/60">Uptime: 99.9%</span>
                                <span className="text-[10px] font-black uppercase text-foreground/60">Sync Latency: 24ms</span>
                                <span className="text-[10px] font-black uppercase text-foreground/60">Encryption: AES-256</span>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'help' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Help Center / FAQ</h2>
                    <div className="space-y-8">
                        {[
                          { q: "How do I upload art?", a: "Go to the 'Upload' section and share your high-quality files." },
                          { q: "What is the Studio feature?", a: "A tool for creating art directly in your browser." },
                          { q: "How do payments work?", a: "Payments are made directly via your UPI ID." },
                          { q: "Is my data safe?", a: "Yes, we use industry-standard encryption for all data." }
                        ].map((faq, i) => (
                           <div key={i} className="space-y-3 pb-8 border-b border-border/50 last:border-0 last:pb-0">
                              <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground">{faq.q}</h4>
                              <p className="text-[11px] text-foreground/50 leading-relaxed font-medium">{faq.a}</p>
                           </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'support' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl text-center">
                    <LifebuoyIcon className="w-16 h-16 text-primary/20 mx-auto mb-8 animate-pulse" />
                    <h2 className="text-2xl font-serif font-black uppercase italic mb-4">Support</h2>
                    <p className="text-[11px] font-black text-foreground/40 uppercase tracking-[0.2em] mb-12 italic">Need help from our team?</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="p-8 bg-background border border-border rounded-3xl">
                           <h4 className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-4">Email Channel</h4>
                           <p className="text-xs font-black italic text-primary">support@arthub.matrix</p>
                        </div>
                        <div className="p-8 bg-background border border-border rounded-3xl">
                           <h4 className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-4">Response Time</h4>
                           <p className="text-xs font-black italic text-foreground/60">Within a few hours</p>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'privacy' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Privacy Policy</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/60">
                        <div className="space-y-8">
                           <section>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-4">Your Data</h4>
                              <p className="text-[11px] leading-loose uppercase tracking-tight">Your data belongs to you. We don't sell your personal information to third parties. All your settings are kept secure.</p>
                           </section>
                           <section>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-4">Security</h4>
                              <p className="text-[11px] leading-loose uppercase tracking-tight">All interactions with our site are encrypted and secure. We work to keep your account safe from unauthorized access.</p>
                           </section>
                           <section>
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-4">Cookies</h4>
                              <p className="text-[11px] leading-loose uppercase tracking-tight">We use cookies only for essential site functions, like keeping you logged in.</p>
                           </section>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'time' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Time Limits</h2>
                    <div className="space-y-12">
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <label className="block text-[10px] font-black text-foreground/60 uppercase tracking-widest">
                                    Daily App Use Limit
                                </label>
                                <span className="text-xs font-black italic">{formData.timeSettings.syncLimit} mins</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="240"
                                step="10"
                                value={formData.timeSettings.syncLimit}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    timeSettings: { ...prev.timeSettings, syncLimit: parseInt(e.target.value) }
                                }))}
                                className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <p className="mt-4 text-[9px] font-bold text-foreground/60 uppercase tracking-widest italic">Set how long you want to use the app each day.</p>
                        </div>

                        <div className="pt-8 border-t border-border">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Quiet Mode</h4>
                                    <p className="text-[9px] text-foreground/60 uppercase font-bold tracking-tight mt-1">Stop receiving notifications during certain hours.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        timeSettings: { 
                                            ...prev.timeSettings, 
                                            quietMode: { ...prev.timeSettings.quietMode, enabled: !prev.timeSettings.quietMode.enabled } 
                                        }
                                    }))}
                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.timeSettings.quietMode.enabled ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${formData.timeSettings.quietMode.enabled ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                             {formData.timeSettings.quietMode.enabled && (
                                <div className="grid grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
                                    <div>
                                        <label className="block text-[9px] font-black text-foreground/60 mb-3 uppercase tracking-widest">Start Time</label>
                                        <input
                                            type="time"
                                            value={formData.timeSettings.quietMode.start}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                timeSettings: { 
                                                    ...prev.timeSettings, 
                                                    quietMode: { ...prev.timeSettings.quietMode, start: e.target.value } 
                                                }
                                            }))}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-foreground/60 mb-3 uppercase tracking-widest">End Time</label>
                                        <input
                                            type="time"
                                            value={formData.timeSettings.quietMode.end}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                timeSettings: { 
                                                    ...prev.timeSettings, 
                                                    quietMode: { ...prev.timeSettings.quietMode, end: e.target.value } 
                                                }
                                            }))}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSubmit}
                            className="bg-primary text-primary-foreground px-12 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Save Time Settings
                        </button>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'comment' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Comment Settings</h2>
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Auto-Moderation</h4>
                                <p className="text-[9px] text-foreground/60 uppercase font-bold tracking-tight mt-1">Automatically hide offensive or spam comments.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    commentSettings: { ...prev.commentSettings, globalModeration: !prev.commentSettings.globalModeration }
                                }))}
                                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.commentSettings.globalModeration ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${formData.commentSettings.globalModeration ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="pt-8 border-t border-border">
                            <label className="block text-[10px] font-black text-foreground/60 mb-6 uppercase tracking-widest">
                                Who can comment?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['all', 'following', 'none'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            commentSettings: { ...prev.commentSettings, allowInteractions: opt }
                                        }))}
                                        className={`px-6 py-4 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                                            formData.commentSettings.allowInteractions === opt 
                                            ? 'bg-foreground text-background border-foreground shadow-lg' 
                                            : 'border-border text-foreground/40 hover:border-foreground/20'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleSubmit}
                            className="bg-primary text-primary-foreground px-12 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Save Comment Settings
                        </button>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'accessibility' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60">Accessibility</h2>
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest">High Contrast</h4>
                                <p className="text-[9px] text-foreground/60 uppercase font-bold tracking-tight mt-1">Make colors more visible.</p>
                            </div>
                            <div className="w-12 h-6 bg-muted rounded-full relative cursor-not-allowed">
                                <div className="w-4 h-4 bg-foreground/20 rounded-full absolute left-1 top-1" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Reduce Motion</h4>
                                <p className="text-[9px] text-foreground/60 uppercase font-bold tracking-tight mt-1">Turn off moving effects.</p>
                            </div>
                            <div className="w-12 h-6 bg-primary rounded-full relative cursor-not-allowed">
                                <div className="w-4 h-4 bg-primary-foreground rounded-full absolute right-1 top-1" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest">Clearer Text</h4>
                                <p className="text-[9px] text-foreground/60 uppercase font-bold tracking-tight mt-1">Make text easier to read.</p>
                            </div>
                            <div className="w-12 h-6 bg-muted rounded-full relative cursor-not-allowed">
                                <div className="w-4 h-4 bg-foreground/20 rounded-full absolute left-1 top-1" />
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeSegment === 'security' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Security</h2>
                    <div className="space-y-8 max-w-md">
                        <div>
                            <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">Current Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">New Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-foreground/60 mb-4 uppercase tracking-widest">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-background border border-border rounded-xl px-4 py-4 focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                        <button className="bg-foreground text-background text-[10px] font-black uppercase tracking-[0.3em] px-10 py-4 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                            Update Password
                        </button>
                    </div>
                </div>

                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Two-Factor Authentication</h2>
                    <div className="flex items-center justify-between">
                        <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest">Two-Factor Auth</h4>
                             <p className="text-[9px] text-foreground/60 uppercase font-bold tracking-tight mt-1">Add an extra layer of security to your account.</p>
                        </div>
                        <button className="w-12 h-6 bg-muted rounded-full relative cursor-not-allowed">
                            <div className="w-4 h-4 bg-foreground/20 rounded-full absolute left-1 top-1" />
                        </button>
                    </div>
                </div>

                <div className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border shadow-2xl">
                    <h2 className="text-[10px] font-black mb-12 uppercase tracking-[0.3em] text-foreground/60 italic">Login History</h2>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <EyeIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Current Session</p>
                                    <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-tight">Windows • Chrome • India</p>
                                </div>
                            </div>
                            <span className="text-[8px] font-black px-3 py-1 bg-green-500/10 text-green-500 rounded-full uppercase tracking-widest">Active</span>
                        </div>
                         <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-tight text-center italic">Your login history is tracked for your security.</p>
                    </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
