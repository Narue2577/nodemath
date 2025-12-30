//api/check-name
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buasri, role } = body;

    // Validate input (optional but recommended)
    if (!buasri || typeof buasri !== 'string') {
      return NextResponse.json(
        { message: 'Name is required and must be a string' },
        { status: 400 }
      );
    }

    // Create a MySQL connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME2,
    });
    
    try {
  // Check if the name exists in the database
  const query = role == "student" 
    ? 'SELECT * FROM student WHERE stu_buasri = ?' 
    : 'SELECT * FROM staff WHERE staff_buasri = ?';
  
  const [rows] = await pool.query(query, [buasri]);
  const exists = Array.isArray(rows) && rows.length > 0;

  return NextResponse.json({ 
    exists: exists,
    userData: exists ? rows[0] : null
  });
}catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Internal server error' },
        { status: 500 }
      );
    } finally {
      await pool.end();
    }
  } catch (error) {
    console.error('Request parsing error:', error);
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}