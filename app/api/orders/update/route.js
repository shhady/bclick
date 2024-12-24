import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function PUT(request) {
  try {
    await connectToDB();
    const { orderId, status, note, userId } = await request.json();

    // Get the current order first
    const currentOrder = await Order.findById(orderId)
      .populate('clientId', 'email name businessName phone')
      .populate('supplierId', 'name email businessName')
      .populate('items.productId');

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle stock updates based on status
    if (status === 'approved' || status === 'rejected') {
      for (const item of currentOrder.items) {
        const product = await Product.findById(item.productId._id);
        
        if (!product) {
          return NextResponse.json(
            { error: `Product not found: ${item.productId._id}` },
            { status: 400 }
          );
        }

        if (status === 'approved') {
          // When approving: reduce actual stock and remove from reserved
          product.stock -= item.quantity;
          product.reserved = (product.reserved || 0) - item.quantity;
          
          if (product.stock < 0) {
            return NextResponse.json(
              { error: `Not enough stock for ${product.name}` },
              { status: 400 }
            );
          }
        } else if (status === 'rejected') {
          // When rejecting: just remove from reserved, don't touch actual stock
          product.reserved = (product.reserved || 0) - item.quantity;
        }

        await product.save();
      }
    }

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        $set: { status },
        ...(note && { $push: { notes: { message: note, date: new Date() } } })
      },
      { new: true }
    )
    .populate('clientId', 'email name businessName phone')
    .populate('supplierId', 'name email businessName')
    .populate('items.productId');

    // Send email notification to client
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const statusText = status === 'approved' ? 'אושרה' : 'נדחתה';
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: updatedOrder.clientId.email,
      subject: `הזמנה מספר ${updatedOrder.orderNumber} ${statusText}`,
      html: `
        <div dir="rtl">
          <h1>הזמנה מספר ${updatedOrder.orderNumber} ${statusText}</h1>
          <p>שם העסק: ${updatedOrder.supplierId.businessName}</p>
          <p>סטטוס: ${statusText}</p>
          ${note ? `<p>הערה: ${note}</p>` : ''}
          <h2>פרטי ההזמנה:</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="border: 1px solid black; padding: 8px;">מוצר</th>
                <th style="border: 1px solid black; padding: 8px;">כמות</th>
                <th style="border: 1px solid black; padding: 8px;">מחיר ליחידה</th>
                <th style="border: 1px solid black; padding: 8px;">סה"כ</th>
              </tr>
            </thead>
            <tbody>
              ${updatedOrder.items.map(item => `
                <tr>
                  <td style="border: 1px solid black; padding: 8px;">${item.productId.name}</td>
                  <td style="border: 1px solid black; padding: 8px;">${item.quantity}</td>
                  <td style="border: 1px solid black; padding: 8px;">₪${item.productId.price}</td>
                  <td style="border: 1px solid black; padding: 8px;">₪${(item.quantity * item.productId.price).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p><strong>סה"כ להזמנה: ₪${updatedOrder.total.toFixed(2)}</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      order: updatedOrder,
      message: `ההזמנה ${statusText} בהצלחה ונשלח מייל ללקוח`
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
