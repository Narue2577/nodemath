// app/dashboard/page.tsx
'use client';

import AirplaneSeatBooking from "@/components/AirplaneSeatBooking";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

export default function Home2() {
  const router = useRouter();

  // This is a cleaner way to handle authentication checks.
  // It will show a loading state and automatically redirect if unauthenticated.
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, redirect to the Student login page.
      router.push('/auth/login_Student');
    },
  });

  // Show a loading state while the session is being validated
  if (status === 'loading' || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading session...</p>
      </div>
    );
  }
  
  // By this point, you are guaranteed to have a valid session.
  return (
    <>
      <div className="w-full min-h-screen m-0 font-sans bg-gray-100">
        <div className="bg-white shadow">
          {/* Note: the default session object might not have 'username' */}
          {/* You might want to use session.user?.name */}
         
        </div>
        <form>
          
        </form>
        <footer className="w-full shadow-sm bg-neutral-400 dark:bg-gray-900">
          <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
            <span className="block text-sm text-black-500 sm:text-center dark:text-black-400">
              © 2025 <a href="http://cosci.swu.ac.th/" className="hover:underline">College Of Social Communication Innovation</a>. All Rights Reserved.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}