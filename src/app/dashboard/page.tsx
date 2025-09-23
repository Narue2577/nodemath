'use client'
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Other dashboard content */}
      <button onClick={() => signOut({ callbackUrl: '/auth/login' })}>Logout</button>
    </div>
  );
}