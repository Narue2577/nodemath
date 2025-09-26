'use client';


import { useSession} from "next-auth/react";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";

export default function DashAdmin() {
    const { data: session, status } = useSession();


    if (status === 'loading') return <p>Loading...</p>;
    if (!session) return redirect('./auth/login');

    return (
        <>
            <div className="w-full min-h-screen m-0 font-sans bg-gray-100">
                <div className="bg-white shadow">
                    <Navbar profile={session.user?.username}></Navbar>
                </div>
               <form>
                Faculty/Staff
                
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