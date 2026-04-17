'use client';

import { siteConfig } from '@/config/site';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#1a1f3a] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-3xl font-serif font-black italic tracking-tight uppercase mb-4">Signal <span className="text-foreground/20">{siteConfig.shortName}</span></h1>
          <p className="text-foreground/40 font-bold text-xs uppercase tracking-widest leading-loose">Establish direct communication with the platform architects.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-wide">Get in Touch</h2>
          <p className="text-gray-200 mb-4">
            Have questions or need support? Reach out to us directly.
          </p>
          <div className="space-y-2 text-gray-200">
            <p><strong className="text-white">Email:</strong> support@picasso.community</p>
            <p><strong className="text-white">Twitter:</strong> @{siteConfig.shortName}Community</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8 text-gray-900 border border-white/10">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Name</label>
                <input type="text" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email</label>
                <input type="email" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Message</label>
              <textarea rows={5} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] transition-colors"></textarea>
            </div>
            <button type="submit" className="bg-black text-white px-8 py-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
