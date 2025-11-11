'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [info, setInfo] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (!email || !password) {
      toast({ title: 'אנא הזן אימייל וסיסמה', variant: 'destructive' });
      setInfo({ type: 'error', text: 'אנא הזן אימייל וסיסמה.' });
      return;
    }
    setIsLoading(true);
    const res = await signIn('credentials', { redirect: false, email, password });
    setIsLoading(false);
    if (res?.error) {
      toast({ title: 'אימייל או סיסמה שגויים', variant: 'destructive' });
      setInfo({ type: 'error', text: 'אימייל או סיסמה שגויים. נסה שוב או אפס סיסמה.' });
      return;
    }
    setInfo({ type: 'success', text: 'התחברת בהצלחה. מעביר לפרופיל...' });
    router.push('/newprofile');
  };

  // Map NextAuth error query param to friendly Hebrew text
  useEffect(() => {
    const err = searchParams?.get('error');
    if (!err) return;
    const messages = {
      OAuthSignin: 'שגיאה בהתחברות דרך ספק חיצוני. נסה שוב.',
      OAuthCallback: 'שגיאה בתהליך ההתחברות. נסה שוב.',
      OAuthCreateAccount: 'שגיאה ביצירת חשבון דרך ספק חיצוני.',
      EmailCreateAccount: 'לא ניתן ליצור חשבון עם האימייל שסופק.',
      Callback: 'שגיאה בעת עיבוד ההתחברות.',
      OAuthAccountNotLinked: 'האימייל כבר קיים אך לא מקושר לספק זה. התחבר עם השיטה המקורית.',
      EmailSignin: 'שגיאה בשליחת דוא״ל התחברות.',
      CredentialsSignin: 'אימייל או סיסמה שגויים.',
      AccessDenied: 'הגישה נדחתה.',
      Configuration: 'תצורת התחברות שגויה.',
      Default: 'אירעה שגיאה לא צפויה בהתחברות.',
    };
    const text = messages[err] || messages.Default;
    setInfo({ type: 'error', text });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">התחבר לחשבון שלך</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          או{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            צור חשבון חדש
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {info.text ? (
            <div className={`mb-4 rounded-md p-3 text-sm ${info.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {info.text}
            </div>
          ) : null}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              המשך עם Google
            </button>
            <div className="mt-4 flex items-center">
              <div className="w-full border-t border-gray-200" />
              <span className="px-3 text-xs text-gray-400">או</span>
              <div className="w-full border-t border-gray-200" />
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                אימייל
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                סיסמה
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'מתחבר...' : 'התחבר'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}