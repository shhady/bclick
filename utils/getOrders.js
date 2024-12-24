import { connectToDB } from '@/utils/database';
import Order from '@/models/order';

export async function getOrders() {
  try {
    await connectToDB();
    
    // Force fresh data
    const orders = await Order.find()
      .populate('clientId', 'email name businessName phone')
      .populate('supplierId', 'name email businessName coverImage')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .lean()  // Convert to plain JavaScript objects
      .cache(false);  // Disable Mongoose caching

    console.log('Total orders found:', orders.length);
    
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.message);
    return [];
  }
} 