'use client';

import { useSession } from "next-auth/react";
import { useState } from "react";
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
    major: session?.user?.major || ''
    // Add other fields you need
  });

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
        // Optionally refresh session
        await update();
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Role Display (non-editable) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={(session?.user as any)?.role || 'N/A'}
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

              {/* English Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">English Name</label>
                <input
                  type="text"
                  value={formData.enName}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              {/* Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Group</label>
                <input
                  type="text"
                  value={formData.group}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              {/* Advisor */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Advisor</label>
                <input
                  type="text"
                  value={formData.advisor}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>

              {/* Major */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Major</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div>
 
              {/* Email 
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                />
              </div> */}

              {/* Add more fields as needed */}
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