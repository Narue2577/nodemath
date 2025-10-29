'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "../navbar/page";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    major: "",
  });
  const [student, setStudent] = useState({
    name: "",
    enName: "",
    group: "",
    advisor: "",
    major: "",
  });
  
  // Check if the user exists in database
  const checkUserData = async (userName: string, userRole: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buasri: userName, role: userRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const data = await response.json();
      
      setIsRegistered(data.exists);
      
      if (data.exists && data.userData) {
        if (userRole === 'student') {
          setStudent({
            name: data.userData.stu_name || '',
            enName: data.userData.stu_eng_name || '',
            group: data.userData.stu_group || '',
            advisor: data.userData.stu_advisor || '',
            major: data.userData.stu_major || '',
          });
        } else if (userRole === 'teacher') {
          setStaff({
            name: data.userData.staff_name || '',
            position: data.userData.staff_position || '',
            email: data.userData.staff_email || '',
            phone: data.userData.staff_phone || '',
            major: data.userData.staff_major || '',
          });
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setIsRegistered(false);
      alert('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudentField = (field: string, value: string) => {
    setStudent((prev) => ({ ...prev, [field]: value }));
  };

  const updateStaffField = (field: string, value: string) => {
    setStaff((prev) => ({ ...prev, [field]: value }));
  };

  // Load user data when component mounts
  useEffect(() => {
    if (session?.user?.name && session?.user?.role) {
      checkUserData(session.user.name, session.user.role);
    }
  }, [session?.user?.role, session?.user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = session?.user?.role === 'student' 
        ? { 
            ...student, 
            role: 'student',
            id: session.user.name
          }
        : { 
            ...staff, 
            role: 'teacher',
            id: session.user.name
          };

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        await update();
      } else {
        const errorData = await response.json();
        alert(`Failed to update profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="container px-4 mx-auto mt-8">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <p className="text-center">Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container px-4 mx-auto mt-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {!isRegistered && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                Your profile is not yet registered in the system. Please contact an administrator.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Role Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={session?.user?.role || "N/A"}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>

              {/* ID Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <input
                  type="text"
                  value={session?.user?.name || "N/A"}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>

              {/* Teacher Fields */}
              {session?.user?.role === 'teacher' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={staff.name}
                      onChange={(e) => updateStaffField("name", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={staff.email}
                      onChange={(e) => updateStaffField("email", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      value={staff.position}
                      onChange={(e) => updateStaffField("position", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="text"
                      value={staff.phone}
                      onChange={(e) => updateStaffField("phone", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Major</label>
                    <input
                      type="text"
                      value={staff.major}
                      onChange={(e) => updateStaffField("major", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Student Fields */}
              {session?.user?.role === 'student' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => updateStudentField("name", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">English Name</label>
                    <input
                      type="text"
                      value={student.enName}
                      onChange={(e) => updateStudentField("enName", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Group</label>
                    <input
                      type="text"
                      value={student.group}
                      onChange={(e) => updateStudentField("group", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Advisor</label>
                    <input
                      type="text"
                      value={student.advisor}
                      onChange={(e) => updateStudentField("advisor", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Major</label>
                    <input
                      type="text"
                      value={student.major}
                      onChange={(e) => updateStudentField("major", e.target.value)}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>

            {isEditing && isRegistered && (
              <button
                type="submit"
                className="mt-6 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}