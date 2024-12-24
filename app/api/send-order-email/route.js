import { sendOrderStatusEmail } from '../../../services/emailService';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Log environment variables (remove in production)
    console.log('Email Config:', {
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER ? 'configured' : 'missing',
      pass: process.env.EMAIL_PASSWORD ? 'configured' : 'missing',
      from: process.env.EMAIL_FROM,
    });

    const { orderId, clientEmail, status, note } = await request.json();

    if (!clientEmail || !orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sendOrderStatusEmail(clientEmail, orderId, status, note);
    
    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Detailed error in email API:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
} 