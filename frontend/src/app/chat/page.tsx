'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import PageShell from '@/components/ui/PageShell';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageWindow from '@/components/chat/MessageWindow';
import { apiFetch } from '@/utils/apiClient';
import { Chat } from '@/types';

export function ChatContent() {
  const { user, isLoggedIn, token } = useSession();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get('id');
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatIdFromUrl);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await apiFetch('/chats', { token });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to load chats');
      }
      const mappedChats = (body.chats || []).map((c: any) => ({ ...c, id: c.id || c._id }));
      setChats(mappedChats);
      
      // If we don't have an active chat ID yet (no URL param), pick the first one
      if (mappedChats.length > 0) {
        setActiveChatId((prev) => {
            if (prev) return prev;
            return mappedChats[0].id;
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveChat = async (chatId: string) => {
    if (!token) return;
    setIsChatLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/chats/${chatId}`, { token });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to load conversation');
      }
      const mappedChat = { ...body.chat, id: body.chat.id || body.chat._id };
      setActiveChat(mappedChat);
    } catch (err: any) {
      setError(err?.message || 'Unable to load conversation');
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    loadChats();
  }, [isLoggedIn, token]);

  useEffect(() => {
    if (activeChatId) {
      loadActiveChat(activeChatId);
    }
  }, [activeChatId, token]);

  const handleSelectChat = (chatId: string) => {
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    setActiveChat(null);
    setMessageText('');
    setIsChatLoading(true);
  };

  const handleSendMessage = async (overrideContent?: string) => {
    const content = (typeof overrideContent === 'string' ? overrideContent : messageText).trim();
    if (!token || !activeChat || !content) return;
    
    setIsSending(true);
    try {
      const response = await apiFetch(`/chats/${activeChat.id}/messages`, {
        method: 'POST',
        token,
        body: JSON.stringify({ content })
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.message || 'Failed to send message');
      }
      const mappedChat = { ...body.chat, id: body.chat.id || body.chat._id };
      setActiveChat(mappedChat);
      setChats((prev) => prev.map((chat) => (chat.id === mappedChat.id ? mappedChat : chat)));
      if (!overrideContent) setMessageText('');
    } catch (err: any) {
      setError(err?.message || 'Unable to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <PageShell title="Chats" subtitle="Sign in to access your conversations.">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <h2 className="text-2xl font-bold">Please sign in to view chats.</h2>
          <p className="mt-3 text-sm text-muted-foreground">You need an active account to open your conversations.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/auth/login" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90">Login</Link>
            <Link href="/auth/register" className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">Register</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="flex h-full w-full bg-white">
      <div className="w-[300px] border-r border-slate-100 flex-shrink-0">
        <ChatSidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={handleSelectChat} 
          currentUserId={user?.id} 
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]/30">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 font-medium">
            Loading conversations...
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-rose-50 text-rose-600 px-6 py-4 rounded-2xl border border-rose-100">
              {error}
            </div>
          </div>
        ) : (
          <MessageWindow
            chat={activeChat}
            currentUserId={user?.id}
            messageText={messageText}
            setMessageText={setMessageText}
            onSend={handleSendMessage}
            isSending={isSending}
            isLoading={isChatLoading}
          />
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground/40">Initializing Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
