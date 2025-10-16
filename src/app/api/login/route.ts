// /api/login/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Create a MySQL connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'xxxxxxxx',
    });
    const body = await req.json();
    const { role, buasri, fullName, email, password, position, phone, enName, major } = body;


    // Validate input (optional but recommended)
    if (!buasri) {
      return NextResponse.json(
        { message: 'Buasri ID is required'},
        { status: 400 }
      );
    }
    // Handle teacher registration
    if (role === "teacher") {
      if ( !position) {
        return NextResponse.json(
          { message: "Position is required for teachers" },
          { status: 400 }
        );
      }

      console.log("Teacher Registration Data:", {
        fullName,
        password,
        email,
        phone,
        position,
      });

      // Save teacher data (replace with actual database logic)
    }

       // Handle student registration
    if (role === "student") {
      if (!major) {
        return NextResponse.json(
          { message: "Major is required for students" },
          { status: 400 }
        );
      }

      console.log("Student Registration Data:", {
        fullName,
        password,
        enName,
        major,
      });

      // Save student data (replace with actual database logic)
    }

    

    try {
      // Check if the user already exists
      let rows: any;
      if(role === "student"){
          [rows] = await pool.query('SELECT * FROM student WHERE stu_buasri = ?', [buasri]);
        }else{
          [rows] = await pool.query('SELECT * FROM staff WHERE staff_buasri = ?', [buasri]);
        }
     // const [rows] = await pool.query('SELECT * FROM users WHERE name = ?', [fullName,]);

      if (Array.isArray(rows) && rows.length > 0) {
        // If the user exists, update their record
        if(role === "student"){
          await pool.query(
          'UPDATE student SET stu_eng_name = ?, stu_password = ?, stu_name = ?, stu_major = ? WHERE stu_buasri = ?',
          [ enName, password, fullName, major, buasri]
        );
        }else{
          await pool.query(
          'UPDATE staff SET staff_email = ?, staff_password = ?, staff_name = ? WHERE staff_buasri = ?',
          [email, password, fullName, buasri] );
        }
        
        return NextResponse.json({ message: 'User updated successfully' });
      } else {
        // If the user doesn't exist, create a new record
        if(role === "student"){
          await pool.query(
          'INSERT INTO student (stu_id,stu_buasri, stu_password, stu_name, stu_eng_name, stu_group, stu_advisor, stu_major, stu_status) VALUES ("",?, ?, ?,?,"","",?,"o")',
          [buasri,  password, fullName, enName, major] );
        }else{
          await pool.query(
          'INSERT INTO staff (staff_id,staff_buasri, staff_password, staff_name, staff_position, staff_email, staff_phone, staff_major, staff_workload, staff_from, staff_status) VALUES ("",?, ?, ?, ?,?,"","",0,"","o")',
          [buasri,  password, fullName, position, email] );
        }
     //   await pool.query(
    //      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
     //     [fullName, email, password]
    //    );
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