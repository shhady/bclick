import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { sendOrderUpdateEmail, sendOrderStatusEmail } from '@/utils/emails';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    await connectToDB();
    const { orderId, status, note } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('supplierId')
      .populate('clientId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    order.status = status;

    // Add note if provided
    if (note) {
      order.notes.push({
        message: note,
        date: new Date()
      });
    }

    // Handle product stock updates based on status
    if (status === 'approved') {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Update product stock
        await Product.findByIdAndUpdate(product._id, {
          $inc: { 
            stock: -item.quantity,
            reserved: -item.quantity
          }
        });
      }
    } else if (status === 'rejected') {
      // Return reserved quantities back to stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { reserved: -item.quantity }
        });
      }
    }

    await order.save();

    // Return populated order
    const updatedOrder = await Order.findById(orderId)
      .populate('items.productId')
      .populate('supplierId')
      .populate('clientId');

    return NextResponse.json({ 
      message: `Order ${status} successfully`,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update order'
    }, { status: 500 });
  }
}
