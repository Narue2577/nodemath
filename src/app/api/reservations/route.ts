//api/reservations/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { transporter } from '@/lib/email';


//const transporter2 = nodemailer.createTransport({
//  host: process.env.SMTP_HOST,
//  port: parseInt(process.env.SMTP_PORT || '587'),
//  secure: false,
//  auth: {
//    user: process.env.SMTP_USER,
//    pass: process.env.SMTP_PASS,
//  },
//});


// Helper function to check and update expired reservations
/* eslint-disable */
async function updateExpiredReservations(connection: any) {
  try {
    console.log('\n=== Checking for expired reservations ===');
    console.log('Current time:', new Date().toISOString());
    
    // First, let's see what we're working with
    const [occupiedRows]: any = await connection.execute(`
  ( SELECT 
    id,
    username,
    room,
    seat,
    date_out,
    period_time,
    status,
    CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) as end_datetime,
    NOW() as current_timestamp,  
    CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) < NOW() as is_expired
  FROM nodelogin.staff_bookings 
  WHERE (status = 'occupied' OR status = 'pending')
  LIMIT 5 )
  UNION ALL
  (
  SELECT 
      id,
      username,
      room,
      seat,
      date_out,
      period_time,
      status,
      CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) as end_datetime,
      NOW() as current_timestamp,
      CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) < NOW() as is_expired
    FROM nodelogin.student_bookings 
    WHERE (status = 'occupied' OR status = 'pending')
    LIMIT 5
  )
`);
    
    console.log('Sample occupied reservations:', occupiedRows);
    
    // Count how many should be expired
    const [staffCountResult]: any = await connection.execute(`
      SELECT COUNT(*) as count
      FROM nodelogin.staff_bookings
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `);
    
    const [studentCountResult]: any = await connection.execute(`
      SELECT COUNT(*) as count
      FROM nodelogin.student_bookings
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `);

    const totalToExpire = staffCountResult[0].count + studentCountResult[0].count;
    console.log('Staff reservations to expire:', staffCountResult[0].count);
    console.log('Student reservations to expire:', studentCountResult[0].count);
    console.log('Total reservations to expire:', totalToExpire);
    
    // ⭐ FIXED: Added ':00' for seconds to make proper datetime comparison
    // The issue was that period_time is '9:00-12:00' format (HH:MM)
    // But MySQL NOW() returns 'YYYY-MM-DD HH:MM:SS' format
    // So we need to add ':00' for seconds to match the format
     const staffQuery = `
      UPDATE nodelogin.staff_bookings
      SET status = 'complete', updated_at = NOW()
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `; 

    const [staffResult]: any = await connection.execute(staffQuery);
    console.log('Staff update result - Rows affected:', staffResult.affectedRows);
    
    // Update STUDENT bookings (ADDED)
    const studentQuery = `
      UPDATE nodelogin.student_bookings
      SET status = 'complete', updated_at = NOW()
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `;

    const [studentResult]: any = await connection.execute(studentQuery);
    console.log('Student update result - Rows affected:', studentResult.affectedRows);
    
    const totalAffected = staffResult.affectedRows + studentResult.affectedRows;
    console.log('Total rows affected:', totalAffected);
    console.log('=== Expiry check complete ===\n');
    return totalAffected;
  } catch (error) {
    console.error('Error in updateExpiredReservations:', error);
    return 0;
  }
}
/* eslint-enable */

