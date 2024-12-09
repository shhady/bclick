// actions/productsActions.js

'use server';

import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export async function fetchProducts({ supplierId, categoryId, page = 1, limit = 10 }) {
  try {
    await connectToDB();

    const products = await Product.find({
      supplierId,
      categoryId,
      status: { $in: ['active', 'out_of_stock'] },
    })
      .sort({ createdAt: -1 }) // Most recent first
      .skip((page - 1) * limit)
      .limit(limit);

    return products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      categoryId: product.categoryId.toString(),
      supplierId: product.supplierId.toString(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      imageUrl: product.imageUrl || {}, 
      units: product.units || '',
      weight: product.weight || '',
      weightUnit: product.weightUnit || '',
      barCode: product.barCode || '',
      status: product.status,
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
