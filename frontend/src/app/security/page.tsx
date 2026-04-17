'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function SecurityPage() {
  const securityFeatures = [
    {
      title: "Data Encryption",
      description: "All sensitive data is encrypted at rest using AES-256 and in transit via TLS 1.3 protocols.",
      icon: "🔒"
    },
    {
      title: "Identity Protection",
      description: "Secure hashing algorithms (bcrypt/argon2) protect all credentials, ensuring passwords are never stored in plain text.",
      icon: "🆔"
    },
    {
      title: "Infrastructure Integrity",
      description: "Our platform is hosted on Tier-4 data centers with 99.99% uptime and continuous vulnerability scanning.",
      icon: "🛡️"
    },
    {
      title: "Proactive Defense",
      description: "Automatic rate-limiting and DDoS mitigation strategies are active across all core APIs.",
      icon: "⚡"
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 uppercase italic tracking-tighter text-foreground">
            Security <span className="text-foreground/20">Protocols</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-foreground/40 max-w-xl mx-auto leading-relaxed">
            Ensuring the integrity of the elite artistic collective through advanced cryptographic standards.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {securityFeatures.map((feature, idx) => (
            <div 
              key={idx}
              className="bg-card border border-border p-8 rounded-3xl hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 uppercase tracking-tight text-foreground">{feature.title}</h3>
              <p className="text-[11px] text-foreground/60 leading-relaxed uppercase font-bold tracking-tight">
                {feature.description}
              </p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          <div className="border-t border-border pt-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 mb-8">Verification & Compliance</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-sm font-bold text-foreground/80 uppercase tracking-tight leading-loose mb-6">
                {siteConfig.name} enforces strict adherence to international security frameworks. Our distributed visual archive is monitored 24/7 by automated neural scanners to prevent data leakage and unauthorized access.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Vulnerability Program</h4>
                  <p className="text-[10px] text-foreground/40 uppercase font-black">Coordinated disclosure for ethical researchers.</p>
                </div>
                <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Access Hardening</h4>
                  <p className="text-[10px] text-foreground/40 uppercase font-black">Multi-layer authentication and session pinning.</p>
                </div>
                <div className="bg-muted/30 p-6 rounded-2xl border border-border/50">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Audit Logs</h4>
                  <p className="text-[10px] text-foreground/40 uppercase font-black">Comprehensive immutable logging for all mutations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-[40px] p-12 text-center border border-primary/10">
            <h3 className="text-2xl font-serif font-black uppercase italic mb-4 text-foreground">Protect Your Matrix</h3>
            <p className="text-[10px] uppercase font-black tracking-widest text-foreground/60 mb-8">
              User-side security is the final pillar of our collective defense.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/settings"
                className="bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                Security Settings
              </Link>
              <Link 
                href="/help"
                className="border border-border text-foreground text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-muted transition-all"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-border flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-foreground/20">
          <span>© {new Date().getFullYear()} {siteConfig.name} Collective</span>
          <span>Last Baseline: March 14, 2026</span>
        </div>
      </div>
    </div>
  );
}
