import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectToDB();
    const { items } = await request.json();

    const stockInfo = {};
    
    for (const item of items) {
      const product = await Product.findById(item.productId._id);
      if (product) {
        const available = product.stock - (product.reserved || 0);
        stockInfo[product._id] = {
          available,
          hasEnough: available >= item.quantity
        };
      }
    }

    return NextResponse.json({ 
      success: true, 
      stockInfo,
      hasEnoughStock: Object.values(stockInfo).every(info => info.hasEnough)
    });
  } catch (error) {
    console.error('Error validating stock:', error);
    return NextResponse.json(
      { error: 'Failed to validate stock' },
      { status: 500 }
    );
  }
} 