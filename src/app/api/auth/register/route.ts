// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
//import bcrypt from 'bcryptjs';  You'll need to install this: npm install bcryptjs @types/bcryptjs
import mysql from 'mysql2/promise';

export async function POST(req: NextRequest) {
  const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME3,
    });

    let connection;

  try {
    // Parse request body - match what frontend sends
    const { 
      role, 
      id,        // This is either studentId or buasri from frontend
      buasri,    // This is the buasri ID (studentbuasriId or buasri)
      password, 
      fullName, 
      email, 
      phone,
      major,     // Only for students
      advisor,   // Only for students
      position   // Only for teachers
    } = await req.json();

    console.log('Received registration data:', { role, id, buasri, fullName, email });

    // Validation
    if (!role || !id || !buasri || !password || !fullName || !email) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // Role-specific validation
    if (role === 'student' && (!major || !advisor)) {
      return NextResponse.json(
        { success: false, message: 'Major and advisor are required for students.' },
        { status: 400 }
      );
    }

    if (role === 'teacher' && !position) {
      return NextResponse.json(
        { success: false, message: 'Position is required for teachers.' },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    

    // Check if user already exists in database
    if (role === 'student') {
      const [existingStudents] = await connection.query(
        'SELECT * FROM student_member WHERE student_id = ?',
        [id, email]
      );

      if (Array.isArray(existingStudents) && existingStudents.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Student with this ID or email already exists.' },
          { status: 400 }
        );
      }
    } else if (role === 'teacher') {
      const [existingStaff] = await connection.query(
        'SELECT * FROM staff_member WHERE staff_buasri = ?',
        [buasri, email]
      );

      if (Array.isArray(existingStaff) && existingStaff.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Staff member with this ID or email already exists.' },
          { status: 400 }
        );
      }
    }
   
    // Insert new user into database
    // Adjust table name and columns to match your schema
     if (role === 'student') {
    const insertQuery = `
      INSERT INTO student_member 
      (student_id,student_buasri, student_password, student_name,  student_major, student_advisor, student_email, student_phone, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    await connection.query(insertQuery, [
         id,              // student_id (from your form: studentId)
        buasri,          // student_buasri (from your form: studentbuasriId)
        password,  // student_password (HASHED!)
        fullName,        // student_name
        major,           // student_major
        advisor,         // student_advisor
        email,           // student_email
        phone            // student_phone
      ]);
}else if (role === 'teacher') {
      const insertQuery2 = `
        INSERT INTO staff_member 
        (staff_id, staff_buasri, staff_password, staff_name, staff_position, staff_email, staff_phone, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      await connection.query(insertQuery2, [
        id,              // staff_id (from frontend: staffId)
        buasri,          // staff_buasri (from frontend: buasri)
        password,  // staff_password (HASHED)
        fullName,        // staff_name
        position,        // staff_position
        email,           // staff_email
        phone            // staff_phone
      ]);

      console.log('New user registered:', { id, role, email });
    }

     
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

    
    return NextResponse.json(
      { success: true, message: 'Registration successful! You can now login.',user: { id, role, fullName, email } },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during registration.' },
      { status: 500 }
    );
  }finally {
    if (connection) connection.release();
  }
}