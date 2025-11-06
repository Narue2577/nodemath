// src/app/api/forget-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';



export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // TODO: Check if email exists in your database
    // For now, we'll proceed (but in production, verify the email exists)

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // TODO: Store token in database with expiration (1 hour)
    // Example structure:
    // await db.passwordResets.create({
    //   email,
    //   token: hashToken(token), // hash it before storing
    //   expiresAt: new Date(Date.now() + 3600000) // 1 hour
    // });

    // Create reset link
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password from .env
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          
          <a href="${resetLink}" 
             style="display: inline-block; background: #4F46E5; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Reset Password
          </a>
          
          <p>Or copy and paste this link:</p>
          <p style="background: #f5f5f5; padding: 10px; word-break: break-all;">
            ${resetLink}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This link will expire in 1 hour.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`Password reset email sent to: ${email}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}