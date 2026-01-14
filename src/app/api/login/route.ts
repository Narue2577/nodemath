// /api/login/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(req: Request) {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME3,
  });

  try {
    const body = await req.json();
    const { role, buasri, fullName, email, password, position, phone, enName, major } = body;

    // Validate input
    if (!buasri || !password) {
      return NextResponse.json(
        { message: 'Buasri ID and password are required' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (role === "teacher" && !position && !fullName) {
      return NextResponse.json(
        { message: "Position and name are required for teachers" },
        { status: 400 }
      );
    }

    if (role === "student" && !major && !fullName) {
      return NextResponse.json(
        { message: "Major and name are required for students" },
        { status: 400 }
      );
    }

    // Check if user exists
    let rows: any;
    if (role === "student") {
      [rows] = await pool.query('SELECT * FROM student_member WHERE student_id = ?', [buasri]);
    } else {
      [rows] = await pool.query('SELECT * FROM staff_member WHERE staff_buasri = ?', [buasri]);
    }

    if (Array.isArray(rows) && rows.length > 0) {
      // User exists - UPDATE
      if (role === "student") {
        await pool.query(
          'UPDATE student SET stu_eng_name = ?, stu_password = ?, stu_name = ?, stu_major = ? WHERE stu_buasri = ?',
          [enName, password, fullName, major, buasri]
        );
      } else {
        await pool.query(
          'UPDATE staff SET staff_email = ?, staff_password = ?, staff_name = ?, staff_position = ?, staff_phone = ? WHERE staff_buasri = ?',
          [email, password, fullName, position, phone, buasri]
        );
      }
      return NextResponse.json({ 
        message: 'User updated successfully',
        isNewUser: false 
      });
    } else {
      // User doesn't exist - INSERT
      // Generate a unique ID using timestamp + random number
      const generateUniqueId = () => {
        return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      };

      if (role === "student") {
        const stuId = generateUniqueId();
        await pool.query(
          'INSERT INTO student (stu_id, stu_buasri, stu_password, stu_name, stu_eng_name, stu_group, stu_advisor, stu_major, stu_status) VALUES (?, ?, ?, ?, ?, "", "", ?, "o")',
          [stuId, buasri, password, fullName, enName, major]
        );
      } else {
        const staffId = generateUniqueId();
        await pool.query(
          'INSERT INTO staff (staff_id, staff_buasri, staff_password, staff_name, staff_position, staff_email, staff_phone, staff_major, staff_workload, staff_from, staff_status) VALUES (?, ?, ?, ?, ?, ?, ?, "",21, "", "o")',
          [staffId, buasri, password, fullName, position, email, phone || ""]
        );
      }
      return NextResponse.json(
        { 
          message: 'User registered successfully',
          isNewUser: true 
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}