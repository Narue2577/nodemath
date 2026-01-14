

import { NextResponse } from 'next/server'

import mysql from  'mysql2/promise';

// define and export the GET handler function
/* eslint-disable */

export async function GET(request: Request) {
  try {
    // 2. connect to database

     const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME2,
    });
    // 3. create a query to fetch data

    let get_exp_query = ''

    get_exp_query =  'SELECT staff_id AS id, staff_buasri AS buasri, "teacher" AS role, staff_name AS name, staff_password AS password,staff_position AS field FROM staff WHERE staff_buasri !="NULL" UNION SELECT stu_id, stu_buasri, "student" AS role,stu_name , stu_password AS password,stu_major AS field FROM student'
/*SELECT buasri FROM (SELECT staff_buasri AS buasri FROM staff UNION SELECT stu_buasri AS buasri FROM student) AS combined WHERE buasri LIKE "co%";  AND staff_buasri NOT LIKE "co%" */
/*SELECT staff_buasri AS buasri FROM staff WHERE staff_buasri REGEXP '^co[0-9]+$'
UNION
SELECT stu_buasri AS buasri FROM student WHERE stu_buasri REGEXP '^co[0-9]+$'; */
    // we can use this array to pass parameters to the SQL query

    let values: any[] = []

    // 4. exec the query and retrieve the results

    const [results] = await connection.execute(get_exp_query, values)

    // 5. close the connection when done

    connection.end()

    // return the results as a JSON API response

    return NextResponse.json(results)
  } catch (err) {
    console.log('ERROR: API - ', (err as Error).message)

    const response = {
      error: (err as Error).message,

      returnedStatus: 200,
    }

    return NextResponse.json(response, { status: 200 })
  }
}