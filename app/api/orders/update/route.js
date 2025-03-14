import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import { revalidatePath } from 'next/cache';

export async function PUT(req) {
  await connectToDB();

  try {
    const { orderId, items, status, note, userId, userRole } = await req.json();

    // Validate required fields
    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Find the original order
    const originalOrder = await Order.findById(orderId).populate('items.productId');
    if (!originalOrder) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prepare update object
    const updateData = {
      $set: {
        updatedAt: new Date()
      },
      $push: {
        history: {
          action: items ? 'update_items' : 'update_status',
          note: note || (items ? 'Items updated' : `Status updated to ${status}`),
          timestamp: new Date(),
          userId: userId || null,
          userRole: userRole || null
        }
      }
    };

    // Handle status update
    if (status) {
      updateData.$set.status = status;
    }

    // Handle items update
    if (items && Array.isArray(items)) {
      // Create a map of original order items for easy lookup
      const originalItemsMap = {};
      originalOrder.items.forEach(item => {
        originalItemsMap[item.productId._id.toString()] = {
          quantity: item.quantity,
          product: item.productId
        };
      });

      // Create a map of updated items for easy lookup
      const updatedItemsMap = {};
      items.forEach(item => {
        updatedItemsMap[item.productId] = item.quantity;
      });

      // Process stock updates
      const stockUpdates = [];

      // 1. Handle items that were in the original order
      for (const [productId, originalItem] of Object.entries(originalItemsMap)) {
        const newQuantity = updatedItemsMap[productId] || 0;
        const quantityDifference = newQuantity - originalItem.quantity;

        if (quantityDifference !== 0) {
          // If quantity decreased, add back to stock
          // If quantity increased, reduce from stock
          stockUpdates.push({
            productId,
            stockChange: -quantityDifference, // Negative because we're adjusting stock in opposite direction
            product: originalItem.product
          });
        }

        // If item was removed completely, add all quantity back to stock
        if (!updatedItemsMap[productId]) {
          console.log(`Item ${productId} was removed, adding ${originalItem.quantity} back to stock`);
        }
      }

      // 2. Handle new items that weren't in the original order (should not happen in this flow)
      for (const productId of Object.keys(updatedItemsMap)) {
        if (!originalItemsMap[productId]) {
          console.warn(`New item ${productId} was added in update - this should not happen`);
        }
      }

      // Update product stock levels
      for (const update of stockUpdates) {
        const product = await Product.findById(update.productId);
        if (product) {
          product.stock += update.stockChange;
          await product.save();
          console.log(`Updated stock for ${product.name}: ${update.stockChange > 0 ? '+' : ''}${update.stockChange} (new stock: ${product.stock})`);
        }
      }

      // Calculate new order total
      let orderTotal = 0;
      const updatedItems = items.map(item => {
        const itemTotal = item.price * item.quantity;
        orderTotal += itemTotal;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: itemTotal
        };
      });

      // Add items and total to update data
      updateData.$set.items = updatedItems;
      updateData.$set.total = orderTotal;
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate(['items.productId', 'clientId', 'supplierId']);

    // Add a log to verify the status was updated
    console.log('Updated order status:', updatedOrder.status);

    // Revalidate related paths
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);

    console.log('Sending updated order to client:', updatedOrder);

    return Response.json({ 
      message: 'Order updated successfully', 
      order: updatedOrder 
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return Response.json(
      { error: error.message || 'Failed to update order' },
      { status: 500 }
    );
  }
}
