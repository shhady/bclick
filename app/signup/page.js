'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isSupplier: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState({ type: '', text: '' });
  
  const router = useRouter();
  const { toast } = useToast();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, password, confirmPassword, isSupplier } = formData;
    
    if (!name || !email || !password || !confirmPassword) {
      toast({ title: 'אנא מלא את כל השדות', variant: 'destructive' });
      setInfo({ type: 'error', text: 'אנא מלא את כל השדות המסומנים.' });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({ title: 'הסיסמאות אינן תואמות', variant: 'destructive' });
      setInfo({ type: 'error', text: 'הסיסמאות אינן תואמות.' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const role = isSupplier ? 'supplier' : 'client';
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast({ title: data.error || 'יצירת החשבון נכשלה', variant: 'destructive' });
        setInfo({ type: 'error', text: data.error || 'יצירת החשבון נכשלה. ייתכן שכבר קיים חשבון עם האימייל הזה.' });
        setIsLoading(false);
        return;
      }
      
      toast({ title: 'החשבון נוצר בהצלחה!' });
      setInfo({ type: 'success', text: 'החשבון נוצר בהצלחה. נכנסים לחשבון...' });
      
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (signInResult?.error) {
        toast({ title: 'התחברות לאחר הרשמה נכשלה', variant: 'destructive' });
        setInfo({ type: 'error', text: 'התחברות לאחר הרשמה נכשלה. נסה להתחבר ידנית.' });
        setIsLoading(false);
        return;
      }
      
      router.push('/newprofile');
    } catch (error) {
      toast({ title: 'משהו השתבש. אנא נסה שוב.', variant: 'destructive' });
      setInfo({ type: 'error', text: 'משהו השתבש. אנא נסה שוב.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          צור חשבון
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          כבר יש לך חשבון?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            התחבר
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                שם מלא
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                אשר סיסמה
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* <div className="flex items-center">
              <input
                id="isSupplier"
                name="isSupplier"
                type="checkbox"
                checked={formData.isSupplier}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isSupplier" className="ml-2 block text-sm text-gray-700">
                אני ספק
              </label>
            </div> */}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'יוצר חשבון...' : 'הרשמה'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}