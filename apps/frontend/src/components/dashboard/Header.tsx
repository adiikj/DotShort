import { AiOutlineLogout } from 'react-icons/ai'; // Add logout icon
import { FaChartBar, FaLink, FaUser, FaQrcode, FaChartLine } from 'react-icons/fa'; // For dashboard items
import { logout } from '../../redux/authSlice';
import Cookies from 'js-cookie';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const location = useLocation(); // Get the current URL path
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = (): void => {
    Cookies.remove('accessToken');
    dispatch(logout());
    window.location.href = '/';
  };

  // Helper function to check if the current path matches the link
  const isActiveLink = (path: string): boolean => location.pathname === path;

  return (
    <div className="bg-white/5 backdrop-blur-md p-6 sm:w-64 sm:fixed sm:h-full">
      <div className="flex items-center justify-between sm:block">
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-teal-500 to-teal-400 font-bold text-3xl sm:text-4xl mb-4 sm:mb-8">
          DotShort
        </h2>
        <button
          className="sm:hidden text-gray-400 hover:text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? 'Close' : 'Menu'}
        </button>
      </div>
      <ul
        className={`transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'block' : 'hidden'
        } sm:block`}
      >
        <li className="mb-6">
          <Link to="/dashboard">
            <button
              className={`flex items-center text-lg gap-3 text-gray-400 hover:text-white mt-0 md:mt-16 ${
                isActiveLink('/dashboard') ? 'text-teal-500' : ''
              }`}
            >
              <FaChartBar size={20} /> <span>Dashboard</span>
            </button>
          </Link>
        </li>
        <li className="mb-6">
          <Link to="/dashboard/shortlink">
            <button
              className={`flex items-center text-lg gap-3 text-gray-400 hover:text-white ${
                isActiveLink('/dashboard/shortlink') ? 'text-teal-500' : ''
              }`}
            >
              <FaLink size={20} /> <span>Short URL</span>
            </button>
          </Link>
        </li>
        <li className="mb-6">
          <Link to="/dashboard/qr">
            <button
              className={`flex items-center text-lg gap-3 text-gray-400 hover:text-white ${
                isActiveLink('/dashboard/qr') ? 'text-teal-500' : ''
              }`}
            >
              <FaQrcode size={20} /> <span>QR Code</span>
            </button>
          </Link>
        </li>
        <li className="mb-6">
          <Link to="/dashboard/analytics">
            <button
              className={`flex items-center text-lg gap-3 text-gray-400 hover:text-white ${
                isActiveLink('/dashboard/analytics') ? 'text-teal-500' : ''
              }`}
            >
              <FaChartLine size={20} /> <span>Analytics</span>
            </button>
          </Link>
        </li>
        <li className="mb-6">
          <Link to="/dashboard/savedlinks">
            <button
              className={`flex items-center text-lg gap-3 text-gray-400 hover:text-white ${
                isActiveLink('/dashboard/savedlinks') ? 'text-teal-500' : ''
              }`}
            >
              <FaLink size={20} /> <span>Saved Links</span>
            </button>
          </Link>
        </li>

        <li className="mb-6">
          <Link to="/profile">
            <button
              className={`flex items-center text-lg gap-3 text-gray-400 hover:text-white ${
                isActiveLink('/profile') ? 'text-teal-500' : ''
              }`}
            >
              <FaUser size={20} /> <span>Profile</span>
            </button>
          </Link>
        </li>
        <li className="mb-6">
          <button
            onClick={handleLogout}
            className="flex items-center text-lg gap-3 text-gray-400 hover:text-white"
          >
            <AiOutlineLogout size={20} /> <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Header;
