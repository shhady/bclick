import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { sendOrderUpdateEmail, sendOrderStatusEmail } from '@/utils/emails';
import { NextResponse } from 'next/server';

export async function PUT(request) {
  try {
    await connectToDB();
    const { orderId, items, note, status } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('supplierId')
      .populate('clientId');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    try {
      // If updating quantities
      if (items) {
        
        // First, get all products to check stock
        const productIds = items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } });
        const productsMap = products.reduce((map, product) => {
          map[product._id.toString()] = product;
          return map;
        }, {});

        // Validate stock availability for all items
        for (const item of items) {
          const product = productsMap[item.productId];
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          const oldItem = order.items.find(
            orderItem => orderItem.productId._id.toString() === item.productId
          );
          
          const oldQuantity = oldItem ? oldItem.quantity : 0;
          const quantityDiff = item.quantity - oldQuantity;
          
          // Check if we have enough available stock
          const availableStock = product.stock - (product.reserved - oldQuantity);
          if (availableStock < item.quantity) {
            throw new Error(
              `Not enough stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
            );
          }
        }

        // Update reserved quantities and prepare updated items
        const updatedItems = await Promise.all(items.map(async (item) => {
          const product = productsMap[item.productId];
          const oldItem = order.items.find(
            orderItem => orderItem.productId._id.toString() === item.productId
          );
          const oldQuantity = oldItem ? oldItem.quantity : 0;
          const quantityDiff = item.quantity - oldQuantity;

          // Update product reserved quantity
          await Product.findByIdAndUpdate(product._id, {
            $inc: { reserved: quantityDiff }
          });

          return {
            productId: product._id,
            quantity: item.quantity,
            price: product.price,
            total: product.price * item.quantity
          };
        }));

        // Calculate new total
        const total = updatedItems.reduce((sum, item) => sum + item.total, 0);

        // Update order with new items and total
        order.items = updatedItems;
        order.total = total;
        order.notes.push({
          message: note || 'עודכנו כמויות בהזמנה',
          date: new Date()
        });

        await order.save();

        // Send email to supplier about quantity updates
        await sendOrderUpdateEmail({
          order,
          type: 'quantity_update',
          recipientEmail: order.supplierId.email,
          businessName: order.clientId.businessName
        });
      }

      // If updating status
      if (status) {
        
        if (status === 'approved' || status === 'rejected') {
          for (const item of order.items) {
            const product = await Product.findById(item.productId._id);
            
            if (!product) {
              throw new Error(`Product not found: ${item.productId._id}`);
            }

            if (status === 'approved') {
              if (product.stock < item.quantity) {
                throw new Error(`Not enough stock for ${product.name}`);
              }
              
              await Product.findByIdAndUpdate(product._id, {
                $inc: { 
                  stock: -item.quantity,    // Reduce stock
                  reserved: -item.quantity  // Remove from reserved
                }
              });
            } else if (status === 'rejected') {
              await Product.findByIdAndUpdate(product._id, {
                $inc: { reserved: -item.quantity }
              });
            }

            const updatedProduct = await Product.findById(product._id);
          }
        }

        order.status = status;
        if (note) {
          order.notes.push({
            message: note,
            date: new Date()
          });
        }

        await order.save();

        // Send email to client about status update
        await sendOrderStatusEmail({
          order,
          status,
          note
        });
      }

      // Return populated order
      const populatedOrder = await Order.findById(order._id)
        .populate('items.productId')
        .populate('supplierId')
        .populate('clientId');

      return NextResponse.json({ 
        message: status ? `Order ${status} successfully` : 'Order updated successfully',
        order: populatedOrder
      });

    } catch (error) {
      console.error('Error during update:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to update order'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
