import { useState } from 'react';
import { useSession } from '@/components/SessionProvider';
import { getApiUrl } from '@/utils/apiClient';

export default function CreateCategory() {
  const { user } = useSession();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user || (!user.isArtist && !user.isOrganization)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Classification instantiated successfully.');
        setName('');
        setDescription('');
      } else {
        setError(data.message || 'Failed to instantiate classification');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-[2rem] p-8 shadow-2xl border border-border mt-10">
      <h3 className="text-[11px] font-black mb-6 uppercase tracking-[0.3em] text-foreground/40 italic">Manifest New Classification</h3>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-2 italic">Classification Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
            placeholder="e.g. Manga, 3D Art"
            required
          />
        </div>
        <div>
          <label className="block text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em] mb-2 italic">Manifesto / Essence (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
            placeholder="Describe this category..."
            rows={2}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] transition-all active:scale-[0.98] shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {loading ? 'Instantiating...' : 'Instantiate'}
        </button>
      </form>
    </div>
  );
}
