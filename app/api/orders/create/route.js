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

    // Get populated order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('supplierId', 'businessName email')
      .populate('clientId', 'businessName email')
      .populate('items.productId', 'name price')
      .lean();

    // Try to send email, but don't fail if it doesn't work
    try {
      const [supplier, client] = await Promise.all([
        User.findById(supplierId).lean(),
        User.findById(clientId).lean()
      ]);

      if (supplier && supplier.email) {
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
          html: `<div dir="rtl">
            <h1>הזמנה חדשה התקבלה מ-${client?.businessName || 'לקוח'}</h1>
            <p>מספר הזמנה: ${nextOrderNumber}</p>
            <p>סכום כולל: ₪${total.toFixed(2)}</p>
          </div>`
        });
      }
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue without failing the order creation
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
