import nodemailer from 'nodemailer';
import Order from '@/models/order';
import { connectToDB } from '@/utils/database';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// For quantity updates - sent to supplier
export async function sendOrderUpdateEmail({ order, type, recipientEmail, businessName }) {
  try {
    await connectToDB();
    
    // Make sure order is populated
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId')
      .populate('supplierId')
      .populate('clientId');

    if (!populatedOrder) {
      throw new Error('Order not found');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: `עדכון הזמנה מספר ${populatedOrder.orderNumber}`,
      html: `
        <div dir="rtl">
          <h2>הזמנה מספר ${populatedOrder.orderNumber} עודכנה</h2>
          <p>שם העסק: ${businessName}</p>
          <h3>פרטי ההזמנה המעודכנים:</h3>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>מוצר</th>
              <th>כמות</th>
              <th>מחיר ליחידה</th>
              <th>סה"כ</th>
            </tr>
            ${populatedOrder.items.map(item => `
              <tr>
                <td>${item.productId.name}</td>
                <td>${item.quantity}</td>
                <td>₪${item.price.toFixed(2)}</td>
                <td>₪${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <p><strong>סה"כ להזמנה:</strong> ₪${populatedOrder.total.toFixed(2)}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
}

// For status updates (accept/reject) - sent to client
export async function sendOrderStatusEmail({ order, status, note }) {
  try {
    const statusText = status === 'approved' ? 'אושרה' : 'נדחתה';
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: order.clientId.email,
      subject: `הזמנה מספר ${order.orderNumber} ${statusText}`,
      html: `
        <div dir="rtl">
          <h1>הזמנה מספר ${order.orderNumber} ${statusText}</h1>
          <p>שם העסק: ${order.supplierId.businessName}</p>
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
              ${order.items.map(item => `
                <tr>
                  <td style="border: 1px solid black; padding: 8px;">${item.productId.name}</td>
                  <td style="border: 1px solid black; padding: 8px;">${item.quantity}</td>
                  <td style="border: 1px solid black; padding: 8px;">₪${item.price.toFixed(2)}</td>
                  <td style="border: 1px solid black; padding: 8px;">₪${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p><strong>סה"כ להזמנה: ₪${order.total.toFixed(2)}</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
} 