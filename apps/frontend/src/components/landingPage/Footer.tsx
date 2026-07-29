import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className=" text-white py-6">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        {/* Copyright Text */}
        <p className="text-xs sm:text-sm md:text-base">
          &copy; 2025 <span className="font-semibold text-teal-400">DotShort</span>. All rights reserved.
        </p>

        {/* Links */}
        <div className="mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <a
            href="#privacy"
            className="text-gray-400 hover:text-teal-400 transition duration-300 text-sm sm:text-base"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-gray-400 hover:text-teal-400 transition duration-300 text-sm sm:text-base"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
