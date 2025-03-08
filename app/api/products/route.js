import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await connectToDB();
    
    // Get query parameters
    const url = new URL(request.url);
    const supplierId = url.searchParams.get('supplierId');
    const categoryId = url.searchParams.get('categoryId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { supplierId };
    
    // Add category filter if provided
    if (categoryId && categoryId !== 'all-products') {
      query.categoryId = categoryId;
    }
    
    // Add status filter
    query.status = { $in: ['active', 'out_of_stock'] };
    
    // Fetch products with pagination
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Count total products for pagination info
    const total = await Product.countDocuments(query);
    
    // Serialize products for client
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      supplierId: product.supplierId.toString(),
      categoryId: typeof product.categoryId === 'object' && product.categoryId._id 
        ? product.categoryId._id.toString() 
        : (product.categoryId?.toString() || ''),
      categoryName: typeof product.categoryId === 'object' && product.categoryId.name
        ? product.categoryId.name
        : '',
      createdAt: product.createdAt?.toISOString() || null,
      updatedAt: product.updatedAt?.toISOString() || null,
    }));
    
    return NextResponse.json({
      success: true,
      products: serializedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 