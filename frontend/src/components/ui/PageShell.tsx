import React from 'react';

interface PageShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <div className="bg-background min-h-screen text-foreground font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tight mb-2">{title}</h1>
          {subtitle && <p className="text-base text-foreground/60">{subtitle}</p>}
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
