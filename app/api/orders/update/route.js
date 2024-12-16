import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';

export async function PUT(req) {
  try {
    const { orderId, status, note, userId } = await req.json();
    await connectToDB();
    console.log(userId);
    // Fetch the order
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return new Response(
        JSON.stringify({ message: 'Order not found' }),
        { status: 404 }
      );
    }

    // Check authorization: only the supplier who owns the order can update it
    if (order.supplierId.toString() !== userId) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized access' }),
        { status: 403 }
      );
    }

    const updateData = { status };
    if (status === 'approved') {
      updateData['performanceTracking.approvedDate'] = new Date();

      // Reduce stock and reserved quantities for each product in the order
      for (const item of order.items) {
        const product = await Product.findById(item.productId._id);
        product.stock -= item.quantity;
        product.reserved -= item.quantity;
        if (product.stock < 0 || product.reserved < 0) {
          return new Response(
            JSON.stringify({ message: `Invalid stock or reserved values for product: ${product.name}` }),
            { status: 400 }
          );
        }
        await product.save();
      }
    } else if (status === 'rejected') {
      updateData['performanceTracking.rejectedDate'] = new Date();

      // Remove reserved quantities for each product in the order
      for (const item of order.items) {
        const product = await Product.findById(item.productId._id);
        product.reserved -= item.quantity;
        if (product.reserved < 0) {
          return new Response(
            JSON.stringify({ message: `Invalid reserved value for product: ${product.name}` }),
            { status: 400 }
          );
        }
        await product.save();
      }
    }

    if (note) {
      updateData.$push = { notes: { message: note, date: new Date() } };
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

    return new Response(JSON.stringify({ message: 'Order updated successfully', order: updatedOrder }), {
      status: 200,
    });
  } catch (err) {
    console.error('Error updating order:', err);
    return new Response(JSON.stringify({ message: 'Error updating order' }), { status: 500 });
  }
}
