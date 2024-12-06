import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';

export async function POST(req) {
    const { clientId, productId } = await req.json();
    await connectToDB();
  
    const favorite = await Favourite.findOneAndUpdate(
      { clientId },
      { $pull: { productIds: productId } },
      { new: true }
    );
  
    if (!favorite) {
      return new Response(JSON.stringify({ message: 'Favorite not found' }), { status: 404 });
    }
  
    return new Response(JSON.stringify(favorite), { status: 200 });
  }
  