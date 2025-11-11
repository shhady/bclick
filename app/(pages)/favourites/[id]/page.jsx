import { connectToDB } from '@/utils/database';
import Favourite from '@/models/favourite';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import Cart from '@/models/cart';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from '@/components/loader/Loader';
import { currentUser } from '@/utils/auth';
// Simple dynamic import without client-side only options
const FavoriteProducts = dynamic(() => import('./FavoriteProducts'));

// Enhanced Server-Side Rendering Strategy
export const revalidate = 60; // Cache for 60 seconds
// export const dynamic = 'force-dynamic'; // Ensure fresh data for critical sections

export default async function FavouritesPage({ params }) {
  const { id } = await params;
  const user = await currentUser();
  
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">התחברות נדרשת</h1>
        <p className="text-gray-600">עליך להתחבר כדי לצפות במועדפים שלך.</p>
      </div>
    );
  }

  try {
    await connectToDB();

    // Get the client's MongoDB document by session user id
    const client = await User.findById(user.id);
    if (!client) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-500 mb-4">משתמש לא נמצא</h1>
          <p className="text-gray-600">לא נמצא משתמש מתאים במערכת.</p>
        </div>
      );
    }
    
    const clientId = client._id;

    // Fetch supplier details from User model
    const supplier = await User.findById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Fetch all categories for this supplier
    const categories = await Category.find({ supplierId: id });

    // Fetch favorites for this client
    const favoriteDoc = await Favourite.findOne({ clientId });
    
    // Get favorite product IDs
    let favoriteProductIds = [];
    if (favoriteDoc && favoriteDoc.productIds) {
      favoriteProductIds = favoriteDoc.productIds.map(id => id.toString());
    }
    
    // Fetch the actual product documents for these IDs
    const favoriteProducts = await Product.find({
      _id: { $in: favoriteProductIds },
      supplierId: id
    });

    // Fetch cart for this client and supplier
    const cart = await Cart.findOne({ clientId, supplierId: id }).populate({
      path: 'items.productId',
      model: Product
    });

    // Serialize the data for client-side rendering
    const serializedSupplier = serializeSupplier(supplier);
    const serializedCategories = categories.map(category => serializeCategory(category));
    const serializedProducts = favoriteProducts.map(product => serializeProduct(product));
    const serializedCart = cart ? serializeCart(cart) : { items: [] };

    return (
      <div className="pb-20">
        <Suspense fallback={<Loader />}>
          <FavoriteProducts
            supplier={serializedSupplier}
            categories={serializedCategories}
            products={serializedProducts}
            favorites={serializedProducts}
            supplierId={id}
            clientId={clientId.toString()}
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
        <p className="text-gray-500 mt-2">{error.message}</p>
      </div>
    );
  }
}

function serializeSupplier(supplier) {
  const supplierObj = supplier.toObject();
  return {
    ...supplierObj,
    _id: supplierObj._id.toString(),
    relatedUsers: supplierObj.relatedUsers?.map((relUser) => ({
      ...relUser,
      _id: relUser._id.toString(),
      user: relUser.user.toString(),
    })) || [],
    orders: supplierObj.orders?.map((orderId) => orderId.toString()) || [],
    products: supplierObj.products?.map((productId) => productId.toString()) || [],
    createdAt: supplierObj.createdAt ? supplierObj.createdAt.toISOString() : null,
    updatedAt: supplierObj.updatedAt ? supplierObj.updatedAt.toISOString() : null,
  };
}

function serializeProduct(product) {
  const productObj = product.toObject();
  return {
    ...productObj,
    _id: productObj._id.toString(),
    categoryId: productObj.categoryId.toString(),
    supplierId: productObj.supplierId.toString(),
    createdAt: productObj.createdAt ? productObj.createdAt.toISOString() : null,
    updatedAt: productObj.updatedAt ? productObj.updatedAt.toISOString() : null,
  };
}

function serializeCategory(category) {
  const categoryObj = category.toObject();
  return {
    ...categoryObj,
    _id: categoryObj._id.toString(),
    supplierId: categoryObj.supplierId.toString(),
    createdAt: categoryObj.createdAt ? categoryObj.createdAt.toISOString() : null,
    updatedAt: categoryObj.updatedAt ? categoryObj.updatedAt.toISOString() : null,
  };
}

function serializeCart(cart) {
  const cartObj = cart.toObject();
  return {
    ...cartObj,
    _id: cartObj._id.toString(),
    supplierId: cartObj.supplierId.toString(),
    clientId: cartObj.clientId.toString(),
    items: cartObj.items.map((item) => ({
      ...item,
      _id: item._id.toString(),
      productId: item.productId ? {
        ...item.productId,
        _id: item.productId._id.toString(),
        categoryId: item.productId.categoryId.toString(),
        supplierId: item.productId.supplierId.toString(),
        createdAt: item.productId.createdAt ? item.productId.createdAt.toISOString() : null,
        updatedAt: item.productId.updatedAt ? item.productId.updatedAt.toISOString() : null,
      } : null,
    })),
    createdAt: cartObj.createdAt ? cartObj.createdAt.toISOString() : null,
    updatedAt: cartObj.updatedAt ? cartObj.updatedAt.toISOString() : null,
  };
}
