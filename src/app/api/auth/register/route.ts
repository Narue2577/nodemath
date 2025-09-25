// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // You'll need to install this: npm install bcryptjs @types/bcryptjs

export async function POST(req: NextRequest) {
  try {
    const { buasri, password, role } = await req.json();

    // Validation
    if (!buasri || !password) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all fields.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Check if user already exists (replace with your database logic)
    const existingUsers = [
      { buasri: "66130500000", role: "student" },
      { buasri: "T001", role: "teacher" }
    ];
    
    const userExists = existingUsers.find(user => user.buasri === buasri);
    if (userExists) {
      return NextResponse.json(
        { success: false, message: 'User with this Buasri ID already exists.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // TODO: Save to your database
    // Example:
    // const newUser = await db.user.create({
    //   data: {
    //     buasri,
    //     password: hashedPassword,
    //     role: role || 'student',
    //     name: `User ${buasri}`
    //   }
    // });

    console.log('New user registered:', { buasri, role: role || 'student' });

    return NextResponse.json(
      { success: true, message: 'Registration successful! You can now login.' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration.' },
      { status: 500 }
    );
  }
}