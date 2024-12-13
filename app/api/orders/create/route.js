import { connectToDB } from '@/utils/database';
import Order from '@/models/order';
import Product from '@/models/product';
import User from '@/models/user';
import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    await connectToDB();

    const { clientId, supplierId, items, total, tax, note } = await req.json();

    console.log(items);
    // Check stock availability for each product
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock - product.reserved < item.quantity) {
        return new Response(
          JSON.stringify({
            message: `מלאי לא מספיק עבור המוצר: ${product?.name || 'לא נמצא'}`,
          }),
          { status: 400 }
        );
      }
    }

    // Create the order
    const newOrder = await Order.create({
      clientId,
      supplierId,
      items,
      total,
      tax,
      note, // Optional note
    });

    // After successfully creating the order, update reserved stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      product.reserved += item.quantity;
      await product.save();
    }

    // Update supplier's orders array
    await User.findByIdAndUpdate(
      supplierId,
      { $push: { orders: newOrder._id } },
      { new: true }
    );

    // Update client's orders array
    await User.findByIdAndUpdate(
      clientId,
      { $push: { orders: newOrder._id } },
      { new: true }
    );

    // Fetch supplier details to send the email
    const supplier = await User.findById(supplierId).lean();
    if (!supplier) {
      return new Response(
        JSON.stringify({ message: 'ספק לא נמצא' }),
        { status: 404 }
      );
    }

    // Fetch client details
    const client = await User.findById(clientId).lean();
    if (!client) {
      return new Response(
        JSON.stringify({ message: 'לקוח לא נמצא' }),
        { status: 404 }
      );
    }

    // Generate the product table for the email
    const productRows = items
      .map(
        (item) => `
        <tr  dir="rtl">
          <td style="border: 1px solid #ddd; padding: 8px;">${item.barCode || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.name || 'N/A'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₪${item.price || '0.00'}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">₪${(item.quantity * item.price || 0).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const productTable = `
      <table style="border-collapse: collapse; width: 100%; margin-top: 20px;"  dir="rtl">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">ברקוד</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">שם מוצר</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">כמות</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">מחיר ליחידה</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">סה&quot;כ</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
    `;

    // Generate sender (client) details
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

    // Email setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email message
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: supplier.email,
      subject: 'התקבלה הזמנה חדשה',
      html: `
      <div dir="rtl">
        <h1>הזמנה חדשה התקבלה: בסה&quot;כ כולל מע&quot;מ ₪${total.toFixed(2)}</h1>
        ${clientDetails}
      
        <p>הערות: ${note || 'אין הערות נוספות.'}</p>
        ${productTable}
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({
        message: 'הזמנה נוצרה בהצלחה ונשלח מייל לספק',
        order: newOrder,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation failed:', error);
    return new Response(
      JSON.stringify({ message: 'שגיאה בעת יצירת ההזמנה' }),
      { status: 500 }
    );
  }
}
