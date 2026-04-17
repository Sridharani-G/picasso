'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/apiClient';
import SessionManager from '@/utils/sessionManager';
import { Artwork } from '@/types';
import Button from '@/components/ui/Button';

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  const fetchArtworks = async (userId: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${userId}/artworks`, {
        headers: {
          'Authorization': `Bearer ${SessionManager.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setArtworks(data.artworks || []);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    }
  };

  useEffect(() => {
    const token = SessionManager.getToken();
    const userData = SessionManager.getUser();

    if (!token || !userData) {
      window.location.href = '/auth/login';
      return;
    }

    setUser(userData);
    if (userData.isArtist) {
      fetchArtworks(userData.id);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f3a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  const totalViews = artworks.reduce((sum, artwork) => sum + (artwork.views || 0), 0);
  const totalLikes = artworks.reduce((sum, artwork) => sum + artwork.likes, 0);
  const totalComments = artworks.reduce((sum, artwork) => sum + artwork.comments, 0);
  const avgEngagementRate = artworks.length > 0
    ? ((totalLikes + totalComments) / artworks.length).toFixed(2)
    : '0';

  return (
    <div className="min-h-screen bg-[#1a1f3a] py-12 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-serif font-black mb-2 uppercase tracking-wide text-foreground italic">Analytics</h1>
          <p className="text-foreground/40 mt-2 text-[11px] font-black uppercase tracking-[0.2em]">
            Track your resonance and engagement trajectory
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border text-foreground">
            <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-2">Total Views</h3>
            <p className="text-3xl font-black italic">{totalViews.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border text-foreground">
            <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-2">Total Likes</h3>
            <p className="text-3xl font-black italic">{totalLikes.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border text-foreground">
            <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-2">Total Comments</h3>
            <p className="text-3xl font-black italic">{totalComments.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-border text-foreground">
            <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-2">Average Engagement Rate</h3>
            <p className="text-3xl font-black italic text-primary">{avgEngagementRate}</p>
          </div>
        </div>

        {/* Artwork Performance */}
        <div className="bg-card rounded-[2.5rem] border border-border p-8 mb-12 shadow-2xl text-foreground">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground/40 italic">Artwork Performance</h2>
            <button className="text-primary hover:text-foreground font-black text-[10px] uppercase tracking-widest border border-border px-6 py-2 rounded-xl hover:bg-muted transition-all">Export Data</button>
          </div>

          {artworks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-6 px-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Artwork</th>
                    <th className="text-left py-6 px-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Views</th>
                    <th className="text-left py-6 px-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Likes</th>
                    <th className="text-left py-6 px-4 text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {artworks.map((artwork) => (
                    <tr key={artwork.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{artwork.title}</div>
                        <div className="text-xs text-[#C9A84C] uppercase tracking-wide mt-1">{artwork.category}</div>
                      </td>
                      <td className="py-4 px-4 font-medium">{(artwork.views || 0).toLocaleString()}</td>
                      <td className="py-4 px-4 font-medium">{artwork.likes}</td>
                      <td className="py-4 px-4 font-medium">{artwork.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-[2rem] border border-dashed border-border mb-8">
              <p className="text-foreground/20 text-[10px] font-black uppercase tracking-[0.3em] italic">
                {user?.isArtist
                  ? "No artworks found. Start uploading your creations!"
                  : "Only artists can view artwork performance."}
              </p>
            </div>
          )}
        </div>

        {/* Audience Insights */}
        <div className="bg-white rounded-xl border border-white/10 p-8 shadow-2xl text-gray-900">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-8">Audience Insights</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Demographics</h3>
              <p className="text-sm text-gray-500">Coming soon: Age, location, interests</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Peak Hours</h3>
              <p className="text-sm text-gray-500">Coming soon: When your audience is most active</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 uppercase text-xs tracking-wider">Traffic Sources</h3>
              <p className="text-sm text-gray-500">Coming soon: How people find your content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
