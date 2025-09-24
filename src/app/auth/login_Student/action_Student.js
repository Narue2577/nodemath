//app/auth/login_Student/action_Student.js
"use server";

import mysql from 'mysql2/promise';
import { redirect } from 'next/navigation';

export const loginStudent = async (prevState, formData) => {
  const rawData = {
    buasri: formData.get("buasri"),
  };

  if (!rawData.buasri) {
    return { message: "Please fill all fields.", success: false };
  }
  try {

    const connection = await mysql.createConnection({
            host: '10.1.140.57',
            user: 'cosciadministrator',
            password: 'Cosci!_2021',
            database: 'cosci_system'
        });
     const [users] = await connection.execute(
      'SELECT stu_buasri FROM student WHERE stu_buasri = ?',
      [rawData.buasri]
    );

    await connection.end();

    if (users.length === 0) {
      return { message: "Invalid Buasri ID.", success: false };
    }

    // If login successful, redirect will happen after this return
    // Note: redirect() will throw and prevent the return from executing
  } catch (error) {
    console.error('Login error:', error);
    return { message: "Login failed. Please try again.", success: false };
  }

  // Only redirect if validation passes and user exists
  redirect('/dashboard');
};