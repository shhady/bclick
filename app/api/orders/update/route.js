import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { sendOrderUpdateEmail, sendOrderStatusEmail } from '@/utils/emails';
import { NextResponse } from 'next/server';

export async function PUT(req) {
  try {
    await connectToDB();
    const body = await req.json();
    console.log('Received request body:', body);
    const { orderId, items, status, note, userId } = body;

    // Find the original order
    const originalOrder = await Order.findById(orderId).populate('items.productId');
    if (!originalOrder) {
      console.log('Order not found:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If updating items, handle stock updates
    if (Array.isArray(items) && items.length > 0) {
      console.log('Processing items update');
      
      // First, restore the original reserved quantities
      for (const originalItem of originalOrder.items) {
        console.log('Restoring quantity for product:', originalItem.productId._id);
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

        // Calculate available stock (current stock minus reserved plus original quantity if it's the same product)
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
          status,
          $push: {
            notes: {
              message: note,
              date: new Date(),
              userId
            }
          }
        },
        { 
          new: true,
          runValidators: true 
        }
      ).populate(['clientId', 'supplierId', 'items.productId']);

      if (!updatedOrder) {
        throw new Error('Failed to update order');
      }

      return NextResponse.json({ order: updatedOrder });
    }

    // If only updating status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        $push: {
          notes: {
            message: note,
            date: new Date(),
            userId
          }
        }
      },
      { new: true }
    ).populate(['clientId', 'supplierId', 'items.productId']);

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
