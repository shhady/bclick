'use client';

import React, { useState, useEffect } from 'react';
import { AiFillStar } from 'react-icons/ai';

export default function StarToggle({ productId, clientId, onRemove, confirmRemoval = false }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const toggleFavorite = async () => {
    try {
      if (isFavorite && confirmRemoval) {
        setShowConfirmation(true);
        return;
      }

      const endpoint = isFavorite ? `/api/favourites/remove` : `/api/favourites/add`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, productId }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        if (isFavorite && onRemove) onRemove(productId); // Trigger removal callback
      } else {
        console.error('Failed to toggle favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const confirmRemoveFavorite = async () => {
    try {
      const response = await fetch(`/api/favourites/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, productId }),
      });

      if (response.ok) {
        setIsFavorite(false);
        if (onRemove) onRemove(productId);
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div>
      <button
        onClick={toggleFavorite}
        className={`text-2xl ${
          isFavorite ? 'text-yellow-500' : 'text-gray-300'
        }`}
      >
        <AiFillStar size={28} />
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg text-center">
            <p className="text-lg font-semibold mb-4">
            האם אתה בטוח שברצונך להסיר את המוצר הזה מהמועדפים?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRemoveFavorite}
                className="bg-red-500 text-white px-4 py-2 rounded w-1/4"
              >
                כן
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded w-1/4"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
