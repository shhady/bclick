import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';

export async function GET(req, { params }) {
  const { clientId } = await params;

  await connectToDB();

  if (!clientId) {
    return new Response(
      JSON.stringify({ error: 'Client ID is required.' }),
      { status: 400 }
    );
  }

  try {
    // Find the favourite for the client and populate products and their suppliers
    const favourite = await Favourite.findOne({ clientId })
      .populate({
        path: 'productIds',
        populate: {
          path: 'supplierId', // Populate supplier details
          select: 'businessName', // Include only the business name
        },
      })
      .lean();

    if (!favourite || !favourite.productIds.length) {
      return new Response(
        JSON.stringify({ products: [], supplierNames: [] }),
        { status: 200 }
      );
    }

    // Map products and extract supplier names
    const products = favourite.productIds.map((product) => ({
      ...product,
      _id: product._id.toString(),
      supplierId: {
        _id: product.supplierId._id.toString(),
        businessName: product.supplierId.businessName,
      },
    }));

    return new Response(
      JSON.stringify({ products }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
