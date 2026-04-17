'use client';

import Link from 'next/link';
import { siteConfig } from '@/config/site';

export default function TermsPage() {
  const sections = [
    {
      title: "1. Acceptance of Protocol",
      content: `By accessing the ${siteConfig.name} Matrix, you agree to be bound by these System Terms and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`
    },
    {
      title: "2. Intellectual Synthesis",
      content: `Unless otherwise stated, ${siteConfig.name} and/or its licensors own the intellectual property rights for all material on the platform. You may access this from ${siteConfig.name} for your own personal use subjected to restrictions set in these terms and conditions.`
    },
    {
      title: "3. User Conduct",
      content: `Users must not: republish material from ${siteConfig.name}, sell, rent or sub-license material, reproduce, duplicate or copy material, or redistribute content. Any attempt to reverse engineer or disrupt the neural infrastructure of the community will result in immediate termination.`
    },
    {
      title: "4. Creative License",
      content: `By uploading artwork to ${siteConfig.name}, you grant the platform a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content in connection with the operation of the platform and marketing activities.`
    },
    {
      title: "5. Financial Transactions",
      content: `All payments processed via ${siteConfig.name} (including UPI, Razorpay, or Stripe) are subject to third-party provider terms. ${siteConfig.name} acts as a facilitator and is not responsible for settlement failures or disputes originating from exterior banking protocols.`
    },
    {
      title: "6. Limitation of Liability",
      content: `In no event shall ${siteConfig.name} or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ${siteConfig.name}.`
    }
  ];

  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <h1 className="text-5xl md:text-7xl font-serif font-black mb-6 uppercase italic tracking-tighter text-foreground">
            Terms <span className="text-foreground/20">&</span> Conditions
          </h1>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-foreground/40 max-w-xl mx-auto leading-relaxed">
            The legal framework governing the interaction and exchange within the {siteConfig.name} collective.
          </p>
        </div>

        {/* Legal Sections Grid */}
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

        {/* Detailed Disclaimer Section */}
        <div className="bg-primary/5 rounded-[3rem] p-12 border border-primary/10 mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 mb-8">System Disclaimer</h2>
          <p className="text-sm font-bold text-foreground/80 uppercase tracking-tight leading-loose mb-8">
            The materials on {siteConfig.name} are provided on an 'as is' basis. {siteConfig.name} makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/privacy"
              className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-foreground/10">•</span>
            <Link 
              href="/security"
              className="text-[10px] font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors"
            >
              Security Protocols
            </Link>
          </div>
        </div>

        {/* Closing */}
        <div className="text-center">
          <div className="inline-block p-1 px-8 rounded-full border border-border text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30 mb-8">
            Final Baseline Update: March 14, 2026
          </div>
          <div className="flex justify-center space-x-12 mt-12 pt-12 border-t border-border">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Home</Link>
            <Link href="/help" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Help</Link>
            <Link href="/contact" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground">Contact</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
