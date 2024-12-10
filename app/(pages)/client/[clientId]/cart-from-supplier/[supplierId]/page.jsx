import React from 'react';
import Cart from '@/models/cart';
import CartPage from './CartPage';
import { connectToDB } from '@/utils/database';

export default async function Page({ params }) {
  const { supplierId, clientId } = await params;

  await connectToDB()

    try {
    // Fetch cart data and populate necessary fields
    const cart = await Cart.findOne({ clientId, supplierId })
      .populate('items.productId', 'name price stock reserved barCode imageUrl weight weightUnit')
      .lean();

    // Serialize the cart data
    const serializedCart = cart ? serializeCart(cart) : null;
    console.log(cart);
    return <CartPage cart={serializedCart} supplierId={supplierId} clientId={clientId}/>;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return <div>Error loading cart</div>;
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
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
  };
}
