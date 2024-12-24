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

    console.log('Total orders found:', orders.length);
    console.log('Database URL:', process.env.DATABASE_URL?.split('@')[1]); // Logs the database host (safely)
    
    if (!orders || orders.length === 0) {
      console.log('No orders found in database');
    }

    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error details:', error.message);
    console.error('Connection string:', process.env.DATABASE_URL ? 'Exists' : 'Missing');
    return [];
  }
} 