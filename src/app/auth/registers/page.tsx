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
  // ============ NEW: Pop-up state ============
  const [showPopup, setShowPopup] = useState(true);
  // ===========================================
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
    if (value.trim().length >= 5) {
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
    // Step 1: Register/Update user in database
    const registerResponse = await fetch('/api/login', {
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

    const registerData = await registerResponse.json();

    if (!registerResponse.ok) {
      setError(registerData.message || 'Registration/Update failed');
      setIsPending(false);
      return;
    }

    // Step 2: Authenticate with NextAuth
    const result = await signIn('credentials', {
      buasri,
      role,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials. Please try again.');
      setIsPending(false);
      return;
    }

    // Step 3: Wait for session to update
    await new Promise(resolve => setTimeout(resolve, 100));

    // Step 4: Get session and redirect
    const session = await getSession();
    console.log('Session after login:', session);

    if (session?.user) {
      const userRole = (session.user as any).role;

      if (userRole === 'teacher') {
        router.push('/dashboard/admin');
      } else if (userRole === 'student') {
        router.push('/dashboard/student');
      } else {
        setError('User role not found. Please contact administrator.');
        setIsPending(false);
      }
    } else {
      setError('Failed to retrieve session. Please try again.');
      setIsPending(false);
    }
  } catch (error) {
    setError('An error occurred during login.');
    console.error('Register error:', error);
    setIsPending(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* ============ NEW: Welcome Pop-up Modal ============ */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="relative w-full max-w-4xl p-8 mx-4 bg-white rounded-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowPopup(false)}
              className="absolute text-gray-400 transition-colors duration-200 top-4 right-4 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Pop-up Content */}
            <div className="text-center">
              <div className="p-4 ">
                <h2 className="mb-6 text-5xl font-bold font-weight: 700; text-center">นโยบายการคุ้มครองข้อมูลส่วนบุคคล </h2>
                <h2 className="mb-6 text-5xl font-bold font-weight: 700; text-center">(Privacy Policy)</h2>
              </div>
              <div className="p-2">
        <h5 className="mb-4">
        เราเคารพสิทธิความเป็นส่วนตัวและความปลอดภัยของข้อมูลส่วนบุคคลของท่าน ขณะที่ท่านเข้าใช้บริการเว็บไซต์นี้ เราจะจัดการ ควบคุม และรักษาข้อมูลของท่านอย่างเหมาะสม เพื่อให้ท่านมั่นใจได้ว่าข้อมูลส่วนบุคคลที่ท่านให้ไว้จะถูกนำไปใช้ตรงตามวัตถุประสงค์และถูกต้องตามกฎหมาย
      </h5>
        <ol >
        {/* 1. การเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล */}
      <div className="mb-6">
        <h3  className="text-xl font-bold mb-2 text-left">1. การเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล</h3>
        <ul className="list-disc ml-5 space-y-1 text-left">
          <li>ข้อมูลที่บ่งชี้ตัวตน ได้แก่ ชื่อ-นามสกุล, ตำแหน่งงาน</li>
          <li>ข้อมูลการติดต่อ ได้แก่ หมายเลขโทรศัพท์, อีเมล</li>
          <li>ข้อมูลการเข้าใช้งานเว็บไซต์ ได้แก่ ประวัติการเข้าใช้งาน, ชื่อผู้ใช้, ชนิดของบราว์เซอร์, ประวัติการทำรายการ, Cookies หรือ Session</li>
        </ul>
      </div>
        {/* 2. ช่องทางการรับข้อมูลส่วนบุคคลของท่าน */}
      <div className="mb-6">
        <h3  className="text-xl font-bold mb-2 text-left">2. ช่องทางการรับข้อมูลส่วนบุคคลของท่าน</h3>
        <ul className="list-disc ml-5 space-y-1 text-left">
          <li>เราได้รับข้อมูลส่วนบุคคลของท่านจากมหาวิทยาลัย ซึ่งมหาวิทยาลัยได้เก็บรวบรวมไว้</li>
          <li>เราได้รับข้อมูลส่วนบุคคลจากท่านโดยตรง จากการที่ท่านเข้าใช้บริการ ติดต่อ เยี่ยมชม ค้นหา ผ่านทางเว็บไซต์ อีเมล การติดต่อเจ้าหน้าที่หรือบุคลากรที่ดูแล รวมถึงช่องทางการสื่อสารอื่นๆ</li>
        </ul>
      </div>
        {/* 3. วัตถุประสงค์ของการเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล */}
      <div className="mb-6">
        <h3  className="text-xl font-bold mb-2 text-left">3. วัตถุประสงค์ของการเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล</h3>
        <p className="mb-2">
          เพื่อประโยชน์ของท่านในการใช้บริการเว็บไซต์ เราจะจัดเก็บรวบรวมข้อมูลส่วนบุคคลของท่านตามระยะเวลาเท่าที่จำเป็นต่อวัตถุประสงค์ โดยวัตถุประสงค์ของการจัดเก็บข้อมูลส่วนบุคคล มีดังนี้
        </p>
        <ul className="list-disc ml-5 space-y-1 text-left">
          <li>เพื่อยืนยันตัวตนของท่าน</li>
          <li>เพื่อป้องกัน ตรวจสอบ รายการต่างๆ ที่อาจจะเกิดอาชญากรรมทางคอมพิวเตอร์และการฉ้อโกง</li>
          <li>เพื่อวิเคราะห์ ทบทวน พัฒนา และปรับปรุงการให้บริการ</li>
          <li>เพื่อการประมวลข้อมูล การทำสถิติ ศึกษาและวิเคราะห์ข้อมูล</li>
          <li>เพื่อใช้ในการติดต่อและสอบถามข้อมูลเพิ่มเติม</li>
          <li>เพื่อใช้ในการบันทึกรายการต่างๆ ในเว็บไซต์</li>
        </ul>
      </div>
        {/* 4. ระยะเวลาในการจัดเก็บข้อมูล */}
      <div className="mb-6">
        <h3  className="text-xl font-bold mb-2 text-left">4. ระยะเวลาในการจัดเก็บข้อมูล</h3>
        <p>
          เราจะดำเนินการจัดเก็บข้อมูลส่วนบุคคลของท่านตลอดระยะเวลาที่ท่านยังปฏิบัติหน้าที่อยู่ในวิทยาลัยฯ แต่เราอาจจะยังคงเก็บข้อมูลส่วนบุคคลของท่านต่อไปหากเห็นว่ายังมีความจำเป็นหรือตามที่กฎหมายกำหนด
        </p>
      </div>
        {/* 5. สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่าน */}
      <div className="mb-6">
        <h3  className="text-xl font-bold mb-2 text-left">5. สิทธิเกี่ยวกับข้อมูลส่วนบุคคลของท่าน</h3>
        <ul className="list-disc ml-5 space-y-1 text-left">
          <li>ท่านมีสิทธิเข้าถึงข้อมูล และขอรับสำเนาข้อมูลข้อมูลส่วนบุคคลของท่าน</li>
          <li>ท่านมีสิทธิในการแก้ไขข้อมูลที่เราเก็บรวบรวมไว้ ให้ถูกต้อง สมบูรณ์และเป็นปัจจุบัน</li>
          <li>ท่านมีสิทธิขอให้เราแก้ไขข้อมูลที่ไม่ถูกต้อง หรือเพิ่มเติมข้อมูลที่ไม่สมบูรณ์ได้ และอาจขอให้เราลบ หรือเปิดเผยแหล่งที่มาของข้อมูลของท่านในกรณีที่ไม่ได้ให้ความยินยอมได้</li>
          <li>ท่านมีสิทธิคัดค้าน หรือระงับการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลบางประการของท่านได้</li>
          <li>ท่านมีสิทธิในการเพิกถอนความยินยอมในการประมวลผลข้อมูลส่วนบุคคลได้ตลอดระยะเวลาที่ข้อมูลส่วนบุคคลของท่านอยู่กับเรา เว้นแต่มีข้อจำกัดสิทธิในการเพิกถอนความยินยอมโดยกฎหมาย อย่างไรก็ตาม การที่ท่านเพิกถอนความยินยอมในการประมวลผลข้อมูลส่วนบุคคล อาจส่งผลให้เรามีข้อมูลไม่เพียงพอต่อการประมวลผลให้บรรลุวัตถุประสงค์ตามที่ได้แจ้ง และท่านอาจขาดความสะดวกในการได้รับบริการจากเรา</li>
        </ul>
      </div>
      </ol>
       </div>
       <div className="pb-8" >
        <h5>ท่านสามารถดูรายละเอียดเพิ่มเติมเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคลของมหาวิทยาลัยศรีนครินทรวิโรฒ ได้ที่ <Link href="https://pdpa.swu.ac.th/">pdpa.swu.ac.th</Link></h5>
        <h5>ระบบจองห้องเรียนและที่นั่งคอมพิวเตอร์ วิทยาลัยนวัตกรรมสื่อสารสังคม มหาวิทยาลัยศรีนครินทรวิโรฒ</h5>
       </div> 
              <button
                onClick={() => setShowPopup(false)}
                className="w-full px-6 py-3 text-white transition duration-300 bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
               ทราบครับ
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================================================== */}

      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center w-full mb-6">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {role === 'student' ? 'Student Register' : 'Faculty/Staff Register'}
        </h1>
        <h2 className="mb-8 text-xl text-center text-gray-600">
          College of Social Communication Innovation
        </h2>

        {/* Register Form */}
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
              <p className="mt-1 text-sm text-red-600">✗This ID is already registered. Please login</p>
            ) 
            }
            {!buasriRegistered && buasri && buasri.trim().length >= 3 && (
              <p className="mt-1 text-sm text-green-600">✓ Please fill your personal information. </p>
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
          {show && !buasriRegistered && role === "student" && (
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
          {show && !buasriRegistered && role === "teacher" && (
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

          {/* Register Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Storing...' : 'Register'}
          </button>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="grid text-center text-indigo-600 justify-items-center hover:text-indigo-800">
            Login
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
          /* ============ NEW: Pop-up animations ============ */
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slideUp 0.4s ease-out;
          }
          /* ============================================== */
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