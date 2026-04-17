'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/SessionProvider';
import { getApiUrl, apiFetch } from '@/utils/apiClient';
import Link from 'next/link';

export default function NotificationsPage() {
    const { user } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Waiting for backend notifications route to be fully implemented.
    // For now, start with an empty state.
    useEffect(() => {
        setNotifications([]);
        setLoading(false);
    }, [user]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                <div className="h-10 w-48 bg-muted rounded-xl animate-pulse mb-8"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 bg-card border border-border rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
            <div className="mb-10 flex items-center justify-between">
                <h1 className="text-3xl font-serif font-black uppercase tracking-tight italic">Notifications</h1>
                {notifications.length > 0 && (
                    <button className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors">
                        Mark All Read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div key={notification.id} className="bg-card border border-border p-5 rounded-2xl flex items-start gap-4 hover:border-foreground/20 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm font-medium">{notification.message}</p>
                                <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-2">{new Date(notification.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-24 bg-card rounded-[2.5rem] border border-dashed border-border shadow-2xl">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-2xl text-foreground/20 font-serif italic">!</span>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-widest mb-2">No signals detected</h3>
                        <p className="text-foreground/40 text-sm">You're all caught up. No new notifications at this time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
