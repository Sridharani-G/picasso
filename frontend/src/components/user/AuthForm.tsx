'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SessionManager from '@/utils/sessionManager';
import { getApiUrl, apiFetch } from '@/utils/apiClient';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false,
    accountType: 'artist',
    bio: '',
    artistCategory: '',
    organizationInfo: {
      name: '',
      description: '',
      website: '',
      industry: '',
      size: '',
    },
    socialLinks: {
      instagram: '',
      tiktok: '',
      youtube: '',
      twitter: '',
      artstation: '',
      patreon: '',
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isLoggedIn } = useSession();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn, router]);

  const isLogin = mode === 'login';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = e.target.type;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else if (name.startsWith('org.')) {
      const orgField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        organizationInfo: {
          ...prev.organizationInfo,
          [orgField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const role = formData.accountType;

      const requestData = isLogin
        ? { email: formData.email, password: formData.password }
        : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === 'artist' && {
            bio: formData.bio,
            artistCategory: formData.artistCategory,
            socialLinks: formData.socialLinks
          }),
          ...(role === 'company' && {
            organizationInfo: formData.organizationInfo
          })
        };

      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }
      SessionManager.saveSession(data.token, data.user, formData.rememberMe);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4 py-12">
      <div className="max-w-md w-full bg-card rounded-xl shadow-2xl p-8 space-y-8 text-foreground">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-black text-foreground uppercase tracking-tight italic">
            {isLogin ? 'Login to Picasso' : 'Create an Account'}
          </h2>
          <p className="mt-2 text-foreground/40 text-[10px] font-black uppercase tracking-[0.2em]">
            {isLogin
              ? 'Enter your credentials to log into your account'
              : 'Join our community of artists and explorers'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {!isLogin && (
            <Input
              label="Username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
            />
          )}

          <div className="relative">
            <Input
              label="Email address or Username"
              name="email"
              type="text"
              required
              value={formData.email}
              onChange={handleChange}
            />

          </div>



          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
          />



          {!isLogin && (
            <>
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />


            </>
          )}

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:scale-[1.02] shadow-2xl transition-all uppercase tracking-[0.3em] font-black text-[10px] py-4 rounded-xl"
            isLoading={loading}
            disabled={loading}
          >
            Login
          </Button>
        </form>


      </div>
    </div>
  );
}
