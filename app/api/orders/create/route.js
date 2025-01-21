import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectToDB();

    const orderData = await req.json();
    const { clientId, supplierId, items, total } = orderData;

    // Check stock availability for each product
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock - product.reserved < item.quantity) {
        return NextResponse.json({
          message: `מלאי לא מספיק עבור המוצר: ${product?.name || 'לא נמצא'}`,
        }, { status: 400 });
      }
    }

    // Get next order number
    const lastOrder = await Order.findOne()
      .sort({ orderNumber: -1 })
      .collation({ locale: "en", numericOrdering: true })
      .lean();

    const nextOrderNumber = lastOrder?.orderNumber ? parseInt(lastOrder.orderNumber) + 1 : 1;
    
    // Create the order
    const newOrder = await Order.create({
      ...orderData,
      orderNumber: nextOrderNumber
    });

    // Update reserved stock
    await Promise.all(items.map(item => 
      Product.findByIdAndUpdate(
        item.productId,
        { $inc: { reserved: item.quantity } },
        { new: true }
      )
    ));

    // Update users' orders arrays
    await Promise.all([
      User.findByIdAndUpdate(
        supplierId,
        { $push: { orders: newOrder._id } },
        { new: true }
      ),
      User.findByIdAndUpdate(
        clientId,
        { $push: { orders: newOrder._id } },
        { new: true }
      )
    ]);

    // Get populated order with full product details
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('supplierId', 'businessName email')
      .populate('clientId', 'businessName email')
      .populate('items.productId')
      .lean();

    // Get user details
    const [supplier, client] = await Promise.all([
      User.findById(supplierId).lean(),
      User.findById(clientId).lean()
    ]);

    // Generate product table rows with populated product data
    const productRows = populatedOrder.items.map(item => `
      <tr dir="rtl">
        <td style="border: 1px solid #ddd; padding: 8px;">${item.productId?.barCode || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.productId?.name || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">₪${item.productId?.price?.toFixed(2) || '0.00'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">₪${(item.quantity * (item.productId?.price || 0)).toFixed(2)}</td>
      </tr>
    `).join('');

    // Generate product table
    const productTable = `
      <table style="border-collapse: collapse; width: 100%; margin-top: 20px;" dir="rtl">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">ברקוד</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">שם מוצר</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">כמות</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">מחיר ליחידה</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
    `;

    // Generate client details
    const clientDetails = `
      <h2>פרטי השולח:</h2>
      <p>שם לקוח: ${client.name}</p>
      <p>שם עסק: ${client.businessName || 'לא צוין'}</p>
      <p>מספר עסק: ${client.businessNumber || 'לא צוין'}</p>
      <p>טלפון: ${client.phone}</p>
      <p>מספר לקוח: ${client.clientNumber}</p>
      <p>עיר: ${client.city}</p>
      <p>כתובת: ${client.address}</p>
    `;

    // Create and send email
    if (supplier?.email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: supplier.email,
        subject: 'התקבלה הזמנה חדשה',
        html: `
          <div dir="rtl">
            <h1>הזמנה חדשה התקבלה: בסה"כ כולל מע"מ ₪${total.toFixed(2)}</h1>
            ${clientDetails}
            <p>הערות: ${orderData.note || 'אין הערות נוספות.'}</p>
            ${productTable}
          </div>
        `
      });
    }

    return NextResponse.json({
      message: "Order created successfully",
      order: populatedOrder
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json({ 
      message: 'שגיאה בעת יצירת ההזמנה'
    }, { status: 500 });
  }
}
