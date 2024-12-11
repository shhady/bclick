import React, { Suspense } from 'react';
import Cart from '@/models/cart';
// import CartPage from './CartPage';
import { connectToDB } from '@/utils/database';
import Loader from '@/components/loader/Loader';
import dynamic from 'next/dynamic';

const CartPage = dynamic(() => import('./CartPage'))

export default async function Page({ params }) {
  const { supplierId, clientId } = await params;

  console.log('Received params:', params);
  if (!supplierId || !clientId) {
    console.error('Missing supplierId or clientId:', { supplierId, clientId });
    return <div>Invalid parameters provided</div>;
  }

  await connectToDB().catch((error) => {
    console.error('Error connecting to database:', error);
    return <div>Error connecting to database</div>;
  });

  let cart;
  try {
    cart = await Cart.findOne({ clientId, supplierId })
      .populate('items.productId', 'name price stock reserved barCode imageUrl weight weightUnit')
      .lean();

    if (!cart) {
      console.warn(`Cart not found for cli:${clientId} / sup:${supplierId}`);
      return <div>No cart found for the specified client and supplier</div>;
    }

    console.log('Fetched cart:', cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return <div>Error loading cart cli:{clientId} / sup:{supplierId}</div>;
  }

  const serializedCart = serializeCart(cart);

  try {
    return (
      <Suspense fallback={<Loader />}>
        <CartPage cart={serializedCart} supplierId={supplierId} clientId={clientId} />
      </Suspense>
    );
  } catch (renderError) {
    console.error('Error rendering CartPage:', renderError);
    return <div>Error rendering cart page</div>;
  }
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