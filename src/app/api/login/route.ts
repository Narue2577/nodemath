// /api/login/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  const { buasri, role } = await request.json();

  // Create a connection to the MySQL database
  const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Ertnom35!', // **ควรเก็บรหัสผ่านใน environment variables เพื่อความปลอดภัย**
    database: 'cosci_system'
  });

  try {
    let tableName, columnName;

    // Determine the table and column based on the role
    if (role === 'student') {
      tableName = 'student'; 
      columnName = 'stu_buasri';
    } else if (role === 'teacher') {
      tableName = 'staff'; 
      columnName = 'staff_buasri';
    } else {
      await db.end();
      return NextResponse.json(
        { error: 'Invalid role' }, // แจ้งข้อผิดพลาดที่ชัดเจน
        { status: 400 }
      );
    }

    // Query to check if the buasri exists in the database
    const [rows] = await db.execute(
      `SELECT ${columnName} AS buasri FROM ${tableName} WHERE ${columnName} = ?`,
      [buasri]
    );

    await db.end();

    if (Array.isArray(rows) && rows.length > 0) {
      // If the data exists in the database
      return NextResponse.json(
        { message: 'Login successful', exists: true }, 
        { status: 200 }
      );
    } else {
      // If the data does not exist, redirect to register page
      return NextResponse.json(
        { error: 'Buasri ID not found. Please register.', exists: false },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Database error:', error);
    await db.end();
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}