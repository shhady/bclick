import { connectToDB } from '@/utils/database';
import Order from '@/models/order';

export async function getOrders() {
  try {
    await connectToDB();
    
    const orders = await Order.find()
      .populate('clientId', 'email name businessName phone')
      .populate('supplierId', 'name email businessName coverImage')
      .populate('items.productId')
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
} 