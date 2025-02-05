import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('role');
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    console.log('Received search params:', { page, limit, userId, userRole, search, status });

    await connectToDB();

    // Build query based on filters
    let query = {};
    
    // Add role-based filter
    if (userId && userRole) {
      query[userRole === 'supplier' ? 'supplierId' : 'clientId'] = userId;
    }

    // Add status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Handle search
    if (search) {
      // Check if search is a valid order number
      const isOrderNumber = /^\d+$/.test(search);

      if (isOrderNumber) {
        // If it's a number, search for exact order number match
        query.orderNumber = parseInt(search);
        console.log('Searching for order number:', parseInt(search));
      } else {
        // If it's not a number, search for business names
        const users = await User.find({
          businessName: { $regex: search, $options: 'i' }
        }).select('_id');
        const matchingUserIds = users.map(user => user._id);
        console.log('Found matching users:', matchingUserIds.length);

        if (matchingUserIds.length > 0) {
          query.$or = [
            { clientId: { $in: matchingUserIds } },
            { supplierId: { $in: matchingUserIds } }
          ];
        } else {
          // If no matching users found, ensure no results are returned
          query._id = null;
        }
      }
    }

    console.log('Final query:', JSON.stringify(query, null, 2));

    // Use Promise.all for parallel execution
    const [total, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate('clientId', 'businessName')
        .populate('supplierId', 'businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    console.log('Found orders:', orders.length);

    // Calculate if there are more orders
    const hasMore = total > skip + orders.length;

    // Format the response
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
      clientId: {
        _id: order.clientId?._id,
        businessName: order.clientId?.businessName
      },
      supplierId: {
        _id: order.supplierId?._id,
        businessName: order.supplierId?.businessName
      }
    }));

    return NextResponse.json({
      orders: formattedOrders,
      hasMore,
      total,
      currentPage: page
    });

  } catch (error) {
    console.error('Error in orders API:', error);
    return NextResponse.json(
      { 
        message: 'Failed to fetch orders',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle order deletion
export async function DELETE(request) {
  try {
    await connectToDB();
    const { orderId, userRole } = await request.json();

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

    // Revert reserved stock for each product
    const stockUpdatePromises = order.items.map(item => 
      Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { reserved: -item.quantity } },
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