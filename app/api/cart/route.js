import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';

import Product from '@/models/product';

export async function PUT(req) {
  await connectToDB();
  try {
    const { clientId, supplierId, productId, quantity } = await req.json();

    if (quantity < 1) {
      return new Response(JSON.stringify({ success: false, message: 'Quantity must be at least 1' }), { status: 400 });
    }

    const cart = await Cart.findOne({ clientId, supplierId });
    if (!cart) {
      return new Response(JSON.stringify({ success: false, message: 'Cart not found' }), { status: 404 });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    if (!existingItem) {
      return new Response(JSON.stringify({ success: false, message: 'Product not found in cart' }), { status: 404 });
    }

    existingItem.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findOne({ clientId, supplierId })
    .populate('items.productId', 'name price stock reserved barCode imageUrl weight weightUnit')

    return new Response(JSON.stringify({ success: true, cart:populatedCart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  await connectToDB();
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const supplierId = searchParams.get('supplierId');
    const productId = searchParams.get('productId');

    const cart = await Cart.findOne({ clientId, supplierId });
    if (!cart) {
      return new Response(JSON.stringify({ success: false, message: 'Cart not found' }), { status: 404 });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  await connectToDB();
  try {
    const { clientId, supplierId, items } = await req.json();

    const cart = await Cart.findOne({ clientId, supplierId });
    if (!cart) {
      return new Response(JSON.stringify({ success: false, message: 'Cart not found' }), { status: 404 });
    }

    // Update stock reserved values on submit
    for (const item of items) {
      const product = cart.items.find((p) => p.productId.toString() === item.productId);
      if (product) {
        product.reserved += item.quantity;
      }
    }
    cart.updatedAt = new Date();
    await cart.save();

    return new Response(JSON.stringify({ success: true, message: 'Order submitted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}


export default async function GET(re) {
  // const { clientId, supplierId } = params;

  await connectToDB();
  const { clientId, supplierId } = await req.json();

  console.log(clientId, supplierId);
  
    try {
      const cart = await Cart.findOne({ clientId, supplierId })
        .populate('items.productId')
        .lean();

      if (!cart) {
        return new Response(JSON.stringify({ success: false, message: 'Cart not found' }), { status: 404 });
      }

      return new Response(JSON.stringify({ success: true, cart }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
    }
  
}