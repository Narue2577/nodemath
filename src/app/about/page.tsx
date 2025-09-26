"use client"

import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { useSession } from "next-auth/react";



export default function About() {
    const { data: session, status } = useSession()
    
      if (status === 'loading') return <p>Loading...</p>
      if (!session) return redirect('./auth/login');
    return(
      <div className="w-full min-h-screen m-0 font-sans bg-gray-100">
	<div className="bg-white shadow">
   <Navbar profile={session.user?.username}></Navbar>
  </div>
<div className="max-w-6xl min-h-screen p-6 mx-auto bg-gray-50">
        <div className="p-4 space-y-4 md:p-5">
               <h1 className="text-3xl font-bold underline">Computer Seat Booking System</h1>
                <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    This is the built system for College Of Social Communication Innovation in 2025.  
                College Of Social Communication Innovation designed efficient, easy-to-use and robust system 
                allowed students booking the Computer seats remotely and our faculty are able to 
                respond accurately.</p>

                <p>Booking procedure with simple 5 steps:</p>
                <p>1. Registration. If you have an account, Go step 2 </p>
                <p>2. Login. Remember your password (in processing of add case of forget password)</p>
                <p>3. Select Room, Number of Seats, Seats</p>
                <p>4. Booking. Mark your start date and expired date.</p>
                <p>5. Confirm. Please submit if you complete all.</p>
                <p>P.S. Do not forget to log out</p>
                
            </div>



<footer className="w-full shadow-sm bg-neutral-400 dark:bg-gray-900">
    <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
        
        <span className="block text-sm text-black-500 sm:text-center dark:text-black-400">© 2025 <a href="http://cosci.swu.ac.th/" className="hover:underline">College Of Social Communication Innovation</a>. All Rights Reserved.</span>
    </div>
</footer>
</div>
</div>

    );
}