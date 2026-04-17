'use client';

import { XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    _id?: string;
    username: string;
    profileImage?: string;
    bio?: string;
}

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: User[];
    loading?: boolean;
}

export default function UserListModal({ isOpen, onClose, title, users, loading = false }: UserListModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-border/50">
                    <h3 className="text-xl font-serif font-black uppercase italic tracking-tight">
                        {title} <span className="text-foreground/20 ml-2 font-normal capitalize">Witnesses</span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-xl transition-colors text-foreground/40 hover:text-foreground"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* List Container */}
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="space-y-2">
                            {users.map((user, index) => (
                                <Link
                                    key={`${user.id || user._id}-${index}`}
                                    href={`/artist/${user.username}`}
                                    onClick={onClose}
                                    className="flex items-center space-x-4 p-4 rounded-3xl hover:bg-muted/50 transition-all group block"
                                >
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-background border border-border group-hover:scale-105 transition-transform">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary text-xl font-serif italic">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-sm uppercase tracking-widest">{user.username}</p>
                                        <p className="text-[10px] text-foreground/60 truncate italic mt-0.5">{user.bio || 'Architect has not yet declared their creative intentions.'}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-primary/0 group-hover:bg-primary/10 flex items-center justify-center transition-all">
                                        <UserCircleIcon className="w-5 h-5 opacity-0 group-hover:opacity-40 transition-all" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 italic">No entities detected in this sector</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-muted/30 border-t border-border/50 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/10 leading-relaxed">
                        {siteConfig.shortName} Core Connection // Authorized Access Only
                    </p>
                </div>
            </div>
        </div>
    );
}
