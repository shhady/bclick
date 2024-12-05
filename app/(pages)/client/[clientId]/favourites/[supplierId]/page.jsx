import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';
import User from '@/models/user';
import FavouritesClient from './FavouritesClient';

export default async function Page({ params }) {
  const { clientId } = await params;

  await connectToDB();

  // Fetch the favourite document
  const favourite = await Favourite.findOne({ clientId })
    .populate({
      path: 'productIds',
      populate: {
        path: 'supplierId',
        select: 'businessName',
      },
    })
    .lean();

  if (!favourite || !favourite.productIds.length) {
    return <h1>No Favourites Found</h1>;
  }

  // Serialize products and supplier details
  const serializedProducts = favourite.productIds.map((product) => ({
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    supplierId: {
      _id: product.supplierId._id.toString(),
      businessName: product.supplierId.businessName,
    },
    createdAt: product.createdAt.toISOString(),
  }));

  return (
    <div className='p-8'>
      <h1 className="text-2xl font-bold my-6">
        המועדפים שלך מהספק {serializedProducts[0].supplierId.businessName}
      </h1>
      <FavouritesClient products={serializedProducts} clientId={clientId}/>
    </div>
  );
}
