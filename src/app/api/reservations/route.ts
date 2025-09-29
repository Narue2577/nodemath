//api/reservstions/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';


// Helper function to check and update expired reservations
/* eslint-disable */async function updateExpiredReservations(connection: any) {
  const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Query to find reservations that are past their end date/time
  const query = `
    UPDATE nodelogin.stud_reserv 
    SET status = 'complete' 
    WHERE (status = 'occupied') AND (
      CONCAT(date_out, ' ', SUBSTRING_INDEX(peroid_time, '-', -1)) < ?
    )
  `;

  await connection.execute(query, [currentDateTime]);
}
/* eslint-disable */
// GET method with auto-update for expired reservations
export async function GET(request: Request) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    await updateExpiredReservations(connection);

    // Then fetch all active (occupied) reservations
    const selectQuery = `
      SELECT room, seat, status FROM nodelogin.stud_reserv 
      WHERE status = 'occupied'
    `;

    const [reservations] = await connection.execute(selectQuery);
    connection.end();

    return NextResponse.json({ reservations });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST method with auto-update for expired reservations
export async function POST(request: Request) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    await updateExpiredReservations(connection);

    const { username, room, seats } = await request.json();

    // Check if any seats are already occupied
    const seatIds = seats.map((s: any) => s.seat);
    const checkQuery = `
      SELECT seat FROM nodelogin.stud_reserv 
      WHERE room = ? AND seat IN (${seatIds.map(() => '?').join(',')}) AND status = 'occupied'
    `;

    const [existingSeats] = await connection.execute(checkQuery, [room, ...seatIds]);

    if ((existingSeats as any[]).length > 0) {
      connection.end();
      return NextResponse.json({
        error: 'Some seats are already occupied',
        occupiedSeats: (existingSeats as any[]).map(row => row.seat)
      }, { status: 400 });
    }

    // Insert new reservations
    const insertQuery = `
      INSERT INTO nodelogin.stud_reserv 
      (username, room, seat, date_in, date_out, peroid_time, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    for (const seat of seats) {
      await connection.execute(insertQuery, [
        username,
        room,
        seat.seat,
        seat.date_in,
        seat.date_out,
        seat.peroid_time || '9:00-12:00', // Default period time if not provided
        seat.status || 'occupied'
      ]);
    }

    connection.end();
    return NextResponse.json({ message: 'Reservations created successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT method with auto-update for expired reservations
export async function PUT(request: Request) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    await updateExpiredReservations(connection);

    const { username, room, seat, date_in, date_out, peroid_time, status } = await request.json();

    if (!username || !room || !seat || !date_in || !date_out || !peroid_time || !status) {
      connection.end();
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if the reservation exists
    const checkQuery = `
      SELECT * FROM nodelogin.stud_reserv 
      WHERE username = ? AND room = ? AND seat = ?
    `;

    const [existingReservation] = await connection.execute(checkQuery, [username, room, seat]);

    if (!(existingReservation as any[]).length) {
      connection.end();
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Update the reservation
    const updateQuery = `
      UPDATE nodelogin.stud_reserv 
      SET date_in = ?, date_out = ?, peroid_time = ?, status = ?
      WHERE username = ? AND room = ? AND seat = ?
    `;

    await connection.execute(updateQuery, [
      date_in,
      date_out,
      peroid_time,
      status,
      username,
      room,
      seat
    ]);

    connection.end();
    return NextResponse.json({ message: 'Reservation updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}