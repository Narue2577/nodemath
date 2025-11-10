// ========================================
// app/api/reset-password/route.ts
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'cosci_system',
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET - Verify token and check which database the email exists in
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { success: false, error: 'Reset link has expired. Please request a new one.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Invalid reset link' },
        { status: 400 }
      );
    }

    // Check which database has this email
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Check student table
      const [studentRows] = await connection.execute(
        'SELECT stu_email FROM student WHERE stu_email = ?',
        [decoded.email]
      );

      if ((studentRows as any[]).length > 0) {
        await connection.end();
        return NextResponse.json({
          success: true,
          data: {
            email: decoded.email,
            userType: 'student',
            message: 'Valid reset token'
          },
        });
      }

      // Check staff table
      const [staffRows] = await connection.execute(
        'SELECT staff_email FROM staff WHERE staff_email = ?',
        [decoded.email]
      );

      if ((staffRows as any[]).length > 0) {
        await connection.end();
        return NextResponse.json({
          success: true,
          data: {
            email: decoded.email,
            userType: 'staff',
            message: 'Valid reset token'
          },
        });
      }

      // Email not found in either table
      await connection.end();
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}

// POST - Reset password
export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json();

    // Validate inputs
    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { success: false, error: 'Reset link has expired. Please request a new one.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Invalid reset link' },
        { status: 400 }
      );
    }

    // Hash the new password
    //const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const connection = await mysql.createConnection(dbConfig);

    try {
      // Try updating student table first
      const [studentResult] = await connection.execute(
        'UPDATE student SET stu_password = ? WHERE stu_email = ?',
        [newPassword, decoded.email]
      );
      
      if ((studentResult as any).affectedRows > 0) {
        await connection.end();
        return NextResponse.json({
          success: true,
          message: 'Password reset successfully! You can now login with your new password.',
        });
      }

      // If not student, try staff table
      const [staffResult] = await connection.execute(
        'UPDATE staff SET staff_password = ? WHERE staff_email = ?',
        [newPassword, decoded.email]
      );
      
      if ((staffResult as any).affectedRows > 0) {
        await connection.end();
        return NextResponse.json({
          success: true,
          message: 'Password reset successfully! You can now login with your new password.',
        });
      }

      // User not found in either table
      await connection.end();
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );

    } catch (dbError) {
      await connection.end();
      throw dbError;
    }

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}