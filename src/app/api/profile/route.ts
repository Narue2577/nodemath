// app/api/profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'cosci_system',
};


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
      database: 'cosci_system',
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Try to find in students table first
    const [studentRows]:any[] = await connection.execute(
      'SELECT stu_name as name, stu_eng_name as enName, stu_group as `group`, stu_advisor as advisor, stu_major as major FROM student WHERE stu_name = ?',
      [name]
    );

    if (studentRows.length > 0) {
      await connection.end();
      return NextResponse.json({ 
        success: true, 
        data: studentRows[0],
        userType: 'student'
      });
    }
     // If not found in students, try staff table
    const [staffRows]:any[] = await connection.execute(
      'SELECT staff_name as name, staff_position as position, staff_email as email, staff_phone as phone, staff_major as major FROM staff WHERE staff_name = ?',
      [name]
    );

    await connection.end();

    if (staffRows.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: staffRows[0],
        userType: 'staff'
      });
    }

    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}


export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userType, data } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    if (userType === 'student') {
      await connection.execute(
        'UPDATE student SET stu_name = ?, stu_eng_name = ?, stu_group = ?, stu_advisor = ?, stu_major = ? WHERE stu_name = ?',
        [data.name, data.enName, data.group, data.advisor, data.major, name]
      );
    } else if (userType === 'staff') {
      await connection.execute(
        'UPDATE staff SET staff_name = ?, staff_position = ?, staff_email = ?, staff_phone = ?, staff_major = ? WHERE staff_name = ?',
        [data.name, data.position, data.email, data.phone, data.major, name]
      );
    }

    await connection.end();

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}