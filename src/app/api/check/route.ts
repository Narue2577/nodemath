//api/check/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// ⭐ ADDED: Helper function to update expired reservations
async function updateExpiredReservations(connection: any) {
  try {
    console.log('Checking for expired reservations...');
    
    const query = `
      UPDATE nodelogin.stud_reserv 
      SET status = 'complete', updated_at = NOW()
      WHERE status = 'occupied' 
      AND STR_TO_DATE(
        CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00'),
        '%Y-%m-%d %H:%i:%s'
      ) < NOW()
    `;

    const [result]: any = await connection.execute(query);
    console.log('Expired reservations updated:', result.affectedRows);
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating expired reservations:', error);
    return 0;
  }
}

export async function GET(request: Request) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // ⭐ ADDED: Update expired reservations before fetching
    await updateExpiredReservations(connection);

    // Extract username from query parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    console.log('API Check - Received username:', username);

    if (!username) {
      await connection.end();
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // ⭐ FIXED: Changed peroid_time to period_time (was misspelled)
    const selectQuery = `
      SELECT id, room, seat, date_in, date_out, period_time, status,admin
      FROM nodelogin.stud_reserv 
      WHERE username = ? AND status = 'occupied'
      ORDER BY created_at DESC
    `;

    // Execute the query with the username parameter
    const [reservations] = await connection.execute(selectQuery, [username]);
    
    console.log('Query executed. Results count:', (reservations as any[]).length);
    console.log('First result:', (reservations as any[])[0]);
    
    await connection.end();

    // Ensure `reservations` is an array
    const safeReservations = Array.isArray(reservations) ? reservations : [];
    const formatDate = (dateString:any) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};
    // Format dates to "YYYY-MM-DD" without time
    /* eslint-disable */
    const formattedReservations = safeReservations.map((post: any) => ({  
      id: post.id,
      room: post.room,
      seat: post.seat,
      date_in:  formatDate(post.date_in),
      date_out: formatDate(post.date_out),
      period_time: post.period_time, // ⭐ FIXED: Changed from peroid_time to period_time
      status: post.status,
      admin: post.admin
    }));
 /*date_in: post.date_in ? new Date(post.date_in).toISOString().split('T')[0] : "N/A",
      date_out: post.date_out ? new Date(post.date_out).toISOString().split('T')[0] : "N/A", */
    console.log('Returning formatted reservations:', formattedReservations.length);

    return NextResponse.json({ 
      reservations: formattedReservations,
      count: formattedReservations.length 
    });
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

    // ⭐ ADDED: Update expired reservations before processing
    await updateExpiredReservations(connection);

    // ⭐ FIXED: Changed peroid_time to period_time
    const { username, room, seat, date_in, date_out, period_time, status, admin} = await request.json();

    if (!username || !room || !seat || !date_in || !date_out || !period_time || !status) {
      await connection.end();
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // ⭐ FIXED: Changed peroid_time to period_time in UPDATE query
    const updateQuery = `
      UPDATE nodelogin.stud_reserv 
      SET date_in = ?, date_out = ?, period_time = ?, status = ?, updated_at = NOW()
      WHERE username = ? AND room = ? AND seat = ?
    `;

    await connection.execute(updateQuery, [
      date_in,
      date_out,
      period_time, // ⭐ FIXED: Changed from peroid_time to period_time
      status,
      username,
      room,
      seat
    ]);

    await connection.end();
    return NextResponse.json({ message: 'Reservation updated successfully' });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}