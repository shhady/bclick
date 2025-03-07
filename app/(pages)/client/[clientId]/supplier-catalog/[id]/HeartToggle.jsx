'use client';
import React, { useState, useEffect } from 'react';
import { AiFillHeart } from 'react-icons/ai';
import { checkFavoriteStatus } from '@/app/actions/checkFavoriteStatus';
import { toggleFavorite } from '@/app/actions/toggleFavorite';

export default function HeartToggle({ productId, clientId, onFavoriteToggle }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // Track whether the status is being checked

  const handleToggle = async () => {
    setLoading(true);

    try {
      const { success, isFavorite: updatedStatus } = await toggleFavorite({
        clientId,
        productId,
        isFavorite,
      });

      if (success) {
        setIsFavorite(updatedStatus);
        onFavoriteToggle(productId, updatedStatus);
      } else {
        throw new Error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const { isFavorite } = await checkFavoriteStatus({ clientId, productId });
        setIsFavorite(isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setChecking(false);
      }
    };

    fetchFavoriteStatus();
  }, [clientId, productId]);

  return (
    <>
      {!checking && ( // Only render the heart after checking is complete
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`transition-colors ${
            isFavorite ? 'text-red-500' : 'text-gray-300'
          }`}
        >
          <AiFillHeart size={28} />
          {loading && <span className="loader"></span>}
        </button>
      )}
    </>
  );
} 