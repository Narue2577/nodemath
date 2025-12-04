//lib/email.js
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 300000,  // 5 minutes
  greetingTimeout: 300000,    // 5 minutes
  socketTimeout: 300000,      // 5 minutes
});