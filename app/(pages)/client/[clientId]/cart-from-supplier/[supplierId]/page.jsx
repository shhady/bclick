import React, { Suspense } from 'react';
import Cart from '@/models/cart';
// import CartPage from './CartPage';
import { connectToDB } from '@/utils/database';
import Loader from '@/components/loader/Loader';
import dynamic from 'next/dynamic';

const CartPage = dynamic(() => import('./CartPage'))

export default async function Page({ params }) {
  const { supplierId, clientId } = await params;

  await connectToDB().catch((error) => {
    console.error('Error connecting to database:', error);
    return <div>Error connecting to database</div>;
  });

  let cart;
    try {
    // Fetch cart data and populate necessary fields
    cart = await Cart.findOne({ clientId, supplierId })
      .populate('items.productId', 'name price stock reserved barCode imageUrl weight weightUnit')
      .lean();

    // Serialize the cart data
    console.log(cart);
   
  } catch (error) {
    console.error('Error fetching cart:', error);
    return <div>Error loading cart cli:{clientId} / sup:{supplierId}</div>;
  }

  const serializedCart = cart ? serializeCart(cart) : null;

  return <Suspense fallback={<Loader />}><CartPage cart={serializedCart} supplierId={supplierId} clientId={clientId}/></Suspense>;
}

// Helper function to serialize cart data
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
    createdAt: cart.createdAt ? cart.createdAt.toISOString() : null,
    updatedAt: cart.updatedAt ? cart.updatedAt.toISOString() : null,
  };
}