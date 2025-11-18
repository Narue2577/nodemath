//api/reservations/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import crypto from 'crypto';



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
    NOW() as current_timestamp,  -- ⭐ Changed name
    CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) < NOW() as is_expired
  FROM nodelogin.stud_reserv 
  WHERE (status = 'occupied' OR status = 'pending')
  LIMIT 5
`);
    
    console.log('Sample occupied reservations:', occupiedRows);
    
    // Count how many should be expired
    const [countResult]: any = await connection.execute(`
      SELECT COUNT(*) as count
      FROM nodelogin.stud_reserv 
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `);
    
    console.log('Reservations to expire:', countResult[0].count);
    
    //  FIXED: Added ':00' for seconds to make proper datetime comparison
    // The issue was that period_time is '9:00-12:00' format (HH:MM)
    // But MySQL NOW() returns 'YYYY-MM-DD HH:MM:SS' format
    // So we need to add ':00' for seconds to match the format
    const query = `
      UPDATE nodelogin.stud_reserv 
      SET status = 'complete', updated_at = NOW()
      WHERE (status = 'occupied' OR status = 'pending')
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
  const { searchParams } = new URL(request.url); // 18 Nov 2568
  const source = searchParams.get('source'); // 18 Nov 2568
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

  // 18 Nov 2568
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`GET: Updated ${expiredCount} expired reservations`)

  if (source === 'admin') { // 18 Nov 2568
    // Return admin-specific data
    const adminQuery = `
      SELECT room, seat, status, major FROM nodelogin.staff_ bookings
      WHERE (status = 'occupied' OR status = 'pending')
    `;
      const [adminReservations] = await connection.execute(adminQuery);
      await connection.end();
     return NextResponse.json({ 
      adminReservations,
      expiredUpdated: expiredCount 
    }); // 18 Nov 2568 // 18 Nov 2568
  } else if (source === 'student') {// 18 Nov 2568
    // Return user-specific data 
   ;
    const studentQuery = `
      SELECT room, seat, status, major FROM nodelogin.student_ bookings
      WHERE (status = 'occupied' OR status = 'pending')
    `;
    const [studentReservations] = await connection.execute(studentQuery);
    await connection.end();
    return NextResponse.json({ 
      studentReservations,
      expiredUpdated: expiredCount 
    }); // 18 Nov 2568
  } else {
    // Default case - return error or empty data
     await connection.end();
     return NextResponse.json({ 
        error: 'Invalid source parameter. Must be "admin" or "student"' 
      }, { status: 400 });
  } 


  // 18 Nov 2568
  //Original
    // First, update any expired reservations
    //const expiredCount = await updateExpiredReservations(connection);
    //console.log(`GET: Updated ${expiredCount} expired reservations`);

    /*Original
    const selectQuery = `.  
      SELECT room, seat, status, major FROM nodelogin.stud_reserv 
      WHERE (status = 'occupied' OR status = 'pending')
    `; //Original
    //Original
    const [reservations] = await connection.execute(selectQuery);
    //Original
    await connection.end();

    return NextResponse.json({ 
      reservations,
      expiredUpdated: expiredCount 
    });
     */  //Original
  } catch (err) {
    console.error('Database error:', err);
    if (connection) await connection.end();
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST method with auto-update for expired reservations
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url); // 18 Nov 2568
  const source = searchParams.get('source'); // 18 Nov 2568
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

     // Validate source parameter first
    if (source !== 'admin' && source !== 'student') {
      await connection.end();
      return NextResponse.json({
        error: 'Invalid source parameter. Must be "admin" or "student"'
      }, { status: 400 });
    }

     const body = await request.json();
    let username, major, room, seats, advisor;
