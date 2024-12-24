import { transporter, emailDefaults } from '@/lib/nodemailer';

const createEmailTemplate = (orderNumber, status, note = '') => {
  const isApproved = status === 'approved';
  
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: ${isApproved ? '#4CAF50' : '#f44336'}">
        ${isApproved ? 'הזמנתך אושרה!' : 'עדכון לגבי הזמנתך'}
      </h2>
      <p style="font-size: 16px;">
        הזמנה מספר: <strong>${orderNumber}</strong>
      </p>
      <p style="font-size: 16px;">
        ${isApproved 
          ? 'הזמנתך אושרה ונכנסה לטיפול. תודה שבחרת בשירותינו!' 
          : `הזמנתך נדחתה מהסיבה הבאה: ${note}`
        }
      </p>
      <div style="margin-top: 20px; color: #666;">
        <p>בברכה,<br/>צוות התמיכה</p>
      </div>
    </div>
  `;
};

export const sendOrderStatusEmail = async (clientEmail, orderNumber, status, note = '') => {
  try {
    // Log the email configuration for debugging
    console.log('Sending email with config:', {
      to: clientEmail,
      subject: status === 'approved' ? 'הזמנתך אושרה!' : 'עדכון לגבי הזמנתך',
      emailService: 'gmail',
      emailUser: process.env.EMAIL_USER ? 'configured' : 'missing',
      emailPass: process.env.EMAIL_PASS ? 'configured' : 'missing',
    });

    const mailOptions = {
      ...emailDefaults,
      to: clientEmail,
      subject: status === 'approved' ? 'הזמנתך אושרה!' : 'עדכון לגבי הזמנתך',
      html: createEmailTemplate(orderNumber, status, note),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Detailed email error:', {
      error: error.message,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
}; 