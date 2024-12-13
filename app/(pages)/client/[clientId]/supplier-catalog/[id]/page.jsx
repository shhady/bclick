import { connectToDB } from '@/utils/database';
import User from '@/models/user';
import Product from '@/models/product';
import Category from '@/models/category';
import SupplierDetails from './SupplierDetails';
import SupplierCategories from './SupplierCategories';
// import ClientComponent from './ClientComponent';
import Link from 'next/link';
import Favourite from '@/models/favourite';
import dynamic from 'next/dynamic';
import Cart from '@/models/cart';


const ClientComponent = dynamic(() => import('./ClientComponent'))

// Enhanced Server-Side Rendering Strategy
export const revalidate = 60; // Cache for 60 seconds
// export const dynamic = 'force-dynamic'; // Ensure fresh data for critical sections

export default async function Page({ params }) {
  const { id, clientId } = await params;
  await connectToDB()
  // Parallel data fetching
  const [supplier, categories, favourites, products, cart] = await Promise.all([
    User.findById(id).lean().catch((err) => {
      console.error('User fetch failed:', err);
      return null;
    }),
    Category.find({ supplierId: id, status: 'shown' }).lean().catch((err) => {
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
      supplierId: id,
      status: { $in: ['active', 'out_of_stock'] },
    })
      .lean()
      .catch((err) => {
        console.error('Product fetch failed:', err);
        return [];
      }),
       Cart.findOne({ clientId, supplierId:id })
      .populate('items.productId', 'name price stock reserved barCode imageUrl weight weightUnit')
      .lean().catch((err) => {
        console.error('Cart fetch failed:', err);
        return [];
      })
  ]);
  // More robust serialization with error handling
  const serializedData = {
    supplier: supplier ? serializeSupplier(supplier) : null,
    categories: categories ? categories.map(serializeCategory) : [],
    products: products ? products.map(serializeProduct) : [],
    favorites: favourites?.productIds?.map(serializeProduct) || [],
    cart: cart ? serializeCart(cart) : null

  };
    
  if (!supplier) {
    console.error('Supplier not found for ID:', id);
    return <h1>Supplier Not Found</h1>;
  }
  return <ClientComponent {...serializedData} clientId={clientId} />;
}

// Extracted serialization functions for reusability
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
    createdAt: supplier.createdAt?.toISOString() || null,
    updatedAt: supplier.updatedAt?.toISOString() || null,
  };
}

function serializeCategory(category) {
  return {
    ...category,
    _id: category._id.toString(),
    supplierId: category.supplierId.toString(),
  };
}

function serializeProduct(product) {
  return {
    ...product,
    _id: product._id.toString(),
    categoryId: product.categoryId?.toString() || null,
    supplierId: product.supplierId?.toString() || null,
    stock: product.stock, // Ensure stock field is included
  };
}

function serializeCart(cart) {
  if (!cart || !cart.items) return null;

  return {
    ...cart,
    _id: cart._id?.toString() || null,
    supplierId: cart.supplierId?.toString() || null,
    clientId: cart.clientId?.toString() || null,
    items: cart.items.map((item) => ({
      ...item,
      _id: item._id?.toString() || null,
      productId: {
        ...item.productId,
        _id: item.productId?._id?.toString() || null,
      },
    })),
    createdAt: cart.createdAt?.toISOString() || null,
    updatedAt: cart.updatedAt?.toISOString() || null,
  };
}