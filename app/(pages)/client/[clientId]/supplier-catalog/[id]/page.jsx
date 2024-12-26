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
import { Suspense } from 'react';
import Loader from '@/components/loader/Loader';


const ClientComponent = dynamic(() => import('./ClientComponent'))

// Enhanced Server-Side Rendering Strategy
export const revalidate = 60; // Cache for 60 seconds
// export const dynamic = 'force-dynamic'; // Ensure fresh data for critical sections

export default async function Page({ params }) {
  const { id, clientId } = await params;
  await connectToDB();

  const supplier = await User.findById(id)
  .select('name email phone address logo coverImage businessName city country')
  .lean()

  const categories = await  Category.find({ 
    supplierId: id, 
    status: 'shown' 
  })
    .select('name status order supplierId')
    .lean()

    const favourites = await Favourite.findOne({ clientId })
    .populate('productIds', 'name price imageUrl')
    .lean()

    const cart = await Cart.findOne({ clientId, supplierId: id })
    .populate('items.productId', 'name price stock reserved imageUrl')
    .lean()

  // Remove products fetch from initial load
  // const serializedData = {
  //   supplier: serializeSupplier(supplier || {}),
  //   categories: categories?.map(serializeCategory) || [],
  //   favorites: favourites?.productIds?.map(serializeProduct) || [],
  //   cart: cart ? serializeCart(cart) : null
  // };

  const serializedSupplier = serializeSupplier(supplier || {})
  const serializedCategories = categories?.map(serializeCategory) || []
  const serializedFavorites = favourites?.productIds?.map(serializeProduct) || []
  const serializedCart = cart? serializeCart(cart) : null;

  if (!supplier) {
    return <h1>Supplier Not Found</h1>;
  }

  return <Suspense fallback={<Loader/>}>
    <ClientComponent 
    supplier={serializedSupplier}
    favorites={serializedFavorites}
  cart={serializedCart}
  categories={serializedCategories}
    clientId={clientId} />
    </Suspense>;
}

// Extracted serialization functions for reusability
function serializeSupplier(supplier) {
  if (!supplier) return null;
  
  return {
    ...supplier,
    _id: supplier._id?.toString() || '',
    relatedUsers: supplier.relatedUsers?.map((relUser) => ({
      ...relUser,
      _id: relUser._id?.toString() || '',
      user: relUser.user?.toString() || '',
    })) || [],
    orders: supplier.orders?.map(orderId => orderId?.toString() || '') || [],
    products: supplier.products?.map(productId => productId?.toString() || '') || [],
    createdAt: supplier.createdAt?.toISOString() || null,
    updatedAt: supplier.updatedAt?.toISOString() || null,
  };
}

function serializeCategory(category) {
  if (!category) return null;
  
  return {
    ...category,
    _id: category._id?.toString() || '',
    supplierId: category.supplierId?.toString() || '',
  };
}

function serializeProduct(product) {
  if (!product) return null;
  
  return {
    ...product,
    _id: product._id?.toString() || '',
    categoryId: product.categoryId?.toString() || '',
    supplierId: product.supplierId?.toString() || '',
    stock: product.stock || 0,
  };
}

function serializeCart(cart) {
  if (!cart || !cart.items) return null;

  return {
    ...cart,
    _id: cart._id?.toString() || '',
    supplierId: cart.supplierId?.toString() || '',
    clientId: cart.clientId?.toString() || '',
    items: cart.items.map((item) => ({
      ...item,
      _id: item._id?.toString() || '',
      productId: {
        ...item.productId,
        _id: item.productId?._id?.toString() || '',
      },
    })),
    createdAt: cart.createdAt?.toISOString() || null,
    updatedAt: cart.updatedAt?.toISOString() || null,
  };
}