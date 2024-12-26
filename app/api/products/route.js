import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const categoryId = searchParams.get('categoryId');
    const supplierId = searchParams.get('supplierId');

    const skip = (page - 1) * limit;

    await connectToDB();

    // First get total count
    const total = await Product.countDocuments({ 
      categoryId, 
      supplierId,
      stock: { $gt: 0 } // Only count in-stock items
    });

    // Then get paginated products
    const products = await Product.find({ 
      categoryId, 
      supplierId,
      stock: { $gt: 0 } // Only get in-stock items
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean(); // Convert to plain JS objects

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 