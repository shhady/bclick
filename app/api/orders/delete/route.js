import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    await connectToDB();
    const { orderId } = await request.json();

    // First get the order to access its items
    const order = await Order.findById(orderId).populate('items.productId');
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
          $inc: { reserved: -item.quantity } // Decrease reserved by the order quantity
        },
        { new: true }
      );
    });

    // Wait for all product updates to complete
    await Promise.all(updatePromises);

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
