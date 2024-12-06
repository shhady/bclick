'use client';

import Loader from '@/components/loader/Loader';
import React, { useState, useTransition, useEffect } from 'react';
import { AiFillStar } from 'react-icons/ai';

export default function StarToggle({ 
  productId, 
  clientId, 
  onFavoriteToggle 
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPending, startTransition] = useTransition();

  const toggleFavorite = async () => {
    startTransition(async () => {
      try {
        const action = isFavorite ? 'remove' : 'add';
        const response = await fetch(`/api/favourites/${action}`, {
          method: 'POST',
          body: JSON.stringify({ clientId, productId }),
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          setIsFavorite(!isFavorite);
          onFavoriteToggle(productId, !isFavorite);
        }
      } catch (error) {
        console.error('Toggle failed', error);
      }
    });
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/favourites/check`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, productId }),
        });

        const data = await response.json();
        setIsFavorite(data.isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [clientId, productId]);
  return (
    <button 
      onClick={toggleFavorite} 
      disabled={isPending}
      className={`transition-colors ${
        isFavorite ? 'text-yellow-500' : 'text-gray-300'
      }`}
    >
      <AiFillStar size={28} />
      {isPending && <Loader />}
    </button>
  );
}