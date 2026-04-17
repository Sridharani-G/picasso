'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import Image from 'next/image';
import { getMediaUrl } from '@/utils/apiClient';
import { siteConfig } from '@/config/site';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TrophyIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeSolid,
  MagnifyingGlassIcon as SearchSolid,
  UserGroupIcon as UsersSolid,
  ShoppingBagIcon as ShopSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  ChartBarIcon as ChartSolid,
  Cog6ToothIcon as CogSolid,
  TrophyIcon as TrophySolid,
} from '@heroicons/react/24/solid';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isLoggedIn } = useSession();

  const navItems = [
    { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeSolid },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, iconSolid: SearchSolid },
    { name: 'Artists', href: '/artists', icon: UserGroupIcon, iconSolid: UsersSolid },
    { name: 'Chats', href: '/chat', icon: ChatBubbleLeftRightIcon, iconSolid: ChatSolid },
    { name: 'Competitions', href: '/competitions', icon: TrophyIcon, iconSolid: TrophySolid },
    { name: 'Shop', href: '/shop', icon: ShoppingBagIcon, iconSolid: ShopSolid },
  ];

  const bottomItems = [
    ...(isLoggedIn ? [{ name: 'Analytics', href: '/analytics', icon: ChartBarIcon, iconSolid: ChartSolid }] : []),
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, iconSolid: CogSolid },
  ];

  return (
    <div className="flex flex-col h-full bg-background border-r border-border w-[220px]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-5 py-5 border-b border-border group">
        <div className="w-10 h-10 relative overflow-hidden transition-transform duration-300 group-hover:scale-105 shrink-0">
          <Image 
            src="/logo.png" 
            alt={`${siteConfig.name} Logo`} 
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <span className="text-lg font-black text-foreground tracking-tight transition-colors">{siteConfig.name}</span>
      </Link>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Upload Button */}
      {isLoggedIn && (
        <div className="px-3 py-3 border-t border-border">
          <Link
            href="/upload"
            className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Upload
          </Link>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = isActive ? item.iconSolid : item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`} />
              {item.name}
            </Link>
          );
        })}

        {/* User Profile */}
        {isLoggedIn && user && (
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-all mt-1 group"
          >
            <div className="w-7 h-7 rounded-full bg-muted border border-border overflow-hidden shrink-0">
              {(user.profileImage || user.avatar) ? (
                <Image
                  src={getMediaUrl((user.profileImage || user.avatar) as string) as string}
                  alt={user.username || ''}
                  width={28}
                  height={28}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
              <p className="text-[10px] text-foreground/40 uppercase tracking-wide">Profile</p>
            </div>
          </Link>
        )}

        {!isLoggedIn && (
          <Link
            href="/auth/login"
            className="flex items-center justify-center gap-2 w-full border border-border text-foreground/70 hover:text-foreground hover:border-foreground/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mt-2"
          >
            Log in
          </Link>
        )}
      </div>
    </div>
  );
}
