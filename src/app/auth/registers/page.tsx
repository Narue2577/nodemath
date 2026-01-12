//app/auth/registers/page.tsx
'use client'
/* eslint-disable */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [buasri, setBuasri] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentbuasriId, setStudentbuasriId] = useState(''); 
  const [staffId, setStaffId] = useState('');     
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | null>(null);

  // Password validation
  const passwordValidation = {
    length: password.length >= 8 && password.length <= 15,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(v => v);

  // Handle role change
  const handleRoleChange = (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole);
    setBuasri('');
    setStudentId('');
    setFullName('');
    setMajor('');
    setAdvisor('');
    setPosition('');
    setEmail('');
    setPhone('');
    setUserData(null);
    setUsernameStatus(null);
    setMessage('');
    setError('');
  };

  // Check username availability with debounce
  const checkUsername = async (usernameValue: string) => {
    if (!usernameValue.trim() || usernameValue.length < 3) {
      setUsernameStatus(null);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameStatus(null);
    setError('');

    try {
      const response = await fetch('/api/check-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          buasri: usernameValue,
          role: role 
        })
      });

      const data = await response.json();

      if (data.exists) {
        setUsernameStatus('taken');
        setUserData(data.userData);
        
        // Auto-fill form fields from database
        if (role === 'student') {
          setFullName(data.userData.stu_name || '');
          setStudentbuasriId(data.userData.stu_buasri || '');
          setPhone(data.userData.stu_phone || '');
          setMajor(data.userData.maj_th_name || '');
          setAdvisor(data.userData.staff_name || '');
        } else {
          setStaffId(data.userData.staff_id || '' );
          setFullName(data.userData.staff_name || '' );
          setEmail(data.userData.staff_email || '');
          setPhone(data.userData.staff_phone || '');
          setPosition(data.userData.staff_position || '');
        }
      } else {
        setUsernameStatus('available');
        setUserData(null);
       // setError('This ID was not found in the database');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setMessage('Error checking ID availability');
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Handle username input with debounce
  const handleUsernameChange = (value: string) => {
    if (role === 'student') {
      setStudentId(value);
    } else {
      setBuasri(value);
    }
    setUsernameStatus(null);
    setError('');
    
    // Clear previous timeout
    if ((window as any).usernameTimeout) {
      clearTimeout((window as any).usernameTimeout);
    }

    // Set new timeout to check after user stops typing
    (window as any).usernameTimeout = setTimeout(() => {
      checkUsername(value);
    }, 500);
  };

  // Handle step 1 submit
  const handleRegisterClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const currentId = role === 'student' ? studentId : buasri;

    if (!currentId.trim()) {
      setError('Please enter your ID');
      return;
    }

    if (currentId.length < 3) {
      setError('ID must be at least 3 characters');
      return;
    }

    if (usernameStatus === 'available') {
      setError('This ID was not found in the database');
      return;
    }

    if (usernameStatus !== 'taken') {
      setError('Please wait while we verify your ID');
      return;
    }

    setStep(2);
  };

  // Handle final registration submit
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid) {
      setError('Password does not meet all requirements');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsPending(true);

    try {
      // TODO: Call your registration API here
      const registrationData = {
        role,
        id: role === 'student' ? studentId : staffId,
        buasri: role === 'student' ? studentbuasriId : buasri,
        password,
        fullName,
        email,
        phone,
        
        ...(role === 'student' ? { major, advisor } : { position })
      };

      // Example API call:
      const response = await fetch('/api/auth/register', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(registrationData)
       });
       const result = await response.json();
if (!response.ok) {
      // Handle error response
      setError(result.message || 'Registration failed. Please try again.');
      return;
    }

    // Success - show message and redirect
    alert('Registration successful! Redirecting to login...');
    
    // Redirect to login page
    router.push('/auth/login');

    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  const currentId = role === 'student' ? studentId : buasri;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Privacy Policy Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="relative w-full max-w-4xl p-8 mx-4 bg-white rounded-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute text-gray-400 transition-colors duration-200 top-4 right-4 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="p-4">
                <h2 className="mb-6 text-5xl font-bold">นโยบายการคุ้มครองข้อมูลส่วนบุคคล</h2>
                <h2 className="mb-6 text-5xl font-bold">(Privacy Policy)</h2>
              </div>
              <div className="p-2 text-left">
                <h5 className="mb-4">
                  เราเคารพสิทธิความเป็นส่วนตัวและความปลอดภัยของข้อมูลส่วนบุคคลของท่าน ขณะที่ท่านเข้าใช้บริการเว็บไซต์นี้ เราจะจัดการ ควบคุม และรักษาข้อมูลของท่านอย่างเหมาะสม เพื่อให้ท่านมั่นใจได้ว่าข้อมูลส่วนบุคคลที่ท่านให้ไว้จะถูกนำไปใช้ตรงตามวัตถุประสงค์และถูกต้องตามกฎหมาย
                </h5>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-left">1. การเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล</h3>
                  <ul className="list-disc ml-5 space-y-1 text-left">
                    <li>ข้อมูลที่บ่งชี้ตัวตน ได้แก่ ชื่อ-นามสกุล, ตำแหน่งงาน</li>
                    <li>ข้อมูลการติดต่อ ได้แก่ หมายเลขโทรศัพท์, อีเมล</li>
                    <li>ข้อมูลการเข้าใช้งานเว็บไซต์ ได้แก่ ประวัติการเข้าใช้งาน, ชื่อผู้ใช้</li>
                  </ul>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-left">2. ช่องทางการรับข้อมูลส่วนบุคคลของท่าน</h3>
                  <ul className="list-disc ml-5 space-y-1 text-left">
                    <li>เราได้รับข้อมูลส่วนบุคคลของท่านจากมหาวิทยาลัย</li>
                    <li>เราได้รับข้อมูลส่วนบุคคลจากท่านโดยตรงจากการที่ท่านเข้าใช้บริการ</li>
                  </ul>
                </div>
                <div className="pb-8">
                  <h5>ท่านสามารถดูรายละเอียดเพิ่มเติมได้ที่ <a href="https://pdpa.swu.ac.th/" className="text-indigo-600 hover:underline">pdpa.swu.ac.th</a></h5>
                  <h5>ระบบจองห้องเรียนและที่นั่งคอมพิวเตอร์ วิทยาลัยนวัตกรรมสื่อสารสังคม มหาวิทยาลัยศรีนครินทรวิโรฒ</h5>
                </div>
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

        {/* Role Selection Buttons */}
        <div className="flex gap-4 mb-6">
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

        {/* Step 1: ID Input with Verification */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                {role === 'student' ? 'Student ID' : 'Buasri ID'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={currentId}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Enter your ${role === 'student' ? 'student' : 'Buasri'} ID`}
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                {!isCheckingUsername && usernameStatus === 'taken' && (
                  <Check size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
                {!isCheckingUsername && usernameStatus === 'available' && (
                  <X size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />
                )}
              </div>

              {/* ID Status Messages */}
              {currentId.length > 0 && currentId.length < 3 && (
                <p className="mt-2 text-sm text-gray-600">ID must be at least 3 characters</p>
              )}
             
              {usernameStatus === 'available' && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X size={16} /> This ID was not found in the database
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-blue-600">{message}</p>}

            <button
              onClick={handleRegisterClick}
              disabled={!currentId || usernameStatus !== 'taken'}
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              Register
            </button>
          </div>
        )}

        {/* Step 2: Complete Registration Form */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">Registration Form</h2>
              
            </div>

            {role === 'student' ? (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Student Buasri
                  </label>
                  <input
                    type="text"
                    value={studentbuasriId}
                    onChange={(e) => setStudentbuasriId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
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
                    Major
                  </label>
                  <input
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your major"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Advisor
                  </label>
                  <input
                    type="text"
                    value={advisor}
                    onChange={(e) => setAdvisor(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your advisor name"
                  />
                </div>

                    {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.length ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.length ? 'text-green-700' : 'text-gray-600'}>
                      8-15 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.uppercase ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.uppercase ? 'text-green-700' : 'text-gray-600'}>
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.lowercase ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.lowercase ? 'text-green-700' : 'text-gray-600'}>
                      At least one lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.number ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.number ? 'text-green-700' : 'text-gray-600'}>
                      At least one number
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-red-600">Passwords do not match</span>
                </div>
              )}
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Check size={16} className="text-green-500" />
                  <span className="text-green-700">Passwords match</span>
                </div>
              )}
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
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-600">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>
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

                {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.length ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.length ? 'text-green-700' : 'text-gray-600'}>
                      8-15 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.uppercase ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.uppercase ? 'text-green-700' : 'text-gray-600'}>
                      At least one uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.lowercase ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.lowercase ? 'text-green-700' : 'text-gray-600'}>
                      At least one lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {passwordValidation.number ? (
                      <Check size={16} className="text-green-500" />
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                    <span className={passwordValidation.number ? 'text-green-700' : 'text-gray-600'}>
                      At least one number
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <X size={16} className="text-red-500" />
                  <span className="text-red-600">Passwords do not match</span>
                </div>
              )}
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Check size={16} className="text-green-500" />
                  <span className="text-green-700">Passwords match</span>
                </div>
              )}
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
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            )}

            

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
                disabled={isPending || !isPasswordValid || !password || !confirmPassword || password !== confirmPassword}
              >
                {isPending ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        )}

        {/* Login Link */}
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            Already have an account? Login
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
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}