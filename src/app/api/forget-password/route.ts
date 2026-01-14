// src/app/api/forget-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME3,
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    // Check if email exists in student or staff table
  const connection = await mysql.createConnection(dbConfig);
  
  const [studentRows] = await connection.execute(
    'SELECT * FROM student_member WHERE student_email = ?',
    [email]
  );
  
  const [staffRows] = await connection.execute(
    'SELECT * FROM staff_member WHERE staff_email = ?',
    [email]
  );
    const secret = process.env.JWT_SECRET ?? 'default-secret';
     // Generate a secure token with permission details
    const token = jwt.sign(
  { 
    email, 
    permission: 'reset-password',
    timestamp: Date.now() 
  },
  secret,
  { expiresIn: '1h' }
);
     // Create confirmation link
    const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;
  
    // Configure email transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>We received a request to reset your password.</h2>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          This email is to confirm that you requested resetting a password.
          This process required your confirmation by click the button below.
          </p>
          <a href="${confirmLink}" 
             style="display: inline-block; background: #0070f3; color: white; 
                    padding: 12px 24px; text-decoration: none; border-radius: 5px; 
                    margin: 20px 0;">
            Reset My Password
          </a>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 3 days.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't expect this email, you can safely ignore it.
          </p>
        </div>
      `,
    };
  

    // Validate email
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // TODO: Check if email exists in your database
    // For now, we'll proceed (but in production, verify the email exists)

    
    // TODO: Store token in database with expiration (1 hour)
    // Example structure:
    // await db.passwordResets.create({
    //   email,
    //   token: hashToken(token), // hash it before storing
    //   expiresAt: new Date(Date.now() + 3600000) // 1 hour
    // });



    // Send email
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