// /api/login/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input (optional but recommended)
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create a MySQL connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    try {
      // Check if the user already exists
      const [rows] = await pool.query('SELECT * FROM users WHERE name = ?', [
        name,
      ]);

      if (Array.isArray(rows) && rows.length > 0) {
        // If the user exists, update their record
        await pool.query(
          'UPDATE users SET email = ?, password = ? WHERE name = ?',
          [email, password, name]
        );
        return NextResponse.json({ message: 'User updated successfully' });
      } else {
        // If the user doesn't exist, create a new record
        await pool.query(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, password]
        );
        return NextResponse.json(
          { message: 'User registered successfully' },
          { status: 201 }
        );
      }
    } catch (error) {
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