'use client'
import { signOut } from 'next-auth/react';

export default function ProfilePage() {
  return (
    <div>
      <h1>Your Profile</h1>
      {/* Other profile content */}
      <button onClick={() => signOut({ callbackUrl: '/auth/login' })}>Logout</button>
    </div>
  );
}