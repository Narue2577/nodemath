//app/auth/login_Student/page.tsx
'use client'

import Link from "next/link";
import { useActionState } from 'react';
import Image from "next/image";
import { loginStudent } from './action_Student';

export default function LoginStudentPage() {
  const [state, formAction, isPending] = useActionState(loginStudent, null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <div className="flex mt-6 gap-[230px] space-x-4">
          <Link href="/auth/login_Student" className="px-4 py-2 text-white transition duration-300 bg-red-500 rounded hover:bg-red-200">Student</Link>
          <Link href="/auth/login_Admin" className="px-4 py-2 text-white transition duration-300 bg-gray-500 rounded hover:bg-gray-200">Faculty/Staff</Link>
        </div>

        <div className="relative flex flex-col items-center justify-center w-full">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>
        
        <h2 className="mb-6 text-2xl font-semibold text-center">Login (Student)</h2>
        <h2 className="mb-6 text-2xl font-semibold text-center">College of Social Communication Innovation</h2>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Buasri ID
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Buasri ID"
              name="buasri"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? 'Logging in...' : 'Login'}
            </button>
            {state?.message && (
              <p className={`mt-2 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                {state.message}
              </p>
            )}
          </div>

          <Link href="/auth/register" className="grid px-4 py-2 text-center text-white bg-indigo-500 rounded-md hover:bg-indigo-600 justify-items-center hover:text-indigo-800">
            Register
          </Link>
        </form>
      </div>
    </div>
  );
}


//<form onSubmit={handleSubmit}>
    //  <input name="name" placeholder="Name" />
    //  <input name="email" placeholder="Email" />
    //  <input name="password" type="password" placeholder="Password" />
    //  <button type="submit">Register</button>
   //</form>