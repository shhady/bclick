'use server';
import nodemailer from 'nodemailer';

// Configure email transporter to match the original implementation
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email to supplier when a new order is created
export async function sendNewOrderEmail(order, client, supplier) {
  // Format items for the email
  const itemsHtml = order.items.map(item => {
    const productName = item.productId.name || 'מוצר';
    return `
      <tr>
        <td style="border: 1px solid black; padding: 8px;">${productName}</td>
        <td style="border: 1px solid black; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid black; padding: 8px; text-align: center;">₪${item.price.toFixed(2)}</td>
        <td style="border: 1px solid black; padding: 8px; text-align: center;">₪${item.total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const emailHtml = `
    <div dir="rtl">
      <h2>הזמנה חדשה התקבלה</h2>
      <p>התקבלה הזמנה חדשה מספר <strong>#${order.orderNumber}</strong> מאת ${client.name}.</p>
      
      <div>
        <h3>פרטי ההזמנה:</h3>
        <p><strong>לקוח:</strong> ${client.name}</p>
        <p><strong>טלפון:</strong> ${client.phone || 'לא צוין'}</p>
        <p><strong>תאריך:</strong> ${new Date(order.createdAt).toLocaleString('he-IL')}</p>
      </div>
      
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid black; padding: 8px; text-align: right;">מוצר</th>
            <th style="border: 1px solid black; padding: 8px; text-align: center;">כמות</th>
            <th style="border: 1px solid black; padding: 8px; text-align: center;">מחיר</th>
            <th style="border: 1px solid black; padding: 8px; text-align: center;">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="border: 1px solid black; padding: 8px; text-align: left;"><strong>סה"כ לתשלום:</strong></td>
            <td style="border: 1px solid black; padding: 8px; text-align: center;"><strong>₪${order.total.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
      
      <div style="margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" style="background-color: #4a90e2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">צפה בהזמנה</a>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"B-Click" <${process.env.EMAIL_USER}>`,
      to: supplier.email,
      subject: `הזמנה חדשה #${order.orderNumber} התקבלה`,
      html: emailHtml,
    });
    
    console.log(`New order email sent to supplier ${supplier.email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending new order email:', error);
    return { success: false, error };
  }
}

// Send email to client when order status changes - using the original implementation style
export async function sendOrderStatusEmail(order, client, supplier, note) {
  console.log('Attempting to send status update email to:', client.email);
  
  // Get status text in Hebrew
  const statusText = {
    pending: 'ממתין',
    processing: 'בטיפול',
    approved: 'אושרה',
    rejected: 'נדחתה'
  };
  
  try {
    const emailHtml = `
      <div dir="rtl">
        <h1>הזמנה מספר ${order.orderNumber} ${statusText[order.status]}</h1>
        <p>שם העסק: ${supplier.businessName || supplier.name}</p>
        <p>סטטוס: ${statusText[order.status]}</p>
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
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}" style="background-color: #4a90e2; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">צפה בהזמנה</a>
        </div>
      </div>
    `;
    
    console.log('Sending email with the following data:', {
      from: process.env.EMAIL_FROM || `"B-Click" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject: `הזמנה מספר ${order.orderNumber} ${statusText[order.status]}`
    });
    
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"B-Click" <${process.env.EMAIL_USER}>`,
      to: client.email,
      subject: `הזמנה מספר ${order.orderNumber} ${statusText[order.status]}`,
      html: emailHtml,
    });
    
    console.log('Email send result:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending order status email:', error);
    return { success: false, error };
  }
} 