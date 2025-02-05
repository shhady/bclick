'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CompleteProfile() {
  const { clerkUser, setDbUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: clerkUser?.firstName || '',
    email: clerkUser?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    address: '',
    city: '',
    country: '',
    area: 'all-areas',
    role: 'client', // Default role
    businessName: '',
    businessNumber: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clerkId: clerkUser.id,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
        router.push('/dashboard'); // Or wherever you want to redirect after profile completion
      } else {
        throw new Error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      // Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... form JSX
} 