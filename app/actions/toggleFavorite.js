'use server';

import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite'; // Replace with your actual model

export async function toggleFavorite({ clientId, productId, isFavorite }) {
  await connectToDB();
  try {
    if (isFavorite) {
      // Remove from favorites
      await Favourite.updateOne(
        { clientId },
        { $pull: { productIds: productId } }
      );
    } else {
      // Add to favorites
      await Favourite.updateOne(
        { clientId },
        { $addToSet: { productIds: productId } },
        { upsert: true } // Create the record if it doesn't exist
      );
    }

    return { success: true, isFavorite: !isFavorite }; // Toggle the status and return it
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return { success: false, isFavorite }; // Return the current status in case of error
  }
}
