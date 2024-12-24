import nodemailer from 'nodemailer';

const transportConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Optional: Add these if you're having SSL/TLS issues
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
};

// Create reusable transporter
export const transporter = nodemailer.createTransport(transportConfig);

// Verify the connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('Email server connection error:', error);
  } else {
    console.log('Email server connection is ready to take messages');
  }
});

// Email default configuration
export const emailDefaults = {
  from: process.env.EMAIL_FROM,
}; 