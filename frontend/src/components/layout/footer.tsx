'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/utils/apiClient';
import { siteConfig } from '@/config/site';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalVisionaries: 0,
    totalResonance: 0
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch footer stats:', err);
      }
    };

    if (pathname !== '/') {
      fetchStats();
    }
  }, [pathname]);

  if (pathname === '/') {
    return null;
  }

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="w-full px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-serif font-black text-foreground uppercase tracking-tight italic">{siteConfig.name}</h3>
            <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.3em] leading-relaxed max-w-sm mb-10">
              A decentralized visual archive for the elite artistic collective.
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex flex-wrap gap-12 mb-20">
          <div className="group">
            <p className="text-3xl font-serif font-black tracking-tighter">{formatNumber(stats.totalArtworks)}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20 group-hover:text-primary transition-colors">Artifacts</p>
          </div>
          <div className="group">
            <p className="text-3xl font-serif font-black tracking-tighter">{formatNumber(stats.totalVisionaries)}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20 group-hover:text-primary transition-colors">Visionaries</p>
          </div>
          <div className="group">
            <p className="text-3xl font-serif font-black tracking-tighter">{formatNumber(stats.totalResonance)}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/20 group-hover:text-primary transition-colors">Resonance</p>
          </div>
        </div>

        {/* Links Array */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20 border-t border-border pt-16">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Protocols</h4>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Explore Feed</Link></li>
              <li><Link href="/leaderboard" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Rankings</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Terms</Link></li>
              <li><Link href="/privacy" className="text-xs font-bold hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright Pillar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-border">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground/20">
            © {currentYear} {siteConfig.name.toUpperCase()} collective. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm uppercase font-black tracking-widest">
              Terms
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm uppercase font-black tracking-widest">
              Privacy
            </Link>
            <Link href="/security" className="text-muted-foreground hover:text-foreground text-sm uppercase font-black tracking-widest">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
