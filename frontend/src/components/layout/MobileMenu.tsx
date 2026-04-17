'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  UserIcon,
  PhotoIcon,
  TrophyIcon,
  ShoppingBagIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useSession } from '@/components/SessionProvider';
import { useState, useEffect } from 'react';
import { siteConfig } from '@/config/site';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { theme, setTheme } = useTheme();
  const { logout, isLoggedIn, user } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const navItems = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Explore', href: '/explore', icon: PhotoIcon },
    { name: 'Competitions', href: '/competitions', icon: TrophyIcon },
    { name: 'Leaderboard', href: '/leaderboard', icon: ChartBarIcon }
  ];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-background border-r border-border shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center rotate-[-8deg]">
                    <PhotoIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="ml-3 text-xl font-serif font-black text-foreground uppercase tracking-tighter italic">{siteConfig.name}</span>
                  <button
                    type="button"
                    className="ml-auto p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <nav className="mt-5 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center px-4 py-4 text-sm font-black uppercase tracking-widest rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted transition-all active:scale-95"
                      onClick={onClose}
                    >
                      <item.icon className="mr-4 h-6 w-6" />
                      {item.name}
                    </Link>
                  ))}


                  <div className="pt-8 mt-4 border-t border-border/50 px-4">
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-4">Appearance</p>
                    {mounted && (
                      <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center space-x-3">
                          {theme === 'dark' ? <SunIcon className="w-5 h-5 text-yellow-500" /> : <MoonIcon className="w-5 h-5 text-blue-500" />}
                          <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
                        </div>
                      </button>
                    )}
                  </div>

                  {isLoggedIn && (
                    <div className="pt-8 mt-4 border-t border-border/50 px-4 pb-12">
                      <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-4">Account</p>
                      <button
                        onClick={() => { logout(); onClose(); }}
                        className="w-full flex items-center px-4 py-4 text-sm font-black uppercase tracking-widest rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all"
                      >
                        <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6" />
                        Logout
                      </button>
                    </div>
                  )}
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
