import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';
import dynamic from 'next/dynamic';


const FavoriteProducts = dynamic(() => import('./FavoriteProducts'))

// Enhanced Server-Side Rendering Strategy
export const revalidate = 60; // Cache for 60 seconds
// export const dynamic = 'force-dynamic'; // Ensure fresh data for critical sections

export default async function Page({ params }) {
  const { clientId, supplierId } = await params;

  await connectToDB();

  const [supplier, categories, favourites, products] = await Promise.all([
    User.findById(supplierId).lean().catch((err) => {
      console.error('User fetch failed:', err);
      return null;
    }),
    Category.find({ supplierId: supplierId, status: 'shown' }).lean().catch((err) => {
      console.error('Category fetch failed:', err);
      return [];
    }),
    Favourite.findOne({ clientId })
      .populate('productIds')
      .lean()
      .catch((err) => {
        console.error('Favourites fetch failed:', err);
        return null;
      }),
    Product.find({
      supplierId: supplierId,
      status: { $in: ['active', 'out_of_stock'] },
    })
      .lean()
      .catch((err) => {
        console.error('Product fetch failed:', err);
        return [];
      }),
  ]);

  if (!supplier) {
    console.error('Supplier not found for ID:', supplierId);
    return <h1>Supplier Not Found</h1>;
  }

  const serializedData = {
    supplier: serializeSupplier(supplier),
    categories: categories.map(serializeCategory),
    products: products.map(serializeProduct),
    favorites: favourites?.productIds?.map(serializeProduct) || [],
  };

  return (
    <div className="mb-20">
      {/* <h1 className="text-2xl font-bold my-6">
        המועדפים שלך מהספק {serializedData.supplier.businessName}
      </h1> */}
    <Suspense fallback={<Loader/>}>  <FavoriteProducts {...serializedData} clientId={clientId} /></Suspense>
    </div>
  );
}

function serializeSupplier(supplier) {
  return {
    ...supplier,
    _id: supplier._id.toString(),
    relatedUsers: supplier.relatedUsers?.map((relUser) => ({
      ...relUser,
      _id: relUser._id.toString(),
      user: relUser.user.toString(),
    })) || [],
    orders: supplier.orders?.map((orderId) => orderId.toString()) || [],
    products: supplier.products?.map((productId) => productId.toString()) || [],
    createdAt: supplier.createdAt ? supplier.createdAt.toISOString() : null,
    updatedAt: supplier.updatedAt ? supplier.updatedAt.toISOString() : null,
  };
}

function serializeProduct(product) {
  return {
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId.toString(),
    supplierId: product.supplierId.toString(),
  };
}


function serializeCategory(category) {
  return {
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
  };
}
