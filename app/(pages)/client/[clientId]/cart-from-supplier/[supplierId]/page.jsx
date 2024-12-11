import React, { Suspense } from 'react';
import Cart from '@/models/cart';
import { connectToDB } from '@/utils/database';
import Loader from '@/components/loader/Loader';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation'; // Use redirect utility from Next.js

const CartPage = dynamic(() => import('./CartPage'));

export default async function Page({ params }) {
  const { supplierId, clientId } = await params;

  console.log('Received params:', await params);
  if (!supplierId || !clientId) {
    console.error('Missing supplierId or clientId:', { supplierId, clientId });
    redirect(`/client/${clientId}/supplier-catalog/${supplierId}`);
  }

  await connectToDB().catch((error) => {
    console.error('Error connecting to database:', error);
    redirect(`/client/${clientId}/supplier-catalog/${supplierId}`);
  });

  let cart;
  try {
    cart = await Cart.findOne({ clientId, supplierId })
      .populate('items.productId', 'name price stock reserved barCode imageUrl weight weightUnit')
      .lean();

    if (!cart) {
      console.warn(`Cart not found for cli:${clientId} / sup:${supplierId}`);
      redirect(`/client/${clientId}/supplier-catalog/${supplierId}`);
    }

    console.log('Fetched cart:', cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    redirect(`/client/${clientId}/supplier-catalog/${supplierId}`);
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
    redirect(`/client/${clientId}/supplier-catalog/${supplierId}`);
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
