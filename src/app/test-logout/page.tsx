// app/test-logout/page.tsx
'use client'
import { signOut } from 'next-auth/react'

export default function TestLogout() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/auth/register' })}>
      Logout (Test)
    </button>
  )
}
