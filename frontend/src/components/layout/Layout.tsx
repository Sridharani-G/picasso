'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import { useSession } from '@/components/SessionProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isLoggedIn, logout, user } = useSession();
  const pathname = usePathname();

  // Pages that need full-height, no-scroll layout (chat, studio, etc.)
  const isFullHeight = pathname?.startsWith('/chat') || pathname?.startsWith('/studio');

  return (
    <div className={`${isFullHeight ? 'h-screen overflow-hidden flex flex-col' : 'min-h-screen'} bg-white text-slate-900`}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md flex-shrink-0">
        <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0">
              <Image
                src="/logo.png"
                alt={`${siteConfig.name} Logo`}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <span className="text-xl font-serif font-black text-slate-900 tracking-tighter italic uppercase transition-colors">
              {siteConfig.shortName || siteConfig.name}
            </span>
          </Link>

          <nav className="flex gap-4 md:gap-8 font-semibold text-slate-700 overflow-x-auto whitespace-nowrap px-2">
            <Link href="/" className="hover:text-slate-900 transition">Discover</Link>
            <Link href="/community" className="hover:text-slate-900 transition">Community</Link>
            <Link href="/chat" className={`hover:text-slate-900 transition ${pathname?.startsWith('/chat') ? 'text-[#ff3b5c] font-bold' : ''}`}>Chats</Link>
            <Link href="/shop" className="hover:text-slate-900 transition">Shop</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <Link href="/profile" className="rounded-full bg-slate-100 px-6 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-slate-200">Profile</Link>
                <button
                  onClick={() => { logout(); window.location.href = '/'; }}
                  className="rounded-full bg-[#ff3b5c] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#e62e4d] shadow-lg shadow-rose-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                 <Link href="/auth/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4">Login</Link>
                 <Link href="/auth/register" className="rounded-full bg-[#ff3b5c] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-[#e62e4d] shadow-lg shadow-rose-200">
                    Join Piccolo
                 </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className={isFullHeight ? 'flex-1 overflow-hidden' : 'min-h-[calc(100vh-70px)] bg-white'}>
        {children}
      </main>

      {/* ── Footer — hidden on full-height pages ── */}
      {!isFullHeight && (
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} {siteConfig.name} — Built for artists.
        </footer>
      )}
    </div>
  );
}
