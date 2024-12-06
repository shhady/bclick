import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';

export async function POST(req) {
  const { clientId, productId } = await req.json();
  await connectToDB();

  const favorite = await Favourite.findOneAndUpdate(
    { clientId },
    { $addToSet: { productIds: productId } },
    { upsert: true, new: true }
  );

  return new Response(JSON.stringify(favorite), { status: 200 });
}
