'use client';

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

export default function AboutPage() {
  const values = [
    {
      title: "The Genesis",
      icon: "✨",
      content: `Born from the desire to bridge the gap between imagination and digital reality, ${siteConfig.name} emerged as a sanctuary for visionaries.`
    },
    {
      title: "The Vision",
      icon: "👁️",
      content: "We empower creators to transcend traditional boundaries, providing a decentralized stage for global creative resonance."
    },
    {
      title: "The Infrastructure",
      icon: "🏗️",
      content: "Built on industrial-grade neural architecture, ensuring high-fidelity transmission and absolute security for every asset."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse"></div>
          
          <div className="text-center animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <h1 className="text-6xl md:text-9xl font-serif font-black mb-8 uppercase italic tracking-tighter text-foreground drop-shadow-2xl">
              The {siteConfig.name} <span className="text-foreground/20">Matrix</span>
            </h1>
            <p className="text-sm md:text-base font-black uppercase tracking-[0.6em] text-foreground/40 max-w-3xl mx-auto leading-relaxed mb-12">
              Architecting the future of creative exchange and digital sovereignty.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="h-px w-24 bg-border self-center"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Established 2026</span>
              <div className="h-px w-24 bg-border self-center"></div>
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-40 items-center">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-10 duration-700 delay-300">
            <h2 className="text-2xl md:text-4xl font-serif font-black uppercase italic tracking-tighter text-foreground">
              Beyond the <span className="text-primary">Canvas</span>.
            </h2>
            <p className="text-lg font-bold text-foreground/70 uppercase tracking-tight leading-relaxed">
              {siteConfig.name} is not just a platform; it is a living ecosystem where every stroke, pixel, and frame contributes to a collective consciousness of beauty and innovation.
            </p>
            <p className="text-sm font-medium text-foreground/50 leading-loose">
              Our architecture is designed to amplify the individual voice while fostering a global community of resonance. From independent artists finding their first audience to large-scale organizations hosting international competitions, the Matrix provides the tools for every level of the creative hierarchy.
            </p>
          </div>
          
          <div className="relative aspect-square rounded-[4rem] overflow-hidden border border-border group animate-in fade-in zoom-in duration-700 delay-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent mix-blend-overlay z-10"></div>
            <div className="absolute inset-0 bg-card/40 backdrop-blur-3xl p-20 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="w-12 h-1 bg-primary"></div>
                <p className="text-4xl font-serif font-black italic uppercase tracking-tighter">Empowering the <br/>Global <span className="text-primary">Vanguard</span>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
          {values.map((v, i) => (
            <div 
              key={i}
              className="bg-card/30 backdrop-blur-xl border border-border p-12 rounded-[3.5rem] hover:border-primary/30 transition-all duration-500 group"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-background border border-border flex items-center justify-center text-2xl mb-10 group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                {v.icon}
              </div>
              <h3 className="text-xs font-black mb-6 uppercase tracking-[0.3em] text-primary">{v.title}</h3>
              <p className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest leading-relaxed">
                {v.content}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack / Infrastructure */}
        <div className="bg-card border border-border rounded-[4rem] p-20 mb-40 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 mb-8">System Architecture</h2>
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Frontend Array</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-foreground/40">Next.js 16.1.6 • React 19 • Tailwind Matrix</p>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Neural Backend</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-foreground/40">Node.js Gateway • Express Infrastructure • MongoDB Wisdom</p>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2">Secure Bridge</h4>
                  <p className="text-[10px] font-bold uppercase tracking-tight text-foreground/40">Helmet Protection • JWT Sync • Cloudinary Synchronization</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-serif font-black italic uppercase tracking-tighter mb-8 max-w-xs ml-auto">
                Built for <span className="text-primary">Performance</span>, Secured for <span className="text-primary">Sovereignty</span>.
              </p>
              <Link 
                href="/security"
                className="inline-block text-[10px] font-black uppercase tracking-[0.4em] hover:text-primary transition-colors underline underline-offset-8"
              >
                Inspect Security Protocols
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-in fade-in slide-in-from-top-10 duration-700 delay-700">
          <h2 className="text-3xl md:text-5xl font-serif font-black italic uppercase tracking-tighter mb-12">
            Ready to <span className="text-primary">Evolve</span>?
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              href="/auth/register"
              className="bg-foreground text-background px-12 py-6 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-2xl"
            >
              Initiate Integration
            </Link>
            <Link 
              href="/help"
              className="px-12 py-6 rounded-full border border-border text-xs font-black uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition-all"
            >
              Consult the Archive
            </Link>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-40 pt-20 border-t border-border flex flex-wrap justify-center gap-12">
          {['Home', 'Terms', 'Privacy', 'Security', 'Help'].map((item) => (
            <Link 
              key={item}
              href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-foreground transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
