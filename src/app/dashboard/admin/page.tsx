//app/dashboard/admin/page.tsx
'use client';

import { useSession} from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/app/navbar/page";
import AirplaneSeatBookingAdmin from "@/components/AirplaneSeatBookingAdmin";
import { useEffect } from "react";

export default function Home2() {
    const { data: session, status } = useSession();

    // Add role-based redirect
    useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const userRole = (session.user as any).role;
            
            // If not a teacher, redirect to student dashboard
            if (userRole === 'student') {
                redirect('/dashboard/student');
            }
        }
    }, [status, session]);

    if (status === 'loading') return <p>Loading...</p>;
    if (!session) return redirect('/auth/login');
    
    // Additional check: only teachers can access this page
    const userRole = (session.user as any).role;
    if (userRole !== 'teacher') {
        return redirect('/dashboard/student');
    }

    return (
        <>
            <div className="w-full min-h-screen m-0 font-sans bg-gray-100">
                <div className="bg-white shadow">
                    <Navbar profile={session.user?.username}></Navbar>
                </div>
               <form>
                {/* Form is handled internally by  AirplaneSeatBooking */}
                <AirplaneSeatBookingAdmin tableHeader={session.user?.username} />
               </form>
                <footer className="w-full shadow-sm bg-neutral-400 dark:bg-gray-900">
                    <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
                        <span className="block text-sm text-black-500 sm:text-center dark:text-black-400">© 2025 <a href="http://cosci.swu.ac.th/" className="hover:underline">College Of Social Communication Innovation</a>. All Rights Reserved.</span>
                    </div>
                </footer>
            </div>
        </>
    );
}