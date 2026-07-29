import React, { useState } from "react";
import { FaLink } from "react-icons/fa";

interface InputFieldProps {
  onShorten: (url: string) => void;
  isLoading: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ onShorten, isLoading }) => {
  const [url, setUrl] = useState<string>("");

  const handleSubmit = () => {
    if (url.trim()) {
      onShorten(url);
      setUrl("");
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col sm:flex-row items-center w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl md:rounded-full p-1 shadow-lg">
        {/* Icon */}
        <div className="p-3">
          <FaLink className="text-teal-400 text-xl" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder="Enter your URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-10 py-3 border-2 border-gray-600 md:border-0 rounded-3xl bg-transparent text-white placeholder-gray-300 focus:outline-none focus:ring-0"
        />

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-teal-500 mb-3 md:mb-0 hover:bg-teal-600 text-white font-medium px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:ml-4 sm:mt-0 mt-4"
        >
          {isLoading ? "Shortening..." : "Shorten"}
        </button>
      </div>
    </div>
  );
};

export default InputField;
