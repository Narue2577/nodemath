'use client'
/* eslint-disable */
import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";

// submit form action
//async function submitForm(prevState, formData) {
 // await new Promise((resolve) => setTimeout(resolve, 1500));
//  const email = formData.get("email");
//  if (!email || !email.includes("@")) {
//    return { success: false, message: "Please enter a valid email address." };
//  }
//  return { success: true, message: "Form submitted successfully!" };
//}


export default function LoginStudentPage() {
 // const [state, formAction, isPending] = useActionState(submitForm, {
  //  success: null,
  //  message: "",
 // });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const buasri = (e.target as any).buasri.value;


    // Add logic to register the user (e.g., save to database)
    alert('Login successful!');
  };
const [buasri, setBuasri] = useState('');
    const [message, setMessage] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [state, Isstate] = useState(false);

    const initialState = {
    success: false,
    message: "",
  };

  


  return (
    //<form onSubmit={handleSubmit}>
    //  <input name="name" placeholder="Name" />
    //  <input name="email" placeholder="Email" />
    //  <input name="password" type="password" placeholder="Password" />
    //  <button type="submit">Register</button>
   //</form>
   <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">　
                <div className="relative flex flex-col items-center justify-center w-full">
                    <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
                </div>
                <h2 className="mb-6 text-2xl font-semibold text-center">Registration</h2>
                <h2 className="mb-6 text-2xl font-semibold text-center">College of Social Communication Innovation</h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-600">
                            Buasri ID
                        </label>
                        <input
                            type="text"
                            value={buasri}
                            onChange={(e) => setBuasri(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Buasri ID"
                            name="buasri"
                            required
                        />
                    </div>
                    
                    <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              name="password"
              required
            />
            <Link href="/forget-password" className="grid pt-2 ml-4 text-left text-red-600 justify-items-start hover:text-red-300">
            Forget your password?
          </Link>
          </div>

                    <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? 'Registering...' : 'Register'}
            </button>
          
          </div>

                    <Link href="/auth/policy" className="grid px-4 py-2 text-center text-white bg-indigo-500 rounded-md hover:bg-indigo-600 justify-items-center hover:text-indigo-800">
                        Login
                    </Link>
                </form>
            </div>
        </div>
  );
}