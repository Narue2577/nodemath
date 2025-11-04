import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      email: string;
      permission: string;
      timestamp: number;
    };

    // Store permission in your database
    // await db.permissions.create({
    //   email: decoded.email,
    //   permission: decoded.permission,
    //   confirmedAt: new Date(),
    // });

    return NextResponse.json({
      success: true,
      data: {
        email: decoded.email,
        permission: decoded.permission,
      },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, error: 'Link has expired' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 400 }
    );
  }