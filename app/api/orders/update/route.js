import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { sendOrderUpdateEmail, sendOrderStatusEmail } from '@/utils/emails';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    await connectToDB();
    const body = await req.json();
    const { orderId, items, status, note, userId, userRole } = body;

    // Find the original order
    const originalOrder = await Order.findById(orderId).populate('items.productId');
    if (!originalOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Validate permissions based on role and status
    if (userRole === 'client' && status) {
      return NextResponse.json({ error: 'Clients cannot update order status' }, { status: 403 });
    }

    if (userRole === 'supplier' && originalOrder.status !== 'pending' && originalOrder.status !== 'processing') {
      return NextResponse.json({ error: 'Cannot update completed or rejected orders' }, { status: 400 });
    }

    // If updating items (only allowed for pending orders)
    if (Array.isArray(items) && items.length > 0) {
      if (originalOrder.status !== 'pending') {
        return NextResponse.json({ error: 'Can only update items for pending orders' }, { status: 400 });
      }
      
      // First, restore the original reserved quantities
      for (const originalItem of originalOrder.items) {
        await Product.findByIdAndUpdate(originalItem.productId._id, {
          $inc: { reserved: -originalItem.quantity }
        });
      }

      // Then, validate and reserve the new quantities
      for (const newItem of items) {
        const product = await Product.findById(newItem.productId);
        if (!product) {
          throw new Error(`Product not found: ${newItem.productId}`);
        }

        // Calculate available stock
        const originalItem = originalOrder.items.find(
          item => item.productId._id.toString() === newItem.productId.toString()
        );
        const originalQuantity = originalItem ? originalItem.quantity : 0;
        const availableStock = product.stock - (product.reserved || 0) + originalQuantity;

        if (availableStock < newItem.quantity) {
          throw new Error(`Not enough stock for product: ${product.name}`);
        }

        // Update reserved quantity
        await Product.findByIdAndUpdate(newItem.productId, {
          $inc: { reserved: newItem.quantity }
        });
      }

      // Calculate new total
      const total = items.reduce((sum, item) => sum + item.total, 0);

      // Update the order
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          items,
          total,
          status: 'pending', // Reset to pending if items are updated
          $push: {
            notes: {
              message: note || 'Order items updated',
              date: new Date(),
              userId
            }
          }
        },
        { new: true, runValidators: true }
      ).populate(['clientId', 'supplierId', 'items.productId']);

      return NextResponse.json({ order: updatedOrder });
    }

    // If updating status (supplier only)
    if (status && userRole === 'supplier') {
      // Handle stock updates based on status change
      if (status === 'approved') {
        // Reduce actual stock and reserved stock
        for (const item of originalOrder.items) {
          const product = await Product.findById(item.productId._id);
          if (!product) {
            throw new Error(`Product not found: ${item.productId._id}`);
          }
          
          if (product.stock - item.quantity < 0) {
            throw new Error(`Not enough stock for product: ${product.name}`);
          }

          await Product.findByIdAndUpdate(item.productId._id, {
            $inc: { 
              stock: -item.quantity,
              reserved: -item.quantity
            }
          });
        }
      } else if (status === 'rejected') {
        // Only reduce reserved stock
        for (const item of originalOrder.items) {
          await Product.findByIdAndUpdate(item.productId._id, {
            $inc: { reserved: -item.quantity }
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

      return NextResponse.json({ order: updatedOrder });
    }

    return NextResponse.json({ error: 'Invalid update request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
