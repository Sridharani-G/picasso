'use client';

import Link from 'next/link';

export default function ArtistsPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-serif font-black mb-4">Artists Page Removed</h1>
        <p className="text-foreground/70 mb-6">
          The artists directory has been disabled per request. Use the community gallery and feedback sections for artist discovery.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/community" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-primary/90 transition">
            Go to Community
          </Link>
          <Link href="/" className="border border-border text-foreground px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-muted transition">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
