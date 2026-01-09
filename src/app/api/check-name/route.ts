// app/api/check-name/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { buasri, role } = body;

    // Validate input
    if (!buasri || typeof buasri !== 'string') {
      return NextResponse.json(
        { message: 'ID is required and must be a string' },
        { status: 400 }
      );
    }

    if (!role || (role !== 'student' && role !== 'teacher')) {
      return NextResponse.json(
        { message: 'Valid role is required (student or teacher)' },
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
      // Check if the ID exists in the database based on role
      const query = role === "student" 
        ? 'SELECT * FROM student INNER JOIN staff ON student.stu_advisor = staff.staff_id INNER JOIN major ON student.stu_major = major.maj_id WHERE stu_id = ?' 
        : 'SELECT * FROM staff WHERE staff_buasri = ?';
      
      const [rows] = await pool.query(query, [buasri]);
      const exists = Array.isArray(rows) && rows.length > 0;

      return NextResponse.json({ 
        exists: exists,
        userData: exists ? rows[0] : null
      });

    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { message: 'Database query failed' },
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
  return NextResponse.json(
    { message: 'Method Not Allowed' }, 
    { status: 405 }
  );
}