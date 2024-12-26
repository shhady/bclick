'use server';

import { connectToDB } from '@/utils/database';
import Product from '@/models/product';

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchProducts({ supplierId, categoryId, page = 1, limit = 10 }) {
  let retries = 3; // Number of retries
  
  while (retries > 0) {
    try {
      await connectToDB();

      let query = {
        supplierId,
        status: { $in: ['active', 'out_of_stock'] }
      };

      if (categoryId !== 'all-products') {
        query.categoryId = categoryId;
      }

      // First get total count
      const total = await Product.countDocuments(query);

      // Then get paginated products with smaller batch size
      let products = await Product.find(query)
        .populate({
          path: 'categoryId',
          match: { status: 'shown' },
          select: 'name status'
        })
        .sort({ categoryId: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .batchSize(5); // Reduce batch size

      // Filter and transform products
      products = products
        .filter(product => product.categoryId)
        .map(product => ({
          _id: product._id.toString(),
          name: product.name,
          price: product.price,
          categoryId: product.categoryId?._id.toString(),
          categoryName: product.categoryId?.name || 'Unknown Category',
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
          description: product.description,
          reserved: product.reserved
        }));

      return {
        products,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit
        }
      };

    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('Error fetching products:', error);
        return {
          products: [],
          pagination: {
            total: 0,
            pages: 0,
            page,
            limit
          }
        };
      }
      // Wait before retrying (exponential backoff)
      await delay(1000 * (3 - retries));
    }
  }
}
