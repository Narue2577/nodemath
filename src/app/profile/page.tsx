'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Navbar from "../navbar/page";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    enName: session?.user?.enName || '',
    email: session?.user?.email || '',
    group: session?.user?.group || '',
    advisor: session?.user?.advisor || '',
    major: session?.user?.major || '',
    position: session?.user?.field || '',
    phone: session?.user?.phone || '',
  });

  // ปรับปรุง useEffect ให้ฟังการเปลี่ยนแปลงของ role
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        enName: session.user.enName || '',
        email: session.user.email || '',
        group: session.user.group || '',
        advisor: session.user.advisor || '',
        major: session.user.major || '',
        position: session.user.field || '',
        phone: session.user.phone || '',
      });
    }
  }, [session?.user?.role]); // ใช้ role เป็น dependency

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        setIsEditing(false);
        await update(); // Refresh session
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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

          <form onSubmit={handleSubmit} key={session?.user?.role}>
            <div className="space-y-4">
              {/* Role Display (non-editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={session?.user?.role || 'N/A'}
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              {/* Position สำหรับอาจารย์ */}
              {session?.user?.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, field: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* English Name สำหรับนักศึกษา */}
              {session?.user?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">English Name</label>
                  <input
                    type="text"
                    value={formData.enName}
                    onChange={(e) => setFormData({...formData, enName: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Group สำหรับนักศึกษา */}
              {session?.user?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group</label>
                  <input
                    type="text"
                    value={formData.group}
                    onChange={(e) => setFormData({...formData, group: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Advisor สำหรับนักศึกษา */}
              {session?.user?.role === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Advisor</label>
                  <input
                    type="text"
                    value={formData.advisor}
                    onChange={(e) => setFormData({...formData, advisor: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Phone สำหรับอาจารย์ */}
              {session?.user?.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              )}

              {/* Major */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Major</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              {/* Email สำหรับอาจารย์ */}
              {session?.user?.role === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  />
                </div>
              )}
            </div>

            {isEditing && (
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