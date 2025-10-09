// request/page.tsx 
"use client";

import { redirect } from "next/navigation";
import Navbar from "../navbar/page";
import { useSession } from "next-auth/react";
import { useEffect, useState } from 'react';

export default function Request() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Enhanced cancelBooking handler
  const cancelBooking = async (id, room, seat) => {
    try {
      console.log('Attempting to cancel reservation:', { id, username: session.user.username, room, seat });
      
      const response = await fetch(`/api/delete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id,
          username: session.user.username, 
          room, 
          seat 
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (response.ok) {
        setPosts((prevPosts) =>
          prevPosts.filter(post => post.id !== id)
        );
        alert('Reservation cancelled successfully!');
      } else {
        console.error('Failed to cancel reservation:', responseData);
        alert(`Failed to cancel reservation: ${responseData.message}`);
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Network error occurred while cancelling reservation');
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        if (session?.user?.username) {
          console.log('Fetching reservations for:', session.user.username);
          
          const res = await fetch(`/api/check?username=${encodeURIComponent(session.user.name)}&status=occupied`);
          console.log('Response status:', res.status);
          
          const data = await res.json();
          console.log('API Response data:', data);

          // Check multiple possible response formats
          if (data.reservations && Array.isArray(data.reservations)) {
            console.log('Found reservations:', data.reservations.length);
            setPosts(data.reservations);
          } else if (Array.isArray(data)) {
            console.log('Data is array:', data.length);
            setPosts(data);
          } else {
            console.error('Invalid response format:', data);
            setError('Invalid data format received');
            setPosts([]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (status === 'authenticated') {
      fetchData();
    }
  }, [session, status]);

  if (status === 'loading') return <p>Loading session...</p>;
  if (!session) return redirect('./auth/login');

  return (
    <div className="w-full min-h-screen m-0 font-sans bg-gray-100">
      <div className="bg-white shadow">
        <Navbar profile={session.user?.username}></Navbar>
      </div>
      <div className="max-w-6xl min-h-screen p-6 mx-auto bg-gray-50">
        <div className="p-4 space-y-4 md:p-5">
          <h1 className="text-3xl font-bold underline">Cancellations</h1>
          <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
            This section allows you to cancel your reservation if you are not satisfied with your booking or an unfortunate event interrupts your booking. 
            This table shows your current occupied reservations.
          </p>

          {/* Debug information */}
          <div className="p-3 mb-4 text-sm bg-blue-50 border border-blue-200 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Username: {session?.user?.name}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Posts count: {posts.length}</p>
            <p>Error: {error || 'None'}</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
              Error: {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="p-4 text-center">
              <p>Loading reservations...</p>
            </div>
          )}

          {/* Render the data in a table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full bg-white border border-gray-300 table-auto">
                <thead className="text-white bg-pink-500">
                  <tr>

                    <th className="px-4 py-2 border border-gray-300">Room</th>
                    <th className="px-4 py-2 border border-gray-300">Seat</th>
                    <th className="px-4 py-2 border border-gray-300">Date In</th>
                    <th className="px-4 py-2 border border-gray-300">Date Out</th>
                    <th className="px-4 py-2 border border-gray-300">Period Time</th>
                    <th className="px-4 py-2 border border-gray-300">Status</th>
                    <th className="px-4 py-2 border border-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map((post, index) => {
                      console.log('Rendering post:', post);
                      return (
                        <tr key={post.id || index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-center border border-gray-300">{post.room}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{post.seat}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{post.date_in}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{post.date_out}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{post.period_time}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">{post.status}</td>
                          <td className="px-4 py-2 text-center border border-gray-300">
                            <button 
                              className="px-4 py-2 font-bold text-white transition-colors bg-red-500 rounded hover:bg-red-700" 
                              onClick={() => cancelBooking(post.id, post.room, post.seat)}
                            >
                              CANCEL
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-500">
                        {loading ? 'Loading...' : 'No occupied reservations found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Raw data display for debugging 
          {posts.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                Show raw data (for debugging)
              </summary>
              <pre className="p-4 mt-2 overflow-auto text-xs bg-gray-100 rounded">
                {JSON.stringify(posts, null, 2)}
              </pre>
            </details>
          )} */}
        </div>

        <footer className="w-full shadow-sm bg-neutral-400 dark:bg-gray-900">
          <div className="w-full max-w-screen-xl p-4 mx-auto md:py-8">
            <span className="block text-sm text-black-500 sm:text-center dark:text-black-400">
              © 2025 <a href="http://cosci.swu.ac.th/" className="hover:underline">College Of Social Communication Innovation</a>. All Rights Reserved.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}