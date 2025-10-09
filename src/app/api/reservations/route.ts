//api/reservations/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Helper function to check and update expired reservations
/* eslint-disable */
async function updateExpiredReservations(connection: any) {
  try {
    console.log('\n=== Checking for expired reservations ===');
    console.log('Current time:', new Date().toISOString());
    
    // First, let's see what we're working with
    const [occupiedRows]: any = await connection.execute(`
      SELECT 
        id,
        username,
        room,
        seat,
        date_out,
        period_time,
        status,
        CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) as end_datetime,
        NOW() as current_time,
        CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) < NOW() as is_expired
      FROM nodelogin.stud_reserv 
      WHERE status = 'occupied'
      LIMIT 5
    `);
    
    console.log('Sample occupied reservations:', occupiedRows);
    
    // Count how many should be expired
    const [countResult]: any = await connection.execute(`
      SELECT COUNT(*) as count
      FROM nodelogin.stud_reserv 
      WHERE status = 'occupied' 
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `);
    
    console.log('Reservations to expire:', countResult[0].count);
    
    // ⭐ FIXED: Added ':00' for seconds to make proper datetime comparison
    // The issue was that period_time is '9:00-12:00' format (HH:MM)
    // But MySQL NOW() returns 'YYYY-MM-DD HH:MM:SS' format
    // So we need to add ':00' for seconds to match the format
    const query = `
      UPDATE nodelogin.stud_reserv 
      SET status = 'complete', updated_at = NOW()
      WHERE status = 'occupied' 
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `; 

    const [result]: any = await connection.execute(query);
    console.log('Update result - Rows affected:', result.affectedRows);
    console.log('=== Expiry check complete ===\n');
    
    return result.affectedRows;
  } catch (error) {
    console.error('Error in updateExpiredReservations:', error);
    return 0;
  }
}
/* eslint-enable */

// GET method with auto-update for expired reservations
export async function GET(request: Request) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`GET: Updated ${expiredCount} expired reservations`);

    const selectQuery = `
      SELECT room, seat, status, major FROM nodelogin.stud_reserv 
      WHERE status = 'occupied'
    `;

    const [reservations] = await connection.execute(selectQuery);
    await connection.end();

    return NextResponse.json({ 
      reservations,
      expiredUpdated: expiredCount 
    });
  } catch (err) {
    console.error('Database error:', err);
    if (connection) await connection.end();
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST method with auto-update for expired reservations
export async function POST(request: Request) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`POST: Updated ${expiredCount} expired reservations`);

    const { username, major, room, seats } = await request.json();

    // Validation: Check if required fields are present
    if (!username || !major || !room || !seats || !Array.isArray(seats)) {
      await connection.end();
      return NextResponse.json({ 
        error: 'Missing required fields: username, major, room, and seats are required' 
      }, { status: 400 });
    }

    // Check if any seats are already occupied
    const seatIds = seats.map((s: any) => s.seat);
    const checkQuery = `
      SELECT seat FROM nodelogin.stud_reserv 
      WHERE room = ? AND seat IN (${seatIds.map(() => '?').join(',')}) AND status = 'occupied'
    `;

    const [existingSeats] = await connection.execute(checkQuery, [room, ...seatIds]);

    if ((existingSeats as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({
        error: 'Some seats are already occupied',
        occupiedSeats: (existingSeats as any[]).map(row => row.seat)
      }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO nodelogin.stud_reserv 
      (username, major, room, seat, date_in, date_out, period_time, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const seat of seats) {
      await connection.execute(insertQuery, [
        username,
        major,
        room,
        seat.seat,
        seat.date_in,
        seat.date_out,
        seat.period_time,
        seat.status || 'occupied'
      ]);
    }

    await connection.end();
    return NextResponse.json({ 
      message: 'Reservations created successfully',
      count: seats.length,
      expiredUpdated: expiredCount
    });
  } catch (err) {
    console.error('Database error:', err);
    if (connection) await connection.end();
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT method with auto-update for expired reservations
export async function PUT(request: Request) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`PUT: Updated ${expiredCount} expired reservations`);

    const { username, major, room, seat, date_in, date_out, period_time, status } = await request.json();

    if (!username || !major || !room || !seat || !date_in || !date_out || !period_time || !status) {
      await connection.end();
      return NextResponse.json({ 
        error: 'Missing required fields: username, major, room, seat, date_in, date_out, period_time, and status are required' 
      }, { status: 400 });
    }

    // Check if the reservation exists
    const checkQuery = `
      SELECT * FROM nodelogin.stud_reserv 
      WHERE username = ? AND room = ? AND seat = ?
    `;

    const [existingReservation] = await connection.execute(checkQuery, [username, room, seat]);

    if (!(existingReservation as any[]).length) {
      await connection.end();
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const updateQuery = `
      UPDATE nodelogin.stud_reserv 
      SET major = ?, date_in = ?, date_out = ?, period_time = ?, status = ?, updated_at = NOW()
      WHERE username = ? AND room = ? AND seat = ?
    `;

    await connection.execute(updateQuery, [
      major,
      date_in,
      date_out,
      period_time,
      status,
      username,
      room,
      seat
    ]);

    await connection.end();
    return NextResponse.json({ 
      message: 'Reservation updated successfully',
      expiredUpdated: expiredCount
    });
  } catch (err) {
    console.error('Database error:', err);
    if (connection) await connection.end();
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}