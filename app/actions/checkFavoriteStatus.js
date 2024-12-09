'use server';

import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite'; // Replace with your actual model

export async function checkFavoriteStatus({ clientId, productId }) {
  await connectToDB();
  try {
    const favorite = await Favourite.findOne({ clientId, productIds: productId });
    return { isFavorite: !!favorite }; // Return plain object
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { isFavorite: false }; // Return false in case of error
  }
}
