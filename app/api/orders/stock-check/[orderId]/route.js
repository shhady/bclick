import { connectToDB } from "@/utils/database";
import Order from "@/models/order";
import Product from "@/models/product";

export async function GET(req, { params }) {
  try {
    await connectToDB();
    const { orderId } = await params;

    // Get the order with populated products
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get current stock info for all products in the order
    const productIds = order.items.map(item => item.productId._id);
    const currentProducts = await Product.find({
      '_id': { $in: productIds }
    });

    // Create a map of product stock info
    const stockInfo = {};
    currentProducts.forEach(product => {
      stockInfo[product._id.toString()] = {
        stock: product.stock,
      };
    });

    // Add current order quantities to available stock since we're updating
    // order.items.forEach(item => {
    //   const productId = item.productId._id.toString();
    //   if (stockInfo[productId]) {
    //     stockInfo[productId].available += item.quantity;
    //   }
    // });

    return Response.json(stockInfo);
  } catch (error) {
    console.error('Error checking stock:', error);
    return Response.json(
      { error: 'Error checking stock availability' },
      { status: 500 }
    );
  }
} 