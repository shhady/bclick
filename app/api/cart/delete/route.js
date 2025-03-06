import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/database';
import Cart from '@/models/cart';

export async function DELETE(request) {
  try {
    // Get clientId and supplierId from query params
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const supplierId = searchParams.get('supplierId');

    if (!clientId || !supplierId) {
      return NextResponse.json(
        { success: false, message: 'Client ID and Supplier ID are required' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find and delete the cart
    const result = await Cart.findOneAndDelete({ clientId, supplierId });

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Cart not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cart deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cart:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
} 