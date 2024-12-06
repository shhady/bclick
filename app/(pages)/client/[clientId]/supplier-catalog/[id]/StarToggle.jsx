import React, { useState, useEffect } from 'react';
import { AiFillStar } from 'react-icons/ai';

export default function StarToggle({ productId, clientId, onFavoriteToggle }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(clientId);
  const toggleFavorite = async () => {
    setLoading(true);
    
    try {
      const action = isFavorite ? 'remove' : 'add';
      const response = await fetch(`/api/favourites/${action}`, {
        method: 'POST',
        body: JSON.stringify({ clientId, productId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const updatedStatus = !isFavorite;
        setIsFavorite(updatedStatus);
        onFavoriteToggle(productId, updatedStatus);
      } else {
        throw new Error('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Toggle failed', error);
    } finally {
      setLoading(false);
    }
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
      disabled={loading}
      className={`transition-colors ${
        isFavorite ? 'text-yellow-500' : 'text-gray-300'
      }`}
    >
      <AiFillStar size={28} />
      {loading && <span className="loader"></span>}
    </button>
  );
}
