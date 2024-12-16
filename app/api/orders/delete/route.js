import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';

export async function DELETE(req) {
  try {
    await connectToDB();

    const { orderId, clientId } = await req.json();

    // Validate order existence
    const order = await Order.findById(orderId);
    if (!order) {
      return new Response(
        JSON.stringify({ message: 'Order not found' }),
        { status: 404 }
      );
    }

    // Ensure the client is authorized to delete this order
    if (order.clientId.toString() !== clientId._id) {
      return new Response(
        JSON.stringify({ message: 'Unauthorized: Only the client who created the order can delete it.' }),
        { status: 403 }
      );
    }

    // Adjust reserved stock for each product in the order
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.reserved -= item.quantity;
        if (product.reserved < 0) product.reserved = 0; // Ensure reserved stock doesn't go negative
        await product.save();
      }
    }

    // Remove order from supplier's orders array
    await User.findByIdAndUpdate(
      order.supplierId,
      { $pull: { orders: orderId } }
    );

    // Remove order from client's orders array
    await User.findByIdAndUpdate(
      order.clientId,
      { $pull: { orders: orderId } }
    );

    // Delete the order itself
    await Order.findByIdAndDelete(orderId);

    return new Response(
      JSON.stringify({ message: 'Order deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting order:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
