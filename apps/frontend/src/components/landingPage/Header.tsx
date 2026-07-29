import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa'; // Icons for hamburger and close buttons

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for toggling mobile menu

  return (
    <header className="flex justify-between items-center w-full h-20 px-4 sm:px-16 text-white">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-teal-500 to-teal-400 font-bold text-3xl sm:text-4xl">
          DotShort
        </div>
      </Link>

      {/* Hamburger Menu Icon (Mobile) */}
      <button
        className="sm:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Navigation Links (Desktop) */}
      <nav className="hidden sm:flex gap-8">
        <Link to="/generateqr" className="text-white hover:text-teal-400 transition duration-300 text-lg">
          QR Generator
        </Link>
        <Link to="/shortenlink" className="text-white hover:text-teal-400 transition duration-300 text-lg">
          Link Shortener
        </Link>
        <a href="#pricing" className="text-white hover:text-teal-400 transition duration-300 text-lg">
          Pricing
        </a>
        <a href="#about" className="text-white hover:text-teal-400 transition duration-300 text-lg">
          About
        </a>
        <a href="#contact" className="text-white hover:text-teal-400 transition duration-300 text-lg">
          Contact
        </a>
      </nav>

      {/* Buttons (Desktop) */}
      <div className="hidden sm:flex space-x-6">
        <Link to="/signup">
          <button className="text-white bg-teal-500 hover:bg-transparent hover:text-teal-500 border-2 border-teal-500 px-6 py-2 rounded-full font-medium transition duration-300 transform">
            Sign Up
          </button>
        </Link>
        <Link to="/signin">
          <button className="text-white bg-purple-500 hover:bg-transparent hover:text-purple-500 border-2 border-purple-500 px-6 py-2 rounded-full font-medium transition duration-300 transform">
            Sign In
          </button>
        </Link>
      </div>

      {/* Mobile Menu (hidden on larger screens) */}
      <div
        className={`sm:hidden fixed top-0 left-0 w-full h-full bg-black/50 z-50 ${isMenuOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsMenuOpen(false)} // Close menu when clicking outside
      >
        <div className="bg-white/5 backdrop-blur-md p-8 flex flex-col gap-6 h-full justify-center items-center">
          <a href="#pricing" className="text-white hover:text-teal-400 text-lg" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </a>
          <a href="#about" className="text-white hover:text-teal-400 text-lg" onClick={() => setIsMenuOpen(false)}>
            About
          </a>
          <a href="#contact" className="text-white hover:text-teal-400 text-lg" onClick={() => setIsMenuOpen(false)}>
            Contact
          </a>
          <Link to="/generateqr" className="text-white hover:text-teal-400 text-lg" onClick={() => setIsMenuOpen(false)}>
            QR Generator
          </Link>
          <Link to="/shortenlink" className="text-white hover:text-teal-400 text-lg" onClick={() => setIsMenuOpen(false)}>
            Link Shortener
          </Link>
          <div className="space-x-6">
            <Link to="/signup">
              <button className="text-white bg-teal-500 hover:bg-transparent hover:text-teal-500 border-2 border-teal-500 px-6 py-2 rounded-full font-medium transition duration-300 transform">
                Sign Up
              </button>
            </Link>
            <Link to="/signin">
              <button className="text-white bg-purple-500 hover:bg-transparent hover:text-purple-500 border-2 border-purple-500 px-6 py-2 rounded-full font-medium transition duration-300 transform">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