// GET method with auto-update for expired reservations
export async function GET(request: Request) {
 // const { searchParams } = new URL(request.url); // 18 Nov 2568
 // const source = searchParams.get('source');  18 Nov 2568
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

    const selectStaffQuery = `
      SELECT room, seat, status, major FROM nodelogin.staff_bookings
      WHERE (status = 'occupied' OR status = 'pending')
    `;
    const selectStudentQuery = `
      SELECT room, seat, status, major FROM nodelogin.student_bookings
      WHERE (status = 'occupied' OR status = 'pending')
    `;

    const [Staffreservations] = await connection.execute(selectStaffQuery);
    const [Stureservations] = await connection.execute(selectStudentQuery);
    await connection.end();

    return NextResponse.json({ 
      Staffreservations,
      Stureservations,
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
  //  const { searchParams } = new URL(request.url);  18 Nov 2568
   // const source = searchParams.get('source'); 18 Nov 2568
  const data = await request.json();
const { username, major, room, seats, dashboard} = data;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4' //  Add this
    });

    // First, update any expired reservations
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`POST: Updated ${expiredCount} expired reservations`);

    // Now you have everything you need
    console.log('Dashboard:', dashboard);

    // Validation: Check if required fields are present
    if (!username || !major || !room || !seats || !Array.isArray(seats)) {
      await connection.end();
      return NextResponse.json({ 
        error: 'Missing required fields: username, major, room, and seats are required' 
      }, { status: 400 });
    }

    // Check if any seats are already occupied
     const seatIds = seats.map((s: any) => s.seat);
    const placeholders = seatIds.map(() => '?').join(',');
    const isStudent = dashboard === 'dashboard2'; // or however you determine this
    const checkQuery = `
      SELECT seat FROM nodelogin.staff_bookings
      WHERE room = ? AND seat IN (${seatIds.map(() => '?').join(',')}) AND (status = 'occupied' OR status = 'pending')
    `;

    const [existingSeats] = await connection.execute(checkQuery, [room, ...seatIds]);

    if ((existingSeats as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({
        error: 'Some seats are already occupied or pending approval',
        occupiedSeats: (existingSeats as any[]).map(row => row.seat)
      }, { status: 400 });
    }

    // Generate unique approval token
    const approvalToken = crypto.randomUUID();

    const insertQuery = `
      INSERT INTO nodelogin.staff_bookings
      (username, major, room, seat, date_in, date_out, period_time, admin, status, approval_token, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const insertQuery2 = `
      INSERT INTO nodelogin.student_bookings
      (username, major, room, seat, date_in, date_out, period_time, advisor_name, advisor, admin, status, approval_token, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

      const seatDetails = seats.map((seat: any) => `
    <li style="padding: 8px 0; color: #333;">
      <strong>Seat ${seat.seat}:</strong> ${seat.date_in} to ${seat.date_out} (${seat.period_time})
    </li>
  `).join('');

  const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?token=${approvalToken}&action=confirm`;
  const rejectLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reject?token=${approvalToken}`;


    //  Insert with better error handling
    if(isStudent){
    for (const seat of seats) {
      try {
        console.log('Student booking parameters:', {
      username,
      major,
      room,
      seat: seat.seat,
      date_in: seat.date_in,
      date_out: seat.date_out,
      period_time: seat.period_time,
      advisor_name: seat.advisor_name,
      approvalToken
    });
        await connection.execute(insertQuery2, [
          username ?? null,
          major ?? null,
          room ?? null,
          seat.seat ?? null,
          seat.date_in ?? null,
          seat.date_out ?? null,
          seat.period_time ?? null,
          seat.advisor_name ?? null,
          'x',
          'x',
          'pending',
          approvalToken ?? null,
        ]);
      } catch (insertError) {
        console.error('Error inserting seat:', seat.seat, insertError);
        throw insertError; // Re-throw to be caught by outer catch
      }
    }
  }else{
    for (const seat of seats) {
      try {
        console.log('Staff booking parameters:', {
      username,
      major,
      room,
      seat: seat.seat,
      date_in: seat.date_in,
      date_out: seat.date_out,
      period_time: seat.period_time,
      approvalToken
    });
        await connection.execute(insertQuery, [
          username ?? null,
          major ?? null,
          room ?? null,
          seat.seat ?? null,
          seat.date_in ?? null,
          seat.date_out ?? null,
          seat.period_time ?? null,
          'x',
          'pending',
          approvalToken ?? null,
        ]);
      } catch (insertError) {
        console.error('Error inserting seat:', seat.seat, insertError);
        throw insertError; // Re-throw to be caught by outer catch
      }
    }

    try{
      await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "naruesorn@g.swu.ac.th",
    subject: "ขออนุมัติจากผศ.ดร.ปรวัน แพทยานนท์",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: gray; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">คำขออนุมัติการจองห้อง</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              เรียน <strong></strong> (ผู้อนุมัติรายการจองห้อง)
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              <strong>${username}</strong> ได้ทำรายการจองห้องคอมพิวเตอร์ <strong>${room}</strong> 
              ของวิทยาลัยนวัตกรรมสื่อสารสังคม ผ่านทางเว็บไซต์
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              ทั้งนี้ ใคร่ขอรบกวนให้ท่านตรวจสอบรายละเอียดการจอง และอนุมัติหรือไม่อนุมัติรายการจองดังกล่าว โดยกดปุ่มด้านล่าง
            </p>
            
            <!-- Booking Details Box -->
            <div style="background-color: #f8f9fa;  padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 18px; margin-bottom: 15px;">รายละเอียดการจอง</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${seatDetails}
              </ul>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                <strong>วันที่ขอ:</strong> ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
                  
            <!-- Confirm Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 50px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);">
                 อนุมัติ (CONFIRM)
              </a>
            </div>
            <!-- Reject Section  -->
            <div style="background-color: #fff3f3; border: 2px solid #f44336; border-radius: 8px; padding: 25px; margin-top: 30px;">
  <h3 style="color: #f44336; margin-top: 0; font-size: 18px; margin-bottom: 15px;">
    คำขอปฏิเสธ
  </h3>
  <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
    หากต้องการปฏิเสธการจอง กรุณาตอบกลับอีเมลนี้พร้อมระบุเหตุผลของคุณ<br>
  </p>
  <div style="text-align: center; margin-top: 20px;">
    <a href="${rejectLink}" 
                   style="background-color: #f44336; 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-size: 16px; 
                          font-weight: bold; 
                          display: inline-block;
                          margin: 0 0 10px 0;
                          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);">
                  ปฏิเสธการจอง (REJECT)
                </a>
  </div>
</div>
            
          </div>  
        </div>
      </body>
      </html>
    `
  });
    } catch(emailError){
      console.error('Error sending email:', emailError)
    }
  }
    // Send confirmation email if email is provided
      try {



  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "naruesorn@g.swu.ac.th",
    subject: "ขออนุมัติจากผศ.ดร.ปรวัน แพทยานนท์",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: gray; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">คำขออนุมัติการจองห้อง</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              เรียน <strong>ผศ.ดร.ปรวัน แพทยานนท์</strong> (ผู้อนุมัติรายการจองห้อง)
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              <strong>${username}</strong> ได้ทำรายการจองห้องคอมพิวเตอร์ <strong>${room}</strong> 
              ของวิทยาลัยนวัตกรรมสื่อสารสังคม ผ่านทางเว็บไซต์
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              ทั้งนี้ ใคร่ขอรบกวนให้ท่านตรวจสอบรายละเอียดการจอง และอนุมัติหรือไม่อนุมัติรายการจองดังกล่าว โดยกดปุ่มด้านล่าง
            </p>
            
            <!-- Booking Details Box -->
            <div style="background-color: #f8f9fa;  padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 18px; margin-bottom: 15px;">รายละเอียดการจอง</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${seatDetails}
              </ul>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                <strong>วันที่ขอ:</strong> ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
                  
            <!-- Confirm Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 50px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);">
                 อนุมัติ (CONFIRM)
              </a>
            </div>
            <!-- Reject Section  -->
            <div style="background-color: #fff3f3; border: 2px solid #f44336; border-radius: 8px; padding: 25px; margin-top: 30px;">
  <h3 style="color: #f44336; margin-top: 0; font-size: 18px; margin-bottom: 15px;">
    คำขอปฏิเสธ
  </h3>
  <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
    หากต้องการปฏิเสธการจอง กรุณาตอบกลับอีเมลนี้พร้อมระบุเหตุผลของคุณ<br>
  </p>
  <div style="text-align: center; margin-top: 20px;">
    <a href="${rejectLink}" 
                   style="background-color: #f44336; 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-size: 16px; 
                          font-weight: bold; 
                          display: inline-block;
                          margin: 0 0 10px 0;
                          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);">
                  ปฏิเสธการจอง (REJECT)
                </a>
  </div>
</div>
            
          </div>  
        </div>
      </body>
      </html>
    `
  });

    

        /*  <!-- Footer --> Line 294
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              วิทยาลัยนวัตกรรมสื่อสารสังคม<br>
              ระบบจองห้องคอมพิวเตอร์
            </p>
          </div> - Line 300 */
        //    <p>Dear ${username},</p>      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        //    <p>Your reservation has been confirmed:</p>
        //    <p>Room: ${room}</p>
       //     <p>Seats: ${seatIds.join(', ')}</p>
       //     <a href="${confirmLink}">View Details</a>
        console.log("Approval email sent!");
        
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      }
    
   await connection.end();
   // return NextResponse.json({ 
   //   message: 'Reservations created successfully',
   //   count: seats.length,
   //   expiredUpdated: expiredCount
  //  });
  //} catch (err) {
  //  console.error('Database error:', err);
 //   if (connection) await connection.end();
 //   return NextResponse.json({ error: (err as Error).message }, { status: 500 });
 // }
 return NextResponse.json({ 
      message: 'Reservation submitted for approval',
      approvalToken,
    }, { status: 201 });
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
      database: process.env.DB_NAME0
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
      SELECT * FROM nodelogin.staff_bookings
      WHERE username = ? AND room = ? AND seat = ?
    `;

    const checkQuery2 = `
      SELECT * FROM nodelogin.student_bookings
      WHERE username = ? AND room = ? AND seat = ?
    `;
    const [existingReservation] = await connection.execute(checkQuery, [username, room, seat]);

    if (!(existingReservation as any[]).length) {
      await connection.end();
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const updateQuery = `
      UPDATE nodelogin.staff_bookings
      SET major = ?, date_in = ?, date_out = ?, period_time = ?, status = ?, updated_at = NOW()
      WHERE username = ? AND room = ? AND seat = ?
    `;

    const updateQuery2 = `
      UPDATE nodelogin.student_bookings
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