'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "../navbar/page";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
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
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchProfile = async () => {
    if (!session?.user?.name) {
      setLoading(false);
      return;
    }
    
    console.log("Searching for name:", session.user.name); // DEBUG
    
    try {
      const response = await fetch(
        `/api/profile?name=${encodeURIComponent(session.user.name)}`
      );
      
      const result = await response.json();
      console.log("API Response:", result); // DEBUG
      
      if (result.success && result.data) {
        setIsRegistered(true);
        
        if (result.userType === 'student') {
          console.log("Setting student data:", result.data); // DEBUG
          setStudent({
            name: result.data.name || "",
            enName: result.data.enName || "",
            group: result.data.group || "",
            advisor: result.data.advisor || "",
            major: result.data.major || "",
          });
        } else if (result.userType === 'staff') {
          console.log("Setting staff data:", result.data); // DEBUG
          setStaff({
            name: result.data.name || "",
            position: result.data.position || "",
            email: result.data.email || "",
            phone: result.data.phone || "",
            major: result.data.major || "",
          });
        }
      } else {
        setIsRegistered(false);
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [session?.user?.name]);

  const updateStudentField = (field: string, value: string) => {
    setStudent((prev) => ({ ...prev, [field]: value || "" }));
  };

  const updateStaffField = (field: string, value: string) => {
    setStaff((prev) => ({ ...prev, [field]: value || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataToSend = session?.user?.role === 'student' ? student : staff;
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.user?.name,
          userType: session?.user?.role === 'student' ? 'student' : 'staff',
          data: dataToSend,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert('Failed to update profile: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="container px-4 mx-auto mt-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    </>
  );

  if (!session?.user?.name) return (
    <>
      <Navbar />
      <div className="container px-4 mx-auto mt-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <p className="text-center text-red-600">Please login to view your profile</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container px-4 mx-auto mt-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            {isRegistered && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            )}
          </div>

          {!isRegistered && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800">
                Your profile is not yet registered in the system. Please contact an administrator.
              </p>
            </div>
          )}

          {error && !isRegistered && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800">{error}</p>
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

              {/* Name Display 
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={session?.user?.name || "N/A"}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>*/}

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