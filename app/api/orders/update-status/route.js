import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { sendOrderUpdateEmail, sendOrderStatusEmail } from '@/utils/emails';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { orderId, status, note, userId, userRole } = body;

    console.log(`API: Updating order ${orderId} to status ${status}`);

    // Find the original order
    const originalOrder = await Order.findById(orderId).populate('items.productId');
    if (!originalOrder) {
      console.error(`API: Order ${orderId} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`API: Original order status: ${originalOrder.status}`);

    // Validate permissions based on role and status
    if (userRole === 'client' && status) {
      console.error('API: Clients cannot update order status');
      return NextResponse.json({ error: 'Clients cannot update order status' }, { status: 403 });
    }

    if (userRole === 'supplier' && originalOrder.status !== 'pending' && originalOrder.status !== 'processing') {
      console.error('API: Cannot update completed or rejected orders');
      return NextResponse.json({ error: 'Cannot update completed or rejected orders' }, { status: 400 });
    }

    // If updating status (supplier only)
    if (status && userRole === 'supplier') {
      console.log(`API: Updating order ${orderId} status from ${originalOrder.status} to ${status}`);
      
      // Handle stock updates based on status change
      if (status === 'rejected' || status === 'deleted') {
        console.log(`API: Returning stock for rejected/deleted order ${orderId}`);
        
        // Return items to stock
        for (const item of originalOrder.items) {
          console.log(`API: Adding ${item.quantity} units back to stock for product ${item.productId._id}`);
          
          await Product.findByIdAndUpdate(item.productId._id, {
            $inc: { stock: item.quantity }
          });
        }
      }

      // Update order status
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status,
          $push: {
            notes: {
              message: note || `Order status updated to ${status}`,
              date: new Date(),
              userId
            }
          }
        },
        { new: true }
      ).populate(['clientId', 'supplierId', 'items.productId']);

      console.log(`API: Order updated successfully, new status: ${updatedOrder.status}`);

      return NextResponse.json({ order: updatedOrder });
    }

    console.error('API: Invalid update request');
    return NextResponse.json({ error: 'Invalid update request' }, { status: 400 });
  } catch (error) {
    console.error('API Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}