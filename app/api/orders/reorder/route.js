import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectToDB();
    const { clientId, supplierId, items } = await request.json();

    // Check stock availability for each product
    const stockValidation = {};
    for (const item of items) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return NextResponse.json(
          { message: `Product not found: ${item.productId._id}` },
          { status: 400 }
        );
      }

      const availableStock = product.stock - (product.reserved || 0);
      stockValidation[product._id] = {
        available: availableStock,
        requested: item.quantity,
        hasEnough: availableStock >= item.quantity
      };

      if (availableStock < item.quantity) {
        return NextResponse.json({
          message: 'Insufficient stock',
          stockValidation,
          error: `Not enough stock for ${product.name}. Available: ${availableStock}`
        }, { status: 400 });
      }
    }

    // Calculate total
    const total = items.reduce((sum, item) => 
      sum + (item.quantity * item.productId.price), 0
    );

    // Get next order number
    const lastOrder = await Order.findOne()
      .sort({ orderNumber: -1 })
      .collation({ locale: "en", numericOrdering: true })
      .lean();

    const nextOrderNumber = lastOrder?.orderNumber ? parseInt(lastOrder.orderNumber) + 1 : 1;

    // Create the order
    const newOrder = await Order.create({
      clientId,
      supplierId,
      items,
      total,
      orderNumber: nextOrderNumber,
      status: 'pending'
    });

    // Update reserved stock for each product
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { reserved: item.quantity } }
      );
    }

    // Update users' orders arrays
    await Promise.all([
      User.findByIdAndUpdate(
        supplierId,
        { $push: { orders: newOrder._id } }
      ),
      User.findByIdAndUpdate(
        clientId,
        { $push: { orders: newOrder._id } }
      )
    ]);

    // Populate the new order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('clientId', 'email name businessName')
      .populate('supplierId', 'name businessName email')
      .populate('items.productId');

    // Send email notification
    const supplier = await User.findById(supplierId).lean();
    const client = await User.findById(clientId).lean();

    if (supplier && client) {
      // Generate the product table for the email
      const productRows = items
        .map(
          (item) => `
          <tr dir="rtl">
            <td style="border: 1px solid #ddd; padding: 8px;">${item.productId.barCode || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.productId.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₪${item.productId.price}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">₪${(item.quantity * item.productId.price).toFixed(2)}</td>
          </tr>
        `
        )
        .join('');

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

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: supplier.email,
        subject: 'התקבלה הזמנה חוזרת',
        html: `
        <div dir="rtl">
          <h1>הזמנה חוזרת התקבלה: בסה"כ ₪${total.toFixed(2)}</h1>
          ${clientDetails}
          ${productTable}
        </div>
        `,
      };
      
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ 
      success: true, 
      order: populatedOrder,
      message: 'הזמנה נוצרה בהצלחה ונשלח מייל לספק'
    });

  } catch (error) {
    console.error('Error creating reorder:', error);
    return NextResponse.json(
      { error: 'Failed to create reorder' },
      { status: 500 }
    );
  }
} 