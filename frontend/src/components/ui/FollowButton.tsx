"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/apiClient';
import SessionManager from '@/utils/sessionManager';
import { useSession } from '@/components/SessionProvider';

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    initialFansCount?: number;
    /** Whether the target user already follows the current user (for follow-back detection) */
    targetFollowsMe?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    className?: string;
    onFollowChange?: (isFollowing: boolean, newCount: number) => void;
}

export default function FollowButton({
    targetUserId,
    initialIsFollowing,
    initialFansCount = 0,
    targetFollowsMe = false,
    size = 'md',
    showCount = false,
    className = '',
    onFollowChange,
}: FollowButtonProps) {
    const router = useRouter();
    const { isLoggedIn } = useSession();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [fansCount, setFansCount] = useState(initialFansCount);
    const [loading, setLoading] = useState(false);
    const [isFollowBack, setIsFollowBack] = useState(false);

    // Sync state with props when they change (critical for dynamic page loads)
    useEffect(() => {
        setIsFollowing(initialIsFollowing);
    }, [initialIsFollowing]);

    useEffect(() => {
        setFansCount(initialFansCount);
    }, [initialFansCount]);

    const handleToggle = async () => {
        if (!isLoggedIn) {
            router.push('/auth/login');
            return;
        }

        const token = SessionManager.getToken();
        if (!token) {
            router.push('/auth/login');
            return;
        }

        setLoading(true);
        const endpoint = isFollowing ? 'unfollow' : 'follow';
        const apiUrl = getApiUrl();

        try {
            const res = await fetch(`${apiUrl}/users/${targetUserId}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                const newFollowing = !isFollowing;
                const newCount = data.fansCount ?? data.followersCount ?? (newFollowing ? fansCount + 1 : Math.max(0, fansCount - 1));
                setIsFollowing(newFollowing);
                setFansCount(newCount);
                if (data.isFollowBack) setIsFollowBack(true);
                onFollowChange?.(newFollowing, newCount);
            }
        } catch (err) {
            console.error('Follow toggle error:', err);
        } finally {
            setLoading(false);
        }
    };

    const sizeMap = {
        sm: 'px-4 py-1.5 text-[8px] rounded-lg',
        md: 'px-6 py-2.5 text-[9px] rounded-xl',
        lg: 'px-8 py-3.5 text-[10px] rounded-2xl',
    };
    let label: string;
    if (!isLoggedIn) {
        label = '+ Inspo';
    } else if (isFollowing) {
        label = "Inspo'd ✓";
    } else if (targetFollowsMe || isFollowBack) {
        label = '+ Inspo Back';
    } else {
        label = '+ Inspo';
    }

    const baseStyles = `font-black uppercase tracking-[0.2em] transition-all ${sizeMap[size]}`;
    const followingStyles = 'border border-border text-foreground/50 hover:border-red-400/50 hover:text-red-400 bg-card';
    const notFollowingStyles = 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.97]';
    const followBackStyles = 'bg-foreground text-background shadow-xl hover:scale-[1.03] active:scale-[0.97]';

    const buttonStyle = isFollowing
        ? followingStyles
        : (targetFollowsMe || isFollowBack)
            ? followBackStyles
            : notFollowingStyles;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`${baseStyles} ${buttonStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isFollowing ? 'Click to remove from Inspo' : 'Add to Inspo'}
            >
                {loading ? (
                    <span className="inline-flex items-center gap-1.5">
                        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        ...
                    </span>
                ) : label}
            </button>
            {showCount && (
                <div className="flex flex-col items-start">
                    <span className="text-sm font-black italic">{fansCount.toLocaleString()}</span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-foreground/20">Fans</span>
                </div>
            )}
        </div>
    );
}
