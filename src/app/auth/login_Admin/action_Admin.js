//app/auth/login_Admin/action_Admin.js
// First, let's add debugging to your login page

// DEBUGGING CHECKLIST:
// 1. Check if you have middleware.ts in root directory
// 2. Check next.config.js for redirect rules
// 3. Check if you have any useEffect with redirects in _app.tsx or layout.tsx
// 4. Check your server action again - make sure NO redirect() is called

// Temporary debugging server action
"use server";

import mysql from 'mysql2/promise';

export const loginAdmin = async (prevState, formData) => {
  console.log('loginAdmin server action called');
  
  const rawData = {
    buasri: formData.get("buasri"),
  };

  console.log('Form data received:', rawData);

  if (!rawData.buasri) {
    console.log('No buasri provided');
    return { message: "Please fill all fields.", success: false };
  }

  try {
    console.log('Attempting database connection');
    
    const connection = await mysql.createConnection({
      host: '10.1.140.57',
      user: 'cosciadministrator', 
      password: 'Cosci!_2021',
      database: 'cosci_system'
    });

    const [users] = await connection.execute(
      'SELECT staff_buasri FROM staff WHERE staff_buasri = ?',
      [rawData.buasri]
    );

    await connection.end();
    console.log('Database query completed, users found:', users.length);

    if (users.length === 0) {
      console.log('No user found with this Buasri ID');
      return { message: "Invalid Buasri ID.", success: false };
    }

    console.log('Login successful, returning success state');
    // NO REDIRECT HERE - this should return success
    return { 
      message: "Login successful!", 
      success: true,
      user: { buasri: rawData.buasri }
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { message: "Login failed. Please try again.", success: false };
  }
};