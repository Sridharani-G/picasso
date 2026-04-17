'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    BellIcon,
    TrophyIcon,
    UserGroupIcon,
    ArrowUpTrayIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    MagnifyingGlassIcon as SearchSolid,
    BellIcon as BellSolid,
    TrophyIcon as TrophySolid,
    UserGroupIcon as UsersSolid,
    ChartBarIcon as ChartBarSolid,
    ShoppingBagIcon as ShopSolid
} from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { siteConfig } from '@/config/site';
import { useSession } from '@/components/SessionProvider';
import Image from 'next/image';
import { getMediaUrl } from '@/utils/apiClient';

interface LeftSidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
}

export default function LeftSidebar({ isCollapsed = false, onToggle }: LeftSidebarProps) {
    const pathname = usePathname();
    const { isLoggedIn, user, logout } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const navItems = [
        { name: 'Home', href: '/', icon: HomeIcon, solidIcon: HomeSolid },
        { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, solidIcon: SearchSolid },
        { name: 'Competitions', href: '/competitions', icon: TrophyIcon, solidIcon: TrophySolid },
        { name: 'Shop', href: '/shop', icon: ShoppingBagIcon, solidIcon: ShopSolid },
        { name: 'Notifications', href: '/notifications', icon: BellIcon, solidIcon: BellSolid }
    ];

    const bottomItems = [
        ...(isLoggedIn ? [{ name: 'Analytics', href: '/analytics', icon: ChartBarIcon, solidIcon: ChartBarSolid }] : []),
        { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, solidIcon: Cog6ToothIcon }
    ];

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <div className={`hidden md:flex flex-col h-screen sticky top-0 bg-background transition-all duration-300 ease-in-out border-r border-border ${isCollapsed ? 'w-20' : 'w-64'} py-5 overflow-y-auto hide-scrollbar z-50`}>
            
            {/* Logo Header */}
            <div className={`flex items-center mb-6 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                {!isCollapsed && (
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
                        <span className="text-xl font-black text-foreground tracking-tight">{siteConfig.name}</span>
                    </Link>
                )}
                
                {isCollapsed && (
                    <Link href="/" className="w-10 h-10 relative overflow-hidden rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform block">
                        <Image 
                            src="/logo.png" 
                            alt={`${siteConfig.name} Logo`} 
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </Link>
                )}

                {!isCollapsed && (
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/40 hover:text-foreground"
                        aria-label="Collapse sidebar"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Expand button on collapsed state */}
            {isCollapsed && (
                <div className="flex justify-center mb-4">
                    <button
                        onClick={onToggle}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground/40 hover:text-foreground"
                        aria-label="Expand sidebar"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Upload Button */}
            {isLoggedIn && (
                <div className={`mb-6 px-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <Link
                        href="/upload"
                        className={`flex items-center justify-center bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/20
                        ${isCollapsed ? 'w-10 h-10 rounded-xl p-0' : 'w-full gap-2 py-2.5 rounded-xl text-sm'}`}
                        title={isCollapsed ? "Upload" : ""}
                    >
                        <ArrowUpTrayIcon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
                        {!isCollapsed && <span>Post Work</span>}
                    </Link>
                </div>
            )}

            {/* Main Navigation */}
            <nav className="flex-1 space-y-0.5 px-3">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    const Icon = isActive ? item.solidIcon : item.icon;
                    
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center rounded-xl transition-colors group
                                ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
                                ${isActive 
                                    ? 'bg-primary/10 text-primary font-semibold' 
                                    : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`} />
                            {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto px-3 pt-4 border-t border-border mt-4 space-y-0.5">
                
                {/* Secondary Nav */}
                {bottomItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = isActive ? item.solidIcon : item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : ''}
                            className={`flex items-center rounded-xl transition-colors group
                                ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
                                ${isActive 
                                    ? 'bg-primary/10 text-primary font-semibold' 
                                    : 'text-foreground/60 hover:text-foreground hover:bg-muted'
                                }`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-foreground/40 group-hover:text-foreground'}`} />
                            {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                        </Link>
                    );
                })}

                {/* Theme Toggle */}
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        title={isCollapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : ''}
                        className={`w-full flex items-center rounded-xl transition-colors text-foreground/60 hover:text-foreground hover:bg-muted group
                            ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}`}
                    >
                        {theme === 'dark' 
                            ? <SunIcon className="w-5 h-5 shrink-0 text-foreground/40 group-hover:text-foreground transition-colors" /> 
                            : <MoonIcon className="w-5 h-5 shrink-0 text-foreground/40 group-hover:text-foreground transition-colors" />
                        }
                        {!isCollapsed && <span className="text-sm">Theme</span>}
                    </button>
                )}
            </div>

            {/* User Profile / Auth */}
            <div className="px-4 mt-4">
                {isLoggedIn && user ? (
                    <div className="relative group">
                        <Link
                            href="/profile"
                            title={isCollapsed ? user.username : ''}
                            className={`flex items-center rounded-xl hover:bg-muted transition-colors
                                ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-2'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-muted border border-border overflow-hidden shrink-0">
                                {(user.profileImage || user.avatar) ? (
                                    <Image
                                        src={getMediaUrl((user.profileImage || user.avatar) as string) as string}
                                        alt={user.username || 'User'}
                                        width={32}
                                        height={32}
                                        className="object-cover w-full h-full"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary text-xs font-bold">
                                        {user.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2 border border-transparent">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate leading-tight">{user.username}</p>
                                        <p className="text-[10px] text-foreground/40 truncate leading-tight">View Profile</p>
                                    </div>
                                </div>
                            )}
                        </Link>
                        
                        {/* Logout button appears on hover in collapsed mode, or next to profile horizontally in expanded state. Let's keep it simple with a text button */}
                        {!isCollapsed && (
                             <button
                                onClick={handleLogout}
                                className={`w-full text-left mt-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2`}
                            >
                                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                Sign Out
                            </button>
                        )}
                        
                        {isCollapsed && (
                             <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="mt-2 w-full flex justify-center p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                             >
                                 <ArrowRightOnRectangleIcon className="w-5 h-5" />
                             </button>
                        )}
                    </div>
                ) : (
                    <Link
                        href="/auth/login"
                        className={`flex items-center justify-center w-full border border-border text-foreground hover:bg-muted rounded-xl transition-colors font-semibold
                            ${isCollapsed ? 'h-10 text-xs' : 'py-2.5 text-sm'}`}
                        title={isCollapsed ? 'Log in' : ''}
                    >
                        {isCollapsed ? 'Log in' : 'Log in'}
                    </Link>
                )}
            </div>
        </div>
    );
}
