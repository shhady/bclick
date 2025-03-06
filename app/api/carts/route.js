import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';
import User from '@/models/user';

export async function GET(request) {
  try {
    // Get clientId from query params
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'Client ID is required' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find all carts for this client
    const carts = await Cart.find({ clientId })
      .populate({
        path: 'items.productId',
        select: 'name price stock reserved imageUrl weight weightUnit'
      })
      .populate({
        path: 'supplierId',
        select: 'businessName'
      })
      .sort({ updatedAt: -1 });

    // Add supplier name to each cart for easier display
    const cartsWithSupplierNames = await Promise.all(
      carts.map(async (cart) => {
        const cartObj = cart.toObject();
        
        // If supplier info is available, get the business name
        if (cartObj.supplierId) {
          const supplier = await User.findById(cartObj.supplierId);
          cartObj.supplierName = supplier?.businessName || 'Unknown Supplier';
        }
        
        return cartObj;
      })
    );

    return NextResponse.json({
      success: true,
      carts: cartsWithSupplierNames
    });
  } catch (error) {
    console.error('Error fetching carts:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 