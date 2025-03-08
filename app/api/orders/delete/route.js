import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    await connectToDB();
    const { orderId, userRole } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Find the order and populate necessary fields
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

    // Only allow deletion if order is pending and user is client
    if (order.status !== 'pending') {
      return NextResponse.json(
        { message: "Only pending orders can be deleted" },
        { status: 400 }
      );
    }

    if (userRole !== 'client') {
      return NextResponse.json(
        { message: "Only clients can delete orders" },
        { status: 403 }
      );
    }

    // Revert  stock for each product
    const stockUpdatePromises = order.items.map(item => 
      Product.findByIdAndUpdate(
        item.productId._id,
          { $inc: { stock: -item.quantity } },
        { new: true }
      )
    );

    // Remove order from both users' orders arrays
    const userUpdatePromises = [
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
    await Promise.all([...stockUpdatePromises, ...userUpdatePromises]);

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
