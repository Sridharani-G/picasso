'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { getApiUrl } from '@/utils/apiClient';
import { siteConfig } from '@/config/site';
import { useRouter } from 'next/navigation';
import SessionManager from '@/utils/sessionManager';

const ART_CATEGORIES = [
  'Anime', 'Manga', 'Comic', 'Cartoon', 'Celebrity', 'Movie', 'OC Character', 'Fan Art',
  'Digital Art', 'Traditional Art', 'Photography', 'Illustration', 'Sculpture', 'Mixed Media',
  '3D Art', 'Concept Art', 'Fantasy', 'Sci-Fi', 'Portrait', 'Landscape', 'Abstract', 'Surreal',
  'Minimalism', 'Street Art', 'Pop Art', 'Expressionism', 'Realism', 'Impressionism', 'Cyberpunk',
  'Modern', 'Contemporary', 'Vintage', 'Neo-Classical', 'Art Nouveau', 'Renaissance', 'Graphic Design',
  'Mixed', 'Other'
];

const ART_STYLES = [
  'Realism', 'Hyperrealism', 'Surrealism', 'Abstract', 'Impressionism', 'Expressionism',
  'Cubism', 'Futurism', 'Pop Art', 'Minimalism', 'Digital Illustration', 'Pixel Art', 'Line Art',
  'Watercolor', 'Ink', 'Vector', '3D Modeling', 'Low Poly', 'Photorealism', 'Concept', 'Character',
  'Environment', 'Typography', 'Collage', 'Mosaic', 'Graffiti', 'Kawaii',
  'Mixed', 'Other'
];

type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface FileEntry {
  id: string;
  file: File;
  previewUrl: string;
  status: FileStatus;
  error?: string;
}

interface ChipPickerProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  customPlaceholder: string;
}

