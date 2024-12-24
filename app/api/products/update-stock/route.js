import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectToDB();
    const { items, action } = await request.json();

    for (const item of items) {
      const product = await Product.findById(item.productId._id);
      
      if (!product) {
        throw new Error(`Product not found: ${item.productId._id}`);
      }

      if (action === 'approve') {
        // When order is approved: reduce both stock and reserved
        product.stock -= item.quantity;
        product.reserved -= item.quantity;
      } else if (action === 'reject') {
        // When order is rejected: only reduce reserved
        product.reserved -= item.quantity;
      }

      await product.save();
    }

    return NextResponse.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
} 