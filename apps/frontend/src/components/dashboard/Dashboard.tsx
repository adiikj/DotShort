import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import { getUserProfile } from '../../api/api';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const profile = await getUserProfile();
        setUserName(profile.name); // Set the user's name
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user profile.'); // Handle errors
      }
    };

    fetchUserName();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-white">
      {/* Sidebar */}
      <div className="w-full sm:w-1/4 lg:w-1/5 sm:h-screen">
        <Header />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8">
        {/* Topbar */}
          {userName && (
            <p className="text-3xl sm:text-4xl font-bold text-white mb-4 md:mb-10 mt-3 md:mt-8">
              Welcome, <span className="text-teal-500">{userName}</span>!
            </p>
          )}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-teal-500">Dashboard</h2>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 bg-red-100 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Main Grid (showing different sections) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Short URLs Card */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Your Short URLs</h3>
            <p className="text-sm sm:text-base text-gray-400">
              You have 120 URLs shortened. Manage and view your links.
            </p>
            <Link
              to="/dashboard/shortlink"
              className="text-teal-500 hover:underline mt-4 inline-block text-sm sm:text-base"
            >
              View My URLs
            </Link>
          </div>

          {/* QR Code Generation Card */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Generate Short URL & QR Code
            </h3>
            <p className="text-sm sm:text-base text-gray-400">
              Click here to generate short URLs and corresponding QR codes.
            </p>
            <Link to="/dashboard/qr">
              <button
                className="w-full bg-teal-500 text-white py-2 sm:py-3 rounded-lg font-medium mt-4 text-sm sm:text-base"
              >
                Go to QR Code Generator
              </button>
            </Link>
          </div>

          {/* Analytics Card */}
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Analytics Overview</h3>
            <p className="text-sm sm:text-base text-gray-400">
              View clicks, performance, and more.
            </p>
            <Link
              to="/dashboard/analytics"
              className="text-teal-500 hover:underline mt-4 inline-block text-sm sm:text-base"
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Recent Activity</h3>
          <ul className="text-sm sm:text-base">
            <li className="text-gray-400">
              Shortened a new URL -{' '}
              <span className="text-teal-500">short.ly/abc123</span>
            </li>
            <li className="text-gray-400">
              Checked analytics for short URL -{' '}
              <span className="text-teal-500">short.ly/xyz789</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
