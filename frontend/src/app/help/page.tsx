'use client';

import { useState } from 'react';
import { siteConfig } from '@/config/site';
import Link from 'next/link';

interface FAQCategory {
  title: string;
  items: { q: string; a: string }[];
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const categories: FAQCategory[] = [
    {
      title: "Onboarding & Genesis",
      items: [
        { q: "How do I initiate my account?", a: "Select the 'Protocol Initiation' (Join) button in the upper array. Choose your resonance: Artist (Creator), Explorer (Curator), or Org (Architect)." },
        { q: "Is the simulation free to join?", a: "Entry as an Artist or Explorer is free of charge. Organizational nodes may require strategic credits for hosting massive collective competitions." }
      ]
    },
    {
      title: "Artist Protocols",
      items: [
        { q: "How do I transmit my artwork?", a: "Navigate to your Command Dashboard or select 'Transmit' (Upload) from the primary array. We support high-fidelity visual and motion assets." },
        { q: "What is 'Resonance'?", a: "Resonance is the aggregated frequency of likes, views, and insights your work generates within the collective. High resonance increases your visibility in the Matrix." }
      ]
    },
    {
      title: "Financial Infrastructure",
      items: [
        { q: "How do I receive credits for my work?", a: `Artists can link their UPI or digital wallets via the Digital Network settings. Direct transactions are facilitated via the ${siteConfig.name} secure bridge.` },
        { q: "Are transactions secured?", a: "All financial transfers are governed by industrial-grade security protocols and processed through verified banking nodes (Razorpay/Stripe)." }
      ]
    }
  ];

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Hub Header */}
        <div className="text-center mb-24 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-8xl font-serif font-black mb-8 uppercase italic tracking-tighter text-foreground">
            Mission <span className="text-foreground/20">Control</span>
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.5em] text-foreground/40 max-w-2xl mx-auto leading-relaxed">
            Your centralized node for platform navigation, artist protocols, and technical support within the Picasso collective.
          </p>
        </div>

        {/* System Status Indicator */}
        <div className="flex justify-center mb-20">
          <div className="bg-primary/5 border border-primary/10 rounded-full px-8 py-3 flex items-center space-x-4">
            <div className="w-2 h-2 rounded-full bg-[#00FFBD] animate-pulse shadow-[0_0_10px_#00FFBD]"></div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/60">System Status: All Nodes Operational</span>
          </div>
        </div>

        {/* Categorized FAQs */}
        <div className="space-y-20 mb-32">
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 border-l-2 border-primary/40 pl-6 ml-2">
                {category.title}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {category.items.map((item, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  return (
                    <div 
                      key={id}
                      className={`group border border-border rounded-[2rem] transition-all duration-500 overflow-hidden ${isOpen ? 'bg-card border-primary/20 ring-1 ring-primary/10' : 'bg-transparent hover:border-foreground/20'}`}
                    >
                      <button 
                        onClick={() => toggleFAQ(id)}
                        className="w-full text-left px-10 py-8 flex items-center justify-between"
                      >
                        <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">
                          {item.q}
                        </span>
                        <div className={`w-8 h-8 rounded-full border border-border flex items-center justify-center transition-transform duration-500 ${isOpen ? 'rotate-180 bg-primary border-primary' : ''}`}>
                          <svg className={`w-3 h-3 transition-colors ${isOpen ? 'text-background' : 'text-foreground'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      <div 
                        className={`transition-all duration-500 ease-in-out px-10 ${isOpen ? 'max-h-96 pb-12 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <p className="text-[11px] font-bold uppercase tracking-tight text-foreground/60 leading-relaxed border-t border-border pt-8">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Pulse */}
        <div className="bg-card border border-border rounded-[4rem] p-16 text-center relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-primary/10"></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 mb-8">Direct Synchronization</h2>
          <p className="text-xl font-black uppercase italic tracking-tighter text-foreground mb-12">
            Cannot find the solution? <br/><span className="text-primary">Initiate contact with Mission Control.</span>
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link 
              href="/contact"
              className="bg-foreground text-background px-10 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
              Contact Support
            </Link>
            <Link 
              href="/security"
              className="px-10 py-5 rounded-full border border-border text-xs font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
            >
              Security Protocols
            </Link>
          </div>
        </div>

        {/* Home Link */}
        <div className="mt-20 text-center">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 hover:text-foreground transition-colors">
            Return to Matrix Home
          </Link>
        </div>
      </div>
    </div>
  );
}
