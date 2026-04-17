'use client';

import { useState, useRef } from 'react';
import { Chat } from '@/types';
import { FaceSmileIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import GifPicker from './GifPicker';

interface MessageWindowProps {
  chat: Chat | null;
  currentUserId?: string;
  messageText: string;
  setMessageText: (value: string) => void;
  onSend: (override?: string) => void;
  isSending: boolean;
}

const COMMON_EMOJIS = ['😊', '😂', '🔥', '❤️', '👍', '✨', '🎨', '📸', '🙌', '💡'];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function MessageWindow({ chat, currentUserId, messageText, setMessageText, onSend, isSending }: MessageWindowProps) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center bg-white/50">
        <div>
          <h2 className="text-[13px] font-black uppercase tracking-widest text-[#B0B8C4]">Pick a conversation</h2>
          <p className="mt-2 text-[11px] font-medium text-[#B0B8C4]/60">Select someone from the list to start chatting.</p>
        </div>
      </div>
    );
  }

  const otherParticipant = chat.participants.find((p) => p.id !== currentUserId);
  const title = chat.isGroup ? chat.groupName || 'Group Chat' : otherParticipant?.username || 'Conversation';

  const handleEmojiClick = (emoji: string) => {
    setMessageText(messageText + emoji);
    setShowEmoji(false);
  };

  const handleGifSelect = (url: string) => {
    onSend(url); 
    setShowGifs(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Automatically send the image for this demo
        onSend(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white overflow-hidden">
      {/* ── Header ── */}
      <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#E5E9F0] flex items-center justify-center text-slate-500 font-bold text-[11px]">
          {getInitials(title)}
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-black uppercase tracking-tight text-slate-800">
            {title.toUpperCase()}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B0B8C4]">
            {chat.messages.length} MESSAGES
          </span>
        </div>
      </div>

      {/* ── Chat Messages ── */}
      <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 flex flex-col custom-scrollbar bg-white">
        {chat.messages.map((message, index) => {
          // sender can be a populated object or a string ID
          const senderId = typeof message.sender === 'string' 
             ? message.sender 
             : (message.sender as any).id || (message.sender as any)._id;
          
          const isMine = senderId === currentUserId;
          const senderName = typeof message.sender === 'string' 
             ? (isMine ? 'Me' : 'Unknown') 
             : (message.sender as any).username;

          const isImage = message.content.startsWith('data:image/') || 
                         (message.content.startsWith('http') && (message.content.includes('giphy.com') || message.content.match(/\.(jpeg|jpg|gif|png)$/)));

          return (
            <div key={`${message.timestamp}-${index}`} className={`flex items-end gap-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {isMine ? 'Me' : (senderName || 'Sender')}
                  </span>
                </div>
                <div className={`max-w-[4000px] rounded-[1.5rem] px-6 py-4 text-[13px] leading-relaxed transition-all duration-300 ${
                  isMine ? 'bg-[#F0F2F5] text-slate-700' : 'bg-white border border-slate-100 text-slate-700 shadow-sm'
                }`}>
                  {isImage ? (
                    <img src={message.content} alt="Attachment" className="rounded-lg max-w-[280px] shadow-sm" />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {chat.messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-[#B0B8C4]/40">
            No history yet... write a suggestion message below
          </div>
        )}
      </div>

      {/* ── Footer / Input ── */}
      <div className="px-10 py-8 border-t border-slate-50 flex-shrink-0 relative">
        {/* ── Emoji Picker ── */}
        {showEmoji && (
          <div className="absolute bottom-[100%] left-10 mb-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 flex gap-2">
            {COMMON_EMOJIS.map(e => (
              <button key={e} onClick={() => handleEmojiClick(e)} className="hover:scale-125 transition-transform text-xl">
                {e}
              </button>
            ))}
          </div>
        )}

        {/* ── GIF Picker ── */}
        {showGifs && (
          <GifPicker 
            onSelect={handleGifSelect}
            onClose={() => setShowGifs(false)}
          />
        )}

        <div className="flex flex-col gap-5">
          {/* ── Toolbar ── */}
          <div className="flex items-center gap-4 px-2">
            <button onClick={() => { setShowEmoji(!showEmoji); setShowGifs(false); }} className={`transition-colors ${showEmoji ? 'text-slate-800' : 'text-[#C8D1E0] hover:text-slate-600'}`}>
              <FaceSmileIcon className="w-5 h-5" />
            </button>
            <button onClick={() => { setShowGifs(!showGifs); setShowEmoji(false); }} className={`text-[9px] font-black border-2 rounded-md px-1 py-0.5 transition-all ${showGifs ? 'text-slate-800 border-slate-800' : 'text-[#C8D1E0] border-[#C8D1E0] hover:text-slate-600 hover:border-slate-600'}`}>
              GIF
            </button>
            <button onClick={triggerFileUpload} className="text-[#C8D1E0] hover:text-slate-600 transition-colors">
              <PaperClipIcon className="w-5 h-5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </div>

          {/* ── Input Bar ── */}
          <form 
            onSubmit={(e) => { e.preventDefault(); onSend(); }} 
            className="relative"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write a suggestion message..."
              className="w-full bg-[#F0F4F9] border-none rounded-full px-8 py-4 text-[13px] font-medium text-slate-700 placeholder:text-[#B0B8C4] focus:ring-2 focus:ring-slate-100 transition-all outline-none"
            />
            {messageText.trim() && (
              <button
                type="submit"
                disabled={isSending}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full hover:bg-slate-700 transition-all"
              >
                {isSending ? '...' : 'Send'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

