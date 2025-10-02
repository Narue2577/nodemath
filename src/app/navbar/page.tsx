//app/navbar/page.tsx
'use client';
/* eslint-disable */
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

interface NavbarProps {
  profile?: string;
}

export default function Navbar({ profile }: NavbarProps) {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  console.log("Navbar Session:", session); // Debugging
  
  // Get user role to determine correct dashboard link
  const userRole = (session?.user as any)?.role;
  const dashboardLink = userRole === 'teacher' ? '/dashboard/admin' : '/dashboard/student';
  
  return (
    <>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between py-4">
          <div>
            <Image
              src="/logo-cosci.png"
              width={100}
              height={100}
              alt="SWU Logo"
            />
          </div>
          <div className="hidden sm:flex sm:items-center">
            {/* ✅ FIXED: Dynamic dashboard link based on role */}
            <a href={dashboardLink} className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600">
              {session?.user?.name || 'Username'}
            </a>
            <a href="/about" className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600">About</a>
            <a href="/request" className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600">Cancellations</a>
           
           <a 
              href="#"
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600"
            >
              Logout
            </a>
          </div>
        </div>
        
        <div className="block py-2 bg-white border-t-2 sm:hidden">
          <div className="flex flex-col">
            {/* ✅ FIXED: Dynamic dashboard link for mobile */}
            <a href={dashboardLink} className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600">
              {session?.user?.name || profile || 'Username'}
            </a>
            <a href="/about" className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600">About</a>
            <a href="/request" className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600">Request</a>

            < a
              href="#"
              onClick={() => signOut({ callbackUrl: '/auth/register' })}
              className="mr-4 text-sm font-semibold text-gray-800 hover:text-purple-600"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </>
  );
}