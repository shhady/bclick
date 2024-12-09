import { connectToDB } from '@/utils/database';
import Product from '@/models/product';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  try {
    await connectToDB();

    const { 
      supplierId, 
      categoryId, 
      page = 1, 
      limit = 20 
    } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {
      supplierId: new mongoose.Types.ObjectId(supplierId),
      status: { $in: ['active', 'out_of_stock'] }
    };

    // Add category filter if provided
    if (categoryId) {
      query.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    // Find products
    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 }) // Sort to get latest first
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Serialize products (similar to your existing serialization)
    const serializedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString(),
      categoryId: product.categoryId.toString(),
      supplierId: product.supplierId.toString(),
    }));

    res.status(200).json({
      products: serializedProducts,
      totalProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}