function ChipPicker({ label, options, selected, onChange, customPlaceholder }: ChipPickerProps) {
  const [customValue, setCustomValue] = useState('');

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const addCustom = () => {
    const v = customValue.trim();
    if (v && !selected.includes(v)) {
      onChange([...selected, v]);
    }
    setCustomValue('');
  };

  const removeChip = (chip: string) => onChange(selected.filter(s => s !== chip));

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">
        {label}
        {selected.length > 0 && (
          <span className="ml-2 text-primary/60 normal-case tracking-normal font-normal">
            ({selected.length} selected)
          </span>
        )}
      </label>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(chip => (
            <span
              key={chip}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md shadow-primary/20"
            >
              {chip}
              <button
                type="button"
                onClick={() => removeChip(chip)}
                className="hover:opacity-70 transition-opacity"
                aria-label={`Remove ${chip}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {options.filter(o => o !== 'Other').map(opt => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border transition-all duration-150
                ${active
                  ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105'
                  : 'bg-background text-foreground/50 border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/60'
                }`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={customValue}
          onChange={e => setCustomValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder={customPlaceholder}
          maxLength={60}
          className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-foreground/20"
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customValue.trim()}
          className="px-4 py-3 bg-muted border border-border rounded-xl text-[10px] font-black uppercase tracking-wider text-foreground/50 hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-30"
        >
          + Add
        </button>
      </div>
      <p className="text-[9px] text-foreground/20 uppercase font-black tracking-tighter pl-1">
        Click chips to select/deselect. Type a custom value and press Enter or &ldquo;+ Add&rdquo;.
      </p>
    </div>
  );
}

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techniques: 'Digital Painting',
    isForSale: false,
    price: '',
    tags: '',
    collaboratorUsernames: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Anime']);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['Realism']);
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = SessionManager.getToken();
    const userData = SessionManager.getUser();
    if (!token || !userData) {
      window.location.href = '/auth/login';
      return;
    }
    setUser(userData);
    setCheckingAuth(false);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
    const entries: FileEntry[] = imageFiles.map(f => ({
      id: `${f.name}-${f.size}-${Date.now()}-${Math.random()}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'pending'
    }));
    setFileEntries(prev => [...prev, ...entries]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const removeFile = (id: string) => {
    setFileEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter(e => e.id !== id);
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const uploadBatch = async (entries: FileEntry[]): Promise<boolean> => {
    const category = selectedCategories.length > 0 ? selectedCategories.join(', ') : 'Other';
    const style = selectedStyles.length > 0 ? selectedStyles.join(', ') : 'Other';

    const uploadData = new FormData();
    // Append all files with the same field name 'media'
    entries.forEach(entry => {
      uploadData.append('media', entry.file);
    });

    uploadData.append('title', formData.title.trim());
    uploadData.append('description', formData.description);
    uploadData.append('category', category);
    uploadData.append('style', style);
    uploadData.append('techniques', formData.techniques);

    if (formData.isForSale && formData.price) {
      uploadData.append('price', formData.price);
      uploadData.append('isForSale', 'true');
    }

    if (formData.tags) {
      const tagArray = formData.tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(t => t.length > 0);
      uploadData.append('tags', JSON.stringify(tagArray));
    }

    if (formData.collaboratorUsernames) {
      uploadData.append('collaboratorUsernames', formData.collaboratorUsernames);
    }

    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/artworks`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${SessionManager.getToken()}` },
      body: uploadData
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'Upload failed');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');

    if (fileEntries.length === 0) {
      setGlobalError('Please select at least one image to upload.');
      return;
    }
    if (loading) return; // Prevent double submit

    if (!formData.title.trim()) {
      setGlobalError('Title is required.');
      return;
    }
    if (selectedCategories.length === 0) {
      setGlobalError('Please select at least one genre.');
      return;
    }
    if (selectedStyles.length === 0) {
      setGlobalError('Please select at least one art style.');
      return;
    }
    if (user?.isOrganization && formData.isForSale) {
      setGlobalError('Organizations cannot sell artworks. Only artists can do this.');
      return;
    }

    setLoading(true);
    const total = fileEntries.length;
    setUploadProgress({ done: 0, total });

    const setStatusAll = (status: FileStatus, error?: string) => {
      setFileEntries(prev => prev.map(e => ({ ...e, status, error })));
    };

    try {
      setStatusAll('uploading');
      await uploadBatch(fileEntries);
      setStatusAll('done');
      setUploadProgress({ done: total, total });
      
      setLoading(false);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      setLoading(false);
      const errMsg = err instanceof Error ? err.message : 'Failed';
      setGlobalError(errMsg);
      setStatusAll('error', errMsg);
    }
  };

  const resetAll = () => {
    fileEntries.forEach(e => URL.revokeObjectURL(e.previewUrl));
    setFileEntries([]);
    setFormData({
      title: '', description: '',
      techniques: 'Digital Painting', isForSale: false, price: '', tags: '', collaboratorUsernames: ''
    });
    setSelectedCategories(['Anime']);
    setSelectedStyles(['Realism']);
    setGlobalError('');
    setUploadProgress({ done: 0, total: 0 });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    );
  }

  const canUpload = user?.isArtist || user?.isOrganization || user?.role === 'artist' || user?.role === 'company';

  if (!canUpload) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12">
        <div className="bg-card rounded-[2.5rem] shadow-2xl p-12 max-w-lg w-full text-center border border-border">
          <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-10 rotate-[-5deg]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-foreground/40">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-black text-foreground mb-4 uppercase tracking-tight italic">Protocol <span className="text-foreground/20 italic capitalize font-normal tracking-normal">Restricted</span></h2>
          <p className="text-foreground/40 text-[11px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">
            Only verified artists and organizations may synchronize artifacts with the collective mainnet.
          </p>
          <a href="/" className="inline-block bg-primary text-primary-foreground px-12 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">
            Return to {siteConfig.name}
          </a>
        </div>
      </div>
    );
  }

  const doneCount = fileEntries.filter(e => e.status === 'done').length;
  const errorCount = fileEntries.filter(e => e.status === 'error').length;

  return (
    <div className="min-h-screen bg-background py-16 text-foreground">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-card rounded-[3rem] p-10 md:p-16 border border-border shadow-[0_32px_128px_-32px_rgba(0,0,0,0.2)]">
          <h1 className="text-4xl font-serif font-black mb-4 uppercase tracking-tight italic">Artifact <span className="text-foreground/20 italic capitalize font-normal tracking-normal">Serialization</span></h1>
          <p className="text-foreground/40 text-[11px] font-black uppercase tracking-[0.2em] mb-12 leading-relaxed">
            Synchronize your creative vision with the global syndicate. Upload multiple artworks at once.
          </p>

          {globalError && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
              {globalError}
            </div>
          )}

          {loading && (
            <div className="mb-6 bg-primary/5 border border-primary/20 px-6 py-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Transmitting...</span>
                <span className="text-[10px] font-black text-primary">{uploadProgress.done} / {uploadProgress.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: uploadProgress.total ? `${(uploadProgress.done / uploadProgress.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              className="border-2 border-dashed border-border rounded-[2.5rem] p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all group shadow-2xl shadow-foreground/5 bg-background"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              <div className="space-y-4">
                <div className="mx-auto w-20 h-20 bg-muted rounded-[1.5rem] flex items-center justify-center group-hover:bg-primary/10 transition-colors rotate-[-5deg] border border-border">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-foreground/20 group-hover:text-primary transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                    {fileEntries.length > 0 ? 'Add More Files' : 'Initiate Synthesis'}
                  </p>
                  <p className="text-[10px] text-foreground/20 uppercase font-black mt-1">
                    Select or drag multiple images at once
                  </p>
                </div>
              </div>
            </div>

            {fileEntries.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                    {fileEntries.length} file{fileEntries.length !== 1 ? 's' : ''} selected
                    {doneCount > 0 && <span className="text-green-500 ml-2">· {doneCount} done</span>}
                    {errorCount > 0 && <span className="text-red-500 ml-2">· {errorCount} failed</span>}
                  </p>
                  {!loading && (
                    <button
                      type="button"
                      onClick={resetAll}
                      className="text-[9px] font-black uppercase tracking-widest text-foreground/30 hover:text-red-500 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {fileEntries.map((entry) => (
                    <div key={entry.id} className="relative group rounded-2xl overflow-hidden border border-border aspect-square bg-muted">
                      <img
                        src={entry.previewUrl}
                        alt={entry.file.name}
                        className="w-full h-full object-cover"
                      />
                      {entry.status === 'uploading' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                        </div>
                      )}
                      {entry.status === 'done' && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {entry.status === 'error' && (
                        <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center p-2">
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-lg mb-1">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                          {entry.error && (
                            <p className="text-[8px] text-white font-black text-center leading-tight">{entry.error}</p>
                          )}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[8px] text-white font-black truncate">{entry.file.name}</p>
                      </div>
                      {!loading && entry.status !== 'done' && (
                        <button
                          type="button"
                          onClick={(ev) => { ev.stopPropagation(); removeFile(entry.id); }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">
                Designation / Title
              </label>
              <input
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your artifact a name"
                className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm placeholder:text-foreground/10"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">
                Manifest / Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-background border border-border rounded-2xl px-6 py-6 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm resize-none placeholder:text-foreground/10 leading-relaxed"
                placeholder="Describe your artwork..."
              />
            </div>

            <div className="bg-muted/20 border border-border rounded-[2rem] p-6">
              <ChipPicker
                label="Classification (Genre)"
                options={ART_CATEGORIES}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                customPlaceholder="Add a custom genre…"
              />
            </div>

            <div className="bg-muted/20 border border-border rounded-[2rem] p-6">
              <ChipPicker
                label="Art Style"
                options={ART_STYLES}
                selected={selectedStyles}
                onChange={setSelectedStyles}
                customPlaceholder="Add a custom style…"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">
                Techniques (comma separated)
              </label>
              <input
                name="techniques"
                value={formData.techniques}
                onChange={handleChange}
                placeholder="e.g. Watercolor, Ink, Layering"
                className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm placeholder:text-foreground/10"
              />
              <p className="text-[9px] text-foreground/20 uppercase font-black tracking-tighter pl-1">
                Add one or more techniques; separate each with commas.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Resonance Tags / Hashtags</label>
              <input
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                placeholder="#digitalart #vibe #abstract (comma separated)"
                className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm placeholder:text-foreground/10"
              />
              <p className="text-[9px] text-foreground/20 uppercase font-black tracking-tighter pl-1">
                Separate visions with commas. No spaces required between hashes.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">Co-Architects / Collaborators</label>
              <input
                name="collaboratorUsernames"
                type="text"
                value={formData.collaboratorUsernames}
                onChange={handleChange}
                placeholder="username1, username2 (comma separated)"
                className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm placeholder:text-foreground/10"
              />
              <p className="text-[9px] text-foreground/20 uppercase font-black tracking-tighter pl-1">
                Link other users to this artifact. They will appear as co-creators.
              </p>
            </div>

            <div className="space-y-6 bg-muted/30 p-8 rounded-[2rem] border border-border shadow-2xl shadow-foreground/5">
              <h3 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Commercial Manifest</h3>
              <div className="flex items-center">
                <input
                  id="isForSale"
                  name="isForSale"
                  type="checkbox"
                  checked={formData.isForSale}
                  onChange={handleChange}
                  className="h-6 w-6 text-primary focus:ring-primary border-border bg-background rounded-lg transition-all"
                />
                <label htmlFor="isForSale" className="ml-4 block text-[11px] font-black text-foreground uppercase tracking-widest">
                  Enable Direct Acquisition
                </label>
              </div>
              {formData.isForSale && (
                <div className="ml-10 space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-black text-foreground/20 mb-4 uppercase tracking-widest">Valuation ($)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full bg-background border border-border rounded-xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-black"
                    />
                    <div className="mt-6 flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 opacity-20"></div>
                      <p className="text-[9px] text-foreground/20 uppercase font-black tracking-tighter leading-relaxed">
                        Peer-to-peer settlement via verified identity.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || fileEntries.length === 0}
              className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-10"
            >
              {loading
                ? `Transmitting ${uploadProgress.total} Files...`
                : fileEntries.length > 1
                  ? `Synchronize Carousel (${fileEntries.length} Images)`
                  : 'Synchronize'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
