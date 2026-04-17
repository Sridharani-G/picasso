import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/SessionProvider';
import { getApiUrl } from '@/utils/apiClient';

interface Feedback {
  _id: string;
  user: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  content: string;
  rating: number;
  kind: 'feedback' | 'guideline';
  targetArtwork?: {
    _id: string;
    title: string;
  };
  targetArtist?: {
    _id: string;
    username: string;
    profileImage?: string;
  };
  threadLink?: string;
  createdAt: string;
  mediaUrl?: string;
  mediaType?: 'gif' | 'image' | 'video' | 'audio' | 'file';
}

interface FeedbackSectionProps {
  targetArtworkId?: string;
  targetArtistId?: string;
}

export default function FeedbackSection({ targetArtworkId, targetArtistId }: FeedbackSectionProps) {
  const { isLoggedIn, user } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadText, setThreadText] = useState('');
  const [threadSubmitting, setThreadSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchFeedback = async () => {
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams();
      if (targetArtworkId) params.set('artworkId', targetArtworkId);
      if (targetArtistId) params.set('artistId', targetArtistId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const feedbackResp = await fetch(`${apiUrl}/feedback${query}`, { method: 'GET', cache: 'no-store' });

      if (!feedbackResp.ok) {
        throw new Error('Network response was not ok');
      }

      const feedbackData = await feedbackResp.json();

      if (feedbackData.success) {
        setFeedbacks(feedbackData.feedback);
      }
    } catch (err) {
      console.error('Failed to fetch feedback', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const postThread = async () => {
    if (!isLoggedIn) {
      setError('Please log in to post your thoughts.');
      return;
    }
    if (!threadText.trim()) {
      setError('Thoughts cannot be empty.');
      return;
    }

    setThreadSubmitting(true);
    setError('');

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          kind: 'feedback',
          content: threadText.trim(),
          rating: targetArtistId ? 5 : 0,
          threadLink: '',
          targetArtwork: targetArtworkId || undefined,
          targetArtist: targetArtistId || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setThreadText('');
        fetchFeedback();
      } else {
        setError(data.message || 'Failed to post thoughts.');
      }
    } catch (err) {
      setError('Network error while posting thoughts.');
      console.error(err);
    } finally {
      setThreadSubmitting(false);
    }
  };

  return (
    <section>
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-black mb-2">Share Your Thoughts</h2>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FFF8EE] flex items-center justify-center text-[#9C6B98] text-sm font-bold overflow-hidden">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1">
            <textarea
              rows={3}
              value={threadText}
              onChange={(e) => setThreadText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm resize-none"
              placeholder="Share your thoughts on the art..."
            />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Add your tip/trick or work critique. Keep it concise.</span>
              <button
                type="button"
                onClick={postThread}
                disabled={threadSubmitting || !threadText.trim()}
                className="px-3 py-1 rounded-lg bg-black text-white text-xs font-bold disabled:opacity-50"
              >
                {threadSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black">Community Thoughts</h2>
        <p className="text-sm text-gray-600">Browse candid thoughts + tips/tricks from artists.</p>
      </div>

      {/* Feedback List */}
      <div className="space-y-4 mb-8">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">Loading feedback...</div>
        ) : feedbacks.length > 0 ? (
          feedbacks.map((item) => (
            <div key={item._id} className="bg-white rounded-xl p-6 shadow-md text-black">
              {item.mediaUrl && (
                <div className="mb-4">
                  {item.mediaType === 'gif' || item.mediaType === 'image' ? (
                    <a href={item.targetArtwork ? `/artwork/${item.targetArtwork._id}` : item.mediaUrl} target="_blank" rel="noopener noreferrer">
                      <img src={item.mediaUrl} alt="Attachment" className="max-w-full rounded-lg hover:opacity-90 transition" />
                    </a>
                  ) : item.mediaType === 'video' ? (
                    <a href={item.targetArtwork ? `/artwork/${item.targetArtwork._id}` : item.mediaUrl} target="_blank" rel="noopener noreferrer">
                      <video src={item.mediaUrl} controls className="max-w-full rounded-lg" />
                    </a>
                  ) : item.mediaType === 'audio' ? (
                    <audio src={item.mediaUrl} controls />
                  ) : (
                    <a href={item.mediaUrl} download className="text-sm underline">
                      Download attachment
                    </a>
                  )}
                </div>
              )}
              <p className="font-medium text-lg mb-2 break-words whitespace-pre-wrap">"{item.content}"</p>
              <p className="text-xs text-gray-500 mb-2">
                {item.kind === 'guideline' ? 'Guideline' : 'Feedback'}
                {item.threadLink && (
                  <span>
                    {' '}• ref: 
                    <a href={item.threadLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-500 hover:text-blue-700">
                      link
                    </a>
                  </span>
                )}
              </p>

              {item.targetArtwork && (
                <div className="mt-2 mb-2 p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs">
                  <p className="font-semibold">Artwork: <a href={`/artwork/${item.targetArtwork._id}`} className="underline hover:text-primary-700">{item.targetArtwork.title}</a></p>
                  <Link
                    href={`/artwork/${item.targetArtwork._id}`}
                    className="inline-block px-3 py-1 mt-1 rounded-lg bg-primary text-white text-[11px] font-black hover:bg-primary/90"
                  >
                    View Artwork
                  </Link>
                </div>
              )}
              <div className="flex justify-between items-center mt-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFF8EE] flex items-center justify-center text-[#9C6B98] text-xs font-bold overflow-hidden">
                    {item.user.profileImage ? (
                      <img src={item.user.profileImage} alt={item.user.username} className="w-full h-full object-cover" />
                    ) : (
                      item.user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{item.user.username}</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
              </div>

              <div className="mt-3 flex items-center justify-start gap-5 text-gray-500 text-sm">
                <button className="flex items-center gap-1 hover:text-black">
                  <span>♡</span> <span>Like</span>
                </button>
                <button className="flex items-center gap-1 hover:text-black">
                  <span>💬</span> <span>Reply</span>
                </button>
                <button className="flex items-center gap-1 hover:text-black">
                  <span>↻</span> <span>Share</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white/5 border border-white/10 rounded-xl p-10 text-center">
            <p className="text-gray-500 text-lg mb-2">Community feedback will appear here.</p>
            <p className="text-gray-400 text-sm">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
}
