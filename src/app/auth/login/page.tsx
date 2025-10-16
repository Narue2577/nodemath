'use client'
/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

export default function LoginPage() {
  const [buasri, setBuasri] = useState('');
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState('');
  const [enName, setEnName] = useState('');
  const [major, setMajor] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [buasriRegistered, setBuasriRegistered] = useState(false);
  const router = useRouter();
  
  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setRole(newRole);
    // Clear all fields when switching roles
    setBuasri('');
    setFullName('');
    setEnName('');
    setMajor('');
    setPosition('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShow(false);
    setBuasriRegistered(false);
  };

  // Check if the name is already registered
  const checkIfNameExists = async (buasriValue: string, currentRole: string) => {
    if (!buasriValue || buasriValue.trim().length < 3) {
      setBuasriRegistered(false);
      setFullName('');
      return;
    }

    try {
      const response = await fetch('/api/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buasri: buasriValue, role: currentRole }),
      });
      const data = await response.json();
      
      setBuasriRegistered(data.exists);
      
      if (data.exists && data.userData) {
        // Get the name field from database
        const name = currentRole === 'student' 
          ? data.userData.stu_name 
          : data.userData.staff_name;
         const password = currentRole === 'student' 
          ? data.userData.stu_password 
          : data.userData.staff_password;
        const position = data.userData.staff_position;
        const email = data.userData.staff_email;
        const phone = data.userData.staff_phone;
        const enName = data.userData.stu_eng_name;
        const major = data.userData.stu_major;
        setFullName(name);
        setPassword(password);
        setPosition(position ||'');
        setEmail(email ||'');
        setPhone(phone || '');
        setEnName(enName||'');
        setMajor(major);
      } else {
        setFullName('');
        setPassword('');
        setPosition('');
        setEmail('');
        setPhone('');
        setEnName('');
        setMajor('');
      }
    } catch (error) {
      console.error('Error checking name:', error);
      setBuasriRegistered(false);
      setFullName('');
    }
  };

  // Handle Buasri ID change
  const handleBuasriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBuasri(value);
    
    // Show additional fields when Buasri ID has at least 3 characters
    if (value.trim().length >= 3) {
      setShow(true);
    } else {
      setShow(false);
      setBuasriRegistered(false);
      setFullName('');
    }
  };

  // Debounced fetch with useEffect
  useEffect(() => {
    if (buasri && buasri.trim().length >= 3) {
      const timer = setTimeout(() => {
        checkIfNameExists(buasri, role);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timer);
    } else {
      setBuasriRegistered(false);
      setFullName('');
    }
  }, [buasri, role]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsPending(true);
  
  // Validate required fields
  if (!buasri || !password) {
    setError('Please enter your Buasri ID and password');
    setIsPending(false);
    return;
  }
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        role, 
        buasri, 
        fullName, 
        email, 
        password, 
        position, 
        phone, 
        enName, 
        major 
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login successful
      if (role === "student") {
        router.push("/dashboard/student");
      } else if (role === "teacher") {
        router.push("/dashboard/admin");
      }
    } else {
      // Login failed - show error message
      setError(data.message || "Login failed");
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Failed to connect to server');
  //} finally {
    setIsPending(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center w-full mb-6">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {role === 'student' ? 'Student Login' : 'Faculty/Staff Login'}
        </h1>
        <h2 className="mb-8 text-xl text-center text-gray-600">
          College of Social Communication Innovation
        </h2>

        {/* Login Form */}
        <div className="space-y-6">
         

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Buasri ID
            </label>
            <input
              type="text"
              value={buasri}
              onChange={handleBuasriChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 "
              placeholder="Enter your Buasri ID"
            />
            {buasriRegistered && buasri && (
              <p className="mt-1 text-sm text-green-600">✓ This ID is registered</p>
            )}
            {!buasriRegistered && buasri && buasri.trim().length >= 3 && (
              <p className="mt-1 text-sm text-red-600">✗ This ID is not found</p>
            )}
          </div>
          
           {/* Role Selection Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`w-full px-4 py-2 rounded-md transition duration-300 ${
                role === 'student'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`w-full px-4 py-2 rounded-md transition duration-300 ${
                role === 'teacher'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Faculty/Staff
            </button>
          </div>

          {/*show for student*/}
          {show && role === "student" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  English Name
                </label>
                <input
                  type="text"
                  value={enName}
                  onChange={(e) => setEnName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your english name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Major
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your major code i.e. 001"
                />
              </div>
            </div>
          )}

          {/*show for teacher*/}
          {show && role === "teacher" && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your position"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your phone"
                />
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <Link href="/auth/register" className="grid text-center text-indigo-600 justify-items-center hover:text-indigo-800">
            Register
          </Link>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
          input:focus {
            box-shadow: none !important;
            outline: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}

/*Removed duplicate fetch calls - You had 3 places fetching data (onChange, onBlur, useEffect). Now only useEffect does it.
Removed onBlur handler - Not needed anymore since useEffect handles the debounced fetch.
Removed previousRole ref - Not needed with the simplified approach.
handleRoleChange now clears ALL fields - When you switch between Student/Faculty, everything resets to empty.
Cleaned up checkIfNameExists - Now it properly handles the role parameter and clears data when ID is too short.
useEffect with debounce - Waits 500ms after you stop typing, then fetches data. This prevents multiple API calls. */