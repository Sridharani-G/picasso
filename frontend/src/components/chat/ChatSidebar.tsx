'use client';

import Link from 'next/link';
import { Chat } from '@/types';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useSession } from '@/components/SessionProvider';

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUserId?: string;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatChatTitle = (chat: Chat, currentUserId?: string) => {
  if (chat.isGroup) return chat.groupName || 'Group Chat';
  const other = chat.participants.find((participant) => participant.id !== currentUserId);
  return other?.username || 'Conversation';
};

export default function ChatSidebar({ chats, activeChatId, onSelectChat, currentUserId }: ChatSidebarProps) {
  const { user } = useSession();

  return (
    <aside className="h-full flex flex-col bg-white overflow-hidden">
      {/* ── Community Hub Link ── */}
      <div className="px-6 py-8">
        <Link 
          href="/community" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-800 hover:text-slate-500 transition-colors"
        >
          <ArrowUpRightIcon className="w-3 h-3 stroke-[3]" />
          Visit Community Hub
        </Link>
      </div>

      {/* ── Admin / User Section ── */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E5E9F0] flex items-center justify-center text-slate-500 font-bold text-sm">
            {user ? getInitials(user.username) : 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B0B8C4]">Admin</span>
            <span className="text-[13px] font-black uppercase tracking-tight text-slate-800 -mt-0.5">
              {user?.username || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Conversations List ── */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <div className="px-4 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B0B8C4]">Conversations</h3>
        </div>

        <div className="space-y-1">
          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
            const title = formatChatTitle(chat, currentUserId);
            
            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 text-left ${
                  isActive ? 'bg-[#F0F2F5]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#E5E9F0] flex items-center justify-center text-slate-500 font-bold text-[11px] shrink-0">
                   {getInitials(title)}
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-black text-slate-800 truncate">
                      {title.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-bold text-[#B0B8C4] whitespace-nowrap">
                      {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-[#B0B8C4] truncate">
                    [{chat.lastMessage || 'No messages'}]
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sidebar Footer Profile ── */}
      <div className="p-6 border-t border-slate-50">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-[10px] cursor-pointer hover:bg-slate-700 transition-colors">
          {(user?.username || 'N')[0].toUpperCase()}
        </div>
      </div>
    </aside>
  );
}

