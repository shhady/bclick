import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';

export async function POST(req) {
  const { clientId, productId } = await req.json();
  await connectToDB();

  const favorite = await Favourite.findOne({ clientId, productIds: productId });
  return new Response(JSON.stringify({ isFavorite: !!favorite }));
}
