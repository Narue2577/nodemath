// api/delete/route.ts
import mysql from 'mysql2/promise';
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const req = await request.json();
  console.log('Received data:', req);
  
  // Option 1: Use ID (best approach if you have it)
  const { id } = req;
  
  if (id) {
    // Use ID - most reliable method
    try {
      console.log('Connecting to database...');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      
      const updateQuery = `
        UPDATE nodelogin.bookingsTest
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = ? AND status = 'occupied'
      `;
      
      console.log('Executing query with ID:', id);
      const [result] = await connection.execute(updateQuery, [id]);
      console.log('Update result:', result);
      
      await connection.end();
      
      if (result.affectedRows === 0) {
        return NextResponse.json({ message: "Reservation not found or already cancelled" }, { status: 404 });
      }
      
      return NextResponse.json({ 
        message: "Reservation cancelled successfully",
        affectedRows: result.affectedRows 
      }, { status: 200 });
      
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return NextResponse.json({ message: "Failed to cancel reservation" }, { status: 500 });
    }
  }
  
  // Option 2: Use username, room, seat (fallback)
  const { username, room, seat } = req;
  
  if (!username || !room || !seat) {
    return NextResponse.json({ message: "Username, Room, and Seat are required" }, { status: 400 });
  }
  
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    
    // First check if record exists
    const checkQuery = `
      SELECT * FROM nodelogin.bookingsTest
      WHERE username = ? AND room = ? AND seat = ? AND status = 'occupied'
    `;
    
    console.log('Checking for existing record with:', { username, room, seat });
    const [existingRecords] = await connection.execute(checkQuery, [username, room, seat]);
    console.log('Found records:', existingRecords);
    
    if (!Array.isArray(existingRecords) || existingRecords.length === 0) {
      await connection.end();
      return NextResponse.json({ message: "No active reservation found for this user, room, and seat" }, { status: 404 });
    }
    
    // Update the most recent reservation for this user/room/seat combination
    const updateQuery = `
      UPDATE nodelogin.bookingsTest
      SET status = 'cancelled', updated_at = NOW()
      WHERE username = ? AND room = ? AND seat = ? AND status = 'occupied'
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    console.log('Executing query:', updateQuery);
    console.log('With parameters:', [username, room, seat]);
    
    const [result] = await connection.execute(updateQuery, [username, room, seat]);
    console.log('Update result:', result);
    
    await connection.end();
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: "No reservation found to cancel" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Reservation cancelled successfully",
      affectedRows: result.affectedRows 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json({ message: "Failed to cancel reservation" }, { status: 500 });
  }
}