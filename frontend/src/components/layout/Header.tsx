'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import { getMediaUrl } from '@/utils/apiClient';
import {
  MagnifyingGlassIcon,
  MicrophoneIcon,
  ChevronDownIcon,
  BellIcon,
  ChatBubbleOvalLeftIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user, isLoggedIn } = useSession();
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center h-20 px-4 gap-4">
      {/* Logo */}
      <Link href="/" className="flex items-center justify-center min-w-[48px] h-12 rounded-full hover:bg-gray-100 transition-all">
         <div className="w-8 h-8 relative">
           <Image src="/logo.png" alt="Picasso Logo" fill className="object-contain" unoptimized />
         </div>
      </Link>

      {/* Primary Links */}
      <div className="hidden lg:flex items-center gap-1">
        <Link href="/" className="px-5 py-3 bg-black text-white rounded-full text-sm font-bold">Home</Link>
        <Link href="/explore" className="px-5 py-3 text-gray-900 hover:bg-gray-50 rounded-full text-sm font-bold">Explore</Link>
        <Link href="/upload" className="px-5 py-3 text-gray-900 hover:bg-gray-50 rounded-full text-sm font-bold">Create</Link>
      </div>

      {/* Oversized Search Bar */}
      <div className="flex-1 max-w-full relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
           <MagnifyingGlassIcon className="w-5 h-5 font-bold" />
        </div>
        <input 
          type="text" 
          placeholder="Search"
          className="w-full h-12 bg-[#efefef] hover:bg-[#e2e2e2] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-full pl-12 pr-12 text-gray-900 text-base font-medium border-transparent outline-none"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700 cursor-pointer">
           <MicrophoneIcon className="w-5 h-5 font-bold" />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-1">
        <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all text-gray-500">
           <BellIcon className="w-7 h-7" />
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all text-gray-500">
           <ChatBubbleOvalLeftIcon className="w-7 h-7" />
        </button>

        {isLoggedIn ? (
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1 p-1 pr-1 rounded-full hover:bg-gray-100 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {user?.avatar ? (
                  <Image src={getMediaUrl(user.avatar) as string} alt={user.username} width={32} height={32} unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{user?.username?.charAt(0)}</div>
                )}
              </div>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <Link href="/auth/login" className="px-5 py-3 bg-[#e60023] text-white rounded-full text-sm font-bold hover:bg-[#ad081b] transition-all ml-2">
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
