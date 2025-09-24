'use client'
import { signOut } from 'next-auth/react';

export default function Header() {
  return (
    <header>
      <nav>
        {/* Other nav links */}
        <button onClick={() => signOut({ callbackUrl: '/auth/login_Student' })}>Logout</button>
      </nav>
    </header>
  );
}