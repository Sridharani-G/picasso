'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const sections = [
    {
      title: "1. Data Collection & Neural Synthesis",
      content: "We collect information you provide directly to us: username, email, profile metadata, and visual assets (artworks). This data is synthesized to maintain your digital identity within the collective."
    },
    {
      title: "2. Encryption & Secure Storage",
      content: "All sensitive data is encrypted using industry-standard protocols. Your visual assets are stored via secure cloud infrastructure (Cloudinary) with restricted access tokens."
    },
    {
      title: "3. User Control & Data Sovereignty",
      content: "You maintain full sovereignty over your data. You may request a complete data purge from our primary nodes at any time via the account settings module."
    },
    {
      title: "4. Third-party Synchronization",
      content: "We synchronize with trusted financial protocols (Razorpay, Stripe) and media infrastructure providers. Your payment details never reside on our primary servers."
    },
    {
      title: "5. Cookies & Tracking Protocols",
      content: `We use essential cookies to maintain your session integrity. No behavioral tracking or third-party advertising algorithms are permitted within the ${siteConfig.name} Matrix.`
    },
    {
      title: "6. Privacy Enquiries",
      content: "For enquiries regarding your digital footprint, contact our security leads at security@picasso.matrix. We aim to respond within 48 planetary hours."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-all mb-12 group"
        >
          <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </button>

        {/* Header Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 uppercase italic tracking-tighter text-foreground">
            Privacy <span className="text-foreground/20">&</span> Sovereignty
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-foreground/40 max-w-xl mx-auto leading-relaxed">
            Establishing the protocols of trust and data protection within the {siteConfig.name} collective.
          </p>
        </div>

        {/* Policy Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {sections.map((section, idx) => (
            <div 
              key={idx}
              className="bg-card border border-border p-10 rounded-[2.5rem] hover:border-primary/20 transition-all duration-500 group"
            >
              <h3 className="text-xs font-black mb-6 uppercase tracking-[0.2em] text-primary">{section.title}</h3>
              <p className="text-[11px] text-foreground/60 leading-relaxed uppercase font-bold tracking-tight">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Data Protection Commitment */}
        <div className="bg-primary/5 rounded-[3rem] p-12 border border-primary/10 mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 mb-8">Data Commitment</h2>
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-tight leading-loose mb-8">
            {siteConfig.name} is built on the principle of minimal data footprint. We do not sell, rent, or trade your personal information to any exterior marketing conglomerates. Your data exists solely to empower your creative journey as an artist and visionary.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/terms"
              className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Terms of Protocol
            </Link>
            <span className="text-foreground/10">•</span>
            <Link 
              href="/security"
              className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Security Architecture
            </Link>
          </div>
        </div>

        {/* Closing */}
        <div className="text-center">
          <div className="inline-block p-1 px-8 rounded-full border border-border text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30 mb-8">
            Privacy Baseline Update: March 14, 2026
          </div>
          <div className="flex justify-center space-x-12 mt-12 pt-12 border-t border-border">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Home</Link>
            <Link href="/terms" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Terms</Link>
            <Link href="/security" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Security</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
