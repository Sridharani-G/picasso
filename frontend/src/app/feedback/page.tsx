'use client';

import FeedbackSection from '@/components/FeedbackSection';

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-[#1a1f3a] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-4xl font-serif font-bold mb-3 uppercase tracking-wide">Community Feedback</h1>
        <p className="text-gray-200 mb-8 text-lg">
          Share and discover art commentary just like Twitter/X threads — post quick feedback, tips, and tricks with thread links.
        </p>

        <div className="bg-white rounded-xl shadow-2xl p-6 text-gray-900 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold mb-2">Post Guidelines</h2>
          <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
            <li>Be constructive: focus on what can be improved and what works well.</li>
            <li>Stay respectful: no hate, no spam, no abuse.</li>
            <li>Share practical tips and tricks for other artists to learn from.</li>
            <li>Attach references, time-lapses, or thread links from X/Twitter for more context.</li>
          </ul>
        </div>

        <FeedbackSection />
      </div>
    </div>
  );
}
