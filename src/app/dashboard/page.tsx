// app/dashboard/page.tsx
'use client';

// app/dashboard/page.tsx

import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700">Card Title 1</h2>
          <p className="mt-2 text-gray-600">This is some content for card 1.</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700">Card Title 2</h2>
          <p className="mt-2 text-gray-600">This is some content for card 2.</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700">Card Title 3</h2>
          <p className="mt-2 text-gray-600">This is some content for card 3.</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white shadow-md rounded-lg p-4 mt-6">
        <p className="text-center text-gray-500">&copy; 2025 Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardPage;