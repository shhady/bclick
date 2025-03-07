import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import Cart from '@/models/cart';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from '@/components/loader/Loader';

// Simple dynamic import without client-side only options
const FavoriteProducts = dynamic(() => import('./FavoriteProducts'));

// Enhanced Server-Side Rendering Strategy
export const revalidate = 60; // Cache for 60 seconds
// export const dynamic = 'force-dynamic'; // Ensure fresh data for critical sections

export default async function FavouritesPage({ params }) {
  const { clientId, supplierId } = await params;

  try {
    await connectToDB();

    // Fetch supplier details from User model
    const supplier = await User.findById(supplierId);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Fetch all categories for this supplier
    const categories = await Category.find({ supplierId });

    // Fetch favorites for this client
    const favoriteDoc = await Favourite.findOne({ clientId }).populate('productIds');
    
    if (!favoriteDoc) {
      // Return empty favorites if none found
      return (
        <div className="pb-20">
          <Suspense fallback={<Loader />}>
            <FavoriteProducts
              supplier={JSON.parse(JSON.stringify(supplier))}
              categories={JSON.parse(JSON.stringify(categories))}
              products={[]}
              favorites={[]}
              supplierId={supplierId}
              clientId={clientId}
              cart={{ items: [] }}
            />
          </Suspense>
        </div>
      );
    }

    // Filter favorite products to only include those from this supplier
    const favoriteProducts = favoriteDoc.productIds.filter(
      product => product.supplierId && product.supplierId.toString() === supplierId
    );

    // Fetch cart for this client and supplier
    const cart = await Cart.findOne({ clientId, supplierId }).populate({
      path: 'items.productId',
      model: Product
    });

    // Serialize the data for client-side rendering
    const serializedSupplier = JSON.parse(JSON.stringify(supplier));
    const serializedCategories = JSON.parse(JSON.stringify(categories));
    const serializedProducts = JSON.parse(JSON.stringify(favoriteProducts));
    const serializedCart = cart ? JSON.parse(JSON.stringify(cart)) : { items: [] };

    return (
      <div className="pb-20">
        <Suspense fallback={<Loader />}>
          <FavoriteProducts
            supplier={serializedSupplier}
            categories={serializedCategories}
            products={serializedProducts}
            favorites={serializedProducts}
            supplierId={supplierId}
            clientId={clientId}
            cart={serializedCart}
          />
        </Suspense>
      </div>
    );
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">שגיאה בטעינת המועדפים</h1>
        <p className="text-gray-600">אירעה שגיאה בטעינת המועדפים. אנא נסה שוב מאוחר יותר.</p>
      </div>
    );
  }
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

function serializeCart(cart) {
  return {
    ...cart,
    _id: cart._id.toString(),
    supplierId: cart.supplierId.toString(),
    clientId: cart.clientId.toString(),
    items: cart.items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      productId: {
        ...item.productId,
        _id: item.productId._id.toString(),
      },
    })),
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}
