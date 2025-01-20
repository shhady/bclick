import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    await connectToDB();
    const { orderId } = await request.json();

    // First get the order to access its items and user IDs
    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('clientId')
      .populate('supplierId');

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    // Update product reservations
    const updatePromises = order.items.map(item => {
      return Product.findByIdAndUpdate(
        item.productId._id,
        {
          $inc: { reserved: -item.quantity }
        },
        { new: true }
      );
    });

    // Remove order from both users' orders arrays
    const userUpdates = [
      User.findByIdAndUpdate(
        order.clientId._id,
        { $pull: { orders: orderId } }
      ),
      User.findByIdAndUpdate(
        order.supplierId._id,
        { $pull: { orders: orderId } }
      )
    ];

    // Wait for all updates to complete
    await Promise.all([...updatePromises, ...userUpdates]);

    // Delete the order
    await Order.findByIdAndDelete(orderId);

    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order" },
      { status: 500 }
    );
  }
}
