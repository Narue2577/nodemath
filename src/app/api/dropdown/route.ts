import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
     host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'cosci_system'
  });

  try {
    // Query the database
    const [rows] = await connection.execute('SELECT staff_id, staff_name FROM staff WHERE (staff_id >= 10001 AND staff_id <= 30037) AND (staff_name != "ผศ.ดร.ปรวัน แพทยานนท์") AND (staff_email != "") ' );
    // Return the data as JSON
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  } finally {
    // Close the connection
    await connection.end();
  }
}
