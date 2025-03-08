import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';

import Product from '@/models/product';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

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
    .populate('items.productId', 'name price stock  barCode imageUrl weight weightUnit')

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

    // Update stock  values on submit
    for (const item of items) {
      const product = cart.items.find((p) => p.productId.toString() === item.productId);
      if (product) {
        product.stock += item.quantity;
      }
    }
    cart.updatedAt = new Date();
    await cart.save();

    return new Response(JSON.stringify({ success: true, message: 'Order submitted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const supplierId = searchParams.get('supplierId');

    if (!clientId || !supplierId) {
      return NextResponse.json(
        { success: false, message: 'Missing client or supplier ID' },
        { status: 400 }
      );
    }

    await connectToDB();
    
    const cart = await Cart.findOne({ clientId, supplierId })
      .populate('items.productId', 'name price stock  barCode imageUrl weight weightUnit')
      .lean();

    if (!cart) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }

    // Serialize the cart data
    const serializedCart = JSON.stringify(cart);

    return NextResponse.json({ 
      success: true, 
      serializedCart 
    });
  } catch (error) {
    console.error('Error in cart API:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}