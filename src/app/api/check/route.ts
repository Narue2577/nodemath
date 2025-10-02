//api/check/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
          user: 'root',
          password: 'Ertnom35!',
          database: 'nodelogin'
    });

    // Fetch all active (occupied) reservations for the specific username
    const selectQuery = `
      SELECT room, seat, date_in, date_out, peroid_time, status 
      FROM nodelogin.stud_reserv 
      WHERE username = ? AND status = 'occupied'
    `;

    // Extract username from query parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Execute the query with the username parameter
    const [reservations] = await connection.execute(selectQuery, [username]);
    console.log('Database Query Result:', reservations);
    connection.end();

    // Ensure `reservations` is an array
    const safeReservations = Array.isArray(reservations) ? reservations : [];

    // Format dates to "YYYY-MM-DD" without time
    /* eslint-disable */const formattedReservations = safeReservations.map((post: any ) => ({  
      ...post,
      date_in: post.date_in ? new Date(post.date_in).toISOString().split('T')[0] : "N/A",
      date_out: post.date_out ? new Date(post.date_out).toISOString().split('T')[0] : "N/A"
    }));
    console.log('Formatted Reservations:', formattedReservations);
    return NextResponse.json({ reservations: formattedReservations });
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