if (source === 'admin') {
      ({ username, major, room, seats } = body);
      
      // Validation for admin
      if (!username || !major || !room || !seats || !Array.isArray(seats)) {
        await connection.end();
        return NextResponse.json({
          error: 'Missing required fields: username, major, room, and seats are required'
        }, { status: 400 });
      }
    } else if (source === 'student') {
      ({ username, major, room, seats, advisor } = body);
      
      // Validation for student (includes advisor)
      if (!username || !major || !room || !seats || !Array.isArray(seats) || !advisor) {
        await connection.end();
        return NextResponse.json({
          error: 'Missing required fields: username, major, room, seats, and advisor are required'
        }, { status: 400 });
      }
    }

    //const { username, major, room, seats } = await request.json(); //original

    // Validation: Check if required fields are present
    if (!username || !major || !room || !seats || !Array.isArray(seats) || !advisor) {
      await connection.end();
      return NextResponse.json({ 
        error: 'Missing required fields: username, major, room, seats, and advisor are required' 
      }, { status: 400 });
    }

    // Check if any seats are already occupied
     const seatIds = seats.map((s: any) => s.seat);
    const placeholders = seatIds.map(() => '?').join(',');

    // Choose table based on source
    const tableName = source === 'admin' 
      ? 'nodelogin.staff_bookings' 
      : 'nodelogin.student_bookings';
    const checkQuery = `
      SELECT seat FROM ${tableName}
      WHERE room = ? AND seat IN (${placeholders}) AND (status = 'occupied' OR status = 'pending')
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
/*
    const insertQuery = `
      INSERT INTO nodelogin.stud_reserv 
      (username, major, room, seat, date_in, date_out, period_time, admin, status, approval_token, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
 */
 if (source === 'admin') {
    const staffQuery = `
      INSERT INTO nodelogin.staff_bookings 
      (username, major, room, seat, date_in, date_out, period_time, admin, status, approval_token, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
      for (const seat of seatIds) {
        await connection.execute(staffQuery, 
          [username, major, room, seat, approvalToken]);
      }
    }else if (source === 'student') {
    const studentQuery = `
      INSERT INTO nodelogin.student_bookings
      (username, major, room, seat, date_in, date_out, period_time, advisor_name, advisor, admin, status, approval_token, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;}
    //  Insert with better error handling
    for (const seat of seats) {
      try {
        if (source === 'admin') { console.log('Inserting seat:', seat.seat); // Debug log
        await connection.execute(staffQuery, [
          username,
          major,
          room,
          seat.seat,
          seat.date_in,
          seat.date_out,
          seat.period_time,
          'x',
          'pending',
          approvalToken
        ]); } // 18 Nov 2568
        else if (source === 'student') {console.log('Inserting seat:', seat.seat); // Debug log
        await connection.execute(studentQuery, [
          username,
          major,
          room,
          seat.seat,
          seat.date_in,
          seat.date_out,
          seat.period_time,
          seat.advisor_name,
          'x',
          'x',
          'pending',
          approvalToken
        ]);}
        //console.log('Inserting seat:', seat.seat);  Debug log original
       /* original await connection.execute(insertQuery, [ 
          username,
          major,
          room,
          seat.seat,
          seat.date_in,
          seat.date_out,
          seat.period_time,
          'x',
          'pending',
          approvalToken
        ]);*/
      } catch (insertError) {
        console.error('Error inserting seat:', seat.seat, insertError);
        throw insertError; // Re-throw to be caught by outer catch
      }
    }
    await connection.end();
    // Send confirmation email if email is provided
      try {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  let approvalLink, emailTo, emailSubject, emailHtml;
/*if (source === 'admin') {
        approvalLink = `${process.env.NEXT_PUBLIC_BASE_URL}/approve?token=${approvalToken}&type=admin`;
        emailTo = `${username}@yourcompany.com`; // Admin email format
        emailSubject = 'Confirm Your Room Reservation (Staff)';
        emailHtml = `
          <h2>Staff Room Reservation</h2>
          <p>Hello ${username},</p>
          <p>Your reservation details:</p>
          <ul>
            <li>Room: ${room}</li>
            <li>Seats: ${seatIds.join(', ')}</li>
            <li>Department: ${major}</li>
          </ul>
          <p><a href="${approvalLink}">Click here to approve your reservation</a></p>
          <p>This link expires in 15 minutes.</p>
        `;
      } else if (source === 'student') {
        approvalLink = `${process.env.NEXT_PUBLIC_BASE_URL}/approve?token=${approvalToken}&type=student`;
        emailTo = `${username}@student.yourschool.edu`; // Student email format
        emailSubject = 'Confirm Your Room Reservation (Student)';
        emailHtml = `
          <h2>Student Room Reservation</h2>
          <p>Hello ${username},</p>
          <p>Your reservation details:</p>
          <ul>
            <li>Room: ${room}</li>
            <li>Seats: ${seatIds.join(', ')}</li>
            <li>Major: ${major}</li>
            <li>Advisor: ${advisor}</li>
          </ul>
          <p><a href="${approvalLink}">Click here to approve your reservation</a></p>
          <p>This link expires in 15 minutes.</p>
        `;
      }

       await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: emailTo,
        subject: emailSubject,
        html: emailHtml
      });

      console.log(`Email sent successfully to ${emailTo}`);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails - reservation is still created
    }

    return NextResponse.json({
      success: true,
      message: `Reservation created. Please check your email for approval link.`,
      approvalToken,
      expiresAt,
      userType: source
    });

  } catch (err) {
    console.error('Database error:', err);
    if (connection) {
      try {
        await connection.end();
      } catch (closeErr) {
        console.error('Error closing connection:', closeErr);
      }
    }
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
 */
  const seatDetails = seats.map((seat: any) => `
    <li style="padding: 8px 0; color: #333;">
      <strong>Seat ${seat.seat}:</strong> ${seat.date_in} to ${seat.date_out} (${seat.period_time})
    </li>
  `).join('');

  const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?token=${approvalToken}&action=confirm`;
  const rejectLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?token=${approvalToken}&action=reject`;

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
              ผม/ดิฉัน <strong>${username}</strong> ได้ทำรายการจองห้องคอมพิวเตอร์ <strong>${room}</strong> 
              ของวิทยาลัยนวัตกรรมสื่อสารสังคม ผ่านทางเว็บไซต์
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              ทั้งนี้ ใคร่ขอรบกวนให้ท่านตรวจสอบรายละเอียดการยืม และอนุมัติหรือไม่อนุมัติรายการยืมดังกล่าว โดยกดปุ่มด้านล่าง
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
               <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            
            <!-- Reject Section with Textarea -->
            <div style="background-color: #fff3f3; border: 2px solid #f44336; border-radius: 8px; padding: 25px; margin-top: 30px;">
              <h3 style="color: #f44336; margin-top: 0; font-size: 18px; margin-bottom: 15px;">
                คำขอปฏิเสธ
              </h3>
              
              <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                กรุณาระบุเหตุผลในช่องด้านล่าง 
              </p>
              
              <textarea 
                rows="4" 
                style="width: 100%; 
                       padding: 12px; 
                       border: 2px solid #ddd; 
                       border-radius: 5px; 
                       font-size: 14px; 
                       font-family: Arial, sans-serif;
                       box-sizing: border-box;
                       resize: vertical;"></textarea>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="${rejectLink}" 
                   style="background-color: #f44336; 
                          color: white; 
                          padding: 12px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-size: 16px;
                          font-weight: bold;
                          display: inline-block;
                          box-shadow: 0 4px 6px rgba(244, 67, 54, 0.3);">
                   ปฏิเสธ (REJECT)
                </a>
              </div>
            </div>
            
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              วิทยาลัยนวัตกรรมสื่อสารสังคม<br>
              ระบบจองห้องคอมพิวเตอร์
            </p>
          </div>
          
        </div>
      </body>
      </html>
    `
  });


        //    <p>Dear ${username},</p>
        //    <p>Your reservation has been confirmed:</p>
        //    <p>Room: ${room}</p>
       //     <p>Seats: ${seatIds.join(', ')}</p>
       //     <a href="${confirmLink}">View Details</a>
        console.log("Approval email sent!");
    } catch (emailError) {
      console.error('Email failed:', emailError);
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
      count: seats.length,
      status: 'pending'
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