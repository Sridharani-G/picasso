'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    PlusCircleIcon,
    BellIcon,
    Bars3Icon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeSolid,
    MagnifyingGlassIcon as MagnifyingGlassSolid,
    PlusCircleIcon as PlusCircleSolid,
    BellIcon as BellSolid,
    Bars3Icon as Bars3Solid,
    UserIcon as UserSolid,
    TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid';
import { UserIcon } from '@heroicons/react/24/outline';
import { useSession } from '@/components/SessionProvider';
import { getMediaUrl } from '@/utils/apiClient';

interface BottomNavProps {
    onMoreClick?: () => void;
}

export default function BottomNav({ onMoreClick }: BottomNavProps) {
    const pathname = usePathname();
    const { user, isLoggedIn } = useSession();

    const navItems = [
        { name: 'Home', href: '/', icon: HomeIcon, solidIcon: HomeSolid },
        { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon, solidIcon: MagnifyingGlassSolid },
        { name: 'Upload', href: '/upload', icon: PlusCircleIcon, solidIcon: PlusCircleSolid, highlight: true },
        { name: 'Profile', href: '/profile', icon: UserIcon, solidIcon: UserSolid, isProfile: true }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 pb-safe">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.name === 'Menu' && pathname.startsWith('/settings'));
                    const Icon = isActive ? item.solidIcon : item.icon;

                    if (item.highlight) {
                        return (
                            <Link key={item.name} href={item.href} className="flex-1 flex justify-center items-center">
                                <div className="bg-primary p-2 rounded-full transform -translate-y-2 shadow-2xl shadow-primary/20 border-4 border-background transition-transform hover:scale-105 active:scale-95">
                                    <Icon className="w-6 h-6 text-primary-foreground" />
                                </div>
                            </Link>
                        )
                    }

                    if (item.isProfile) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-foreground' : 'text-foreground/40 hover:text-foreground'
                                    }`}
                            >
                                {isLoggedIn && user ? (
                                    <div className={`w-6 h-6 rounded-full overflow-hidden border ${isActive ? 'border-foreground' : 'border-foreground/20'}`}>
                                        <img
                                            src={getMediaUrl(user.profileImage) as string || `https://ui-avatars.com/api/?name=${user.username}`}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <Icon className={`w-6 h-6 ${isActive ? 'scale-110 transition-transform' : ''}`} />
                                )}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive ? 'text-foreground' : 'text-foreground/40 hover:text-foreground'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'scale-110 transition-transform' : ''}`} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
