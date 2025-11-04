// pages/api/auth/forget-password.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    const { email, permission, expiresIn = '7d' } = await request.json();

    // Generate a secure token with permission details
    const token = jwt.sign(
      { email, permission, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn }
    );

    // Create confirmation link
    const confirmLink = `${BASE_URL}/confirm-permission?token=${token}`;

    // Configure email transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'naruesorn@g.swu.ac.th',
        pass: "Gale8!s15", // Use App Password for Gmail
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Permission Request Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Permission Request</h2>
          <p>You have been requested to grant the following permission:</p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
            <strong>${permission}</strong>
          </p>
          <p>Click the button below to confirm your permission:</p>
          <a href="${confirmLink}" 
             style="display: inline-block; background: #0070f3; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Confirm Permission
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 7 days.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Permission email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
