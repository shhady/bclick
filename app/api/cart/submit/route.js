import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId, supplierId } = body;

    if (!clientId || !supplierId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Get the cart with items
    const cart = await Cart.findOne({ clientId, supplierId })
      .populate({
        path: 'items.productId',
        select: 'name price stock reserved imageUrl'
      });

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty or not found' },
        { status: 404 }
      );
    }

    // Generate order number (timestamp-based for simplicity)
    const orderNumber = Math.floor(Date.now() / 1000);

    // Calculate totals for each item and the entire order
    let total = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.quantity * item.productId.price;
      total += itemTotal;
      
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.price,
        total: itemTotal
      };
    });

    // Create a new order
    const newOrder = new Order({
      clientId,
      supplierId,
      items: orderItems,
      total: total,
      tax: 0.18, // 18% tax
      orderNumber: orderNumber,
      status: 'pending',
      notes: [{ message: 'הזמנה חדשה נוצרה' }]
    });

    // Save the order
    const savedOrder = await newOrder.save();

    // Update product reserved quantities
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { reserved: item.quantity } }
      );
    }

    // Add order to client and supplier
    await User.findByIdAndUpdate(
      clientId,
      { $push: { orders: savedOrder._id } }
    );

    await User.findByIdAndUpdate(
      supplierId,
      { $push: { orders: savedOrder._id } }
    );

    // Delete the cart
    await Cart.findOneAndDelete({ clientId, supplierId });

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      orderId: savedOrder._id,
      orderNumber: orderNumber
    });
  } catch (error) {
    console.error('Error submitting cart:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
