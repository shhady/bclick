'use server';

import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

export async function fetchProducts({ supplierId, categoryId, page = 1, limit = 10 }) {
  try {
    await connectToDB();


    let products;

    if (categoryId === 'all-products') {
      // Fetch all products for the supplier where the category status is "shown"
      products = await Product.find({
        supplierId,
        status: { $in: ['active', 'out_of_stock'] },
      })
        .populate({
          path: 'categoryId',
          match: { status: 'shown' }, // Ensure the category status is "shown"
          select: 'name status', // Only fetch the name and status fields
        })
        .sort({ categoryId: 1, createdAt: -1 }) // Sort by categoryId and then by createdAt (descending)
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      // Fetch products for the specific category
      products = await Product.find({
        supplierId,
        categoryId,
        status: { $in: ['active', 'out_of_stock'] },
      })
        .populate({
          path: 'categoryId',
          match: { status: 'shown' }, // Ensure the category status is "shown"
          select: 'name', // Only fetch the name field
        })
        .sort({ createdAt: -1 }) // Sort by createdAt (descending)
        .skip((page - 1) * limit)
        .limit(limit);
    }

    // Filter out products where the category does not match the "shown" status
    products = products.filter(product => product.categoryId);

    // Map the products to include category name and ensure unique entries
    return products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      categoryId: product.categoryId?._id.toString() || null, // Handle cases where category might not exist
      categoryName: product.categoryId?.name || 'Unknown Category', // Include category name
      supplierId: product.supplierId.toString(),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      imageUrl: product.imageUrl || {},
      units: product.units || '',
      weight: product.weight || '',
      weightUnit: product.weightUnit || '',
      barCode: product.barCode || '',
      status: product.status,
      stock: product.stock,
      description:product.description,
      reserved:product.reserved
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}
