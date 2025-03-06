'use client';

import { Suspense } from 'react';
import NewProfilePage from './NewProfilePage';
import Loader from '@/components/loader/Loader';

export default function ClientProfileWrapper({ user }) {
  return (
    <Suspense fallback={<Loader />}>
      <NewProfilePage user={user} />
    </Suspense>
  );
} 