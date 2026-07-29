import React, { useState } from "react";
import InputField from "../shortenLink/InputField";
import ShortenedLink from "../shortenLink/ShortenedLink";
import { shortenUrl } from "../../api/api"; // Import the updated shortenUrl API
import { Link } from "react-router-dom";
import Header from "../dashboard/Header";

const LinkShort: React.FC = () => {
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [customShortcode, setCustomShortcode] = useState<string>("");
  const [password, setPassword] = useState<string>(""); // State for password
  const [expireInHours, setExpireInHours] = useState<number | undefined>(undefined); // State for expiration
  const [useCustomShortcode, setUseCustomShortcode] = useState<boolean>(false); // Toggle for custom shortcode
  const [usePassword, setUsePassword] = useState<boolean>(false); // Toggle for password protection
  const [useExpiration, setUseExpiration] = useState<boolean>(false); // Toggle for expiration


  const handleShorten = async (url: string) => {
    setError(null);


    setLoading(true);

    try {
      // Call the API with custom parameters if provided
      const { shortUrl } = await shortenUrl(
        url,
        useCustomShortcode ? customShortcode.trim() : undefined,
        usePassword ? password.trim() : undefined,
        useExpiration ? expireInHours : undefined
      );

      setShortenedUrl(shortUrl);
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Failed to shorten the URL. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen text-white">
      {/* Sidebar (Header Component) */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 sm:p-8 rounded-xl shadow-xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-teal-400">
            Shorten Your Link
          </h2>

          {/* Input Field for Long URL */}
          <InputField onShorten={handleShorten} isLoading={loading} />

          {/* Toggle for Custom Shortcode */}
          <div className="mt-4 pt-4">
            <label className="text-lg text-gray-300">Use Custom Shortcode</label>
            <div className="flex items-center space-x-6 mt-2">
              <button
                onClick={() => setUseCustomShortcode(true)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all ${
                  useCustomShortcode ? "bg-teal-500 text-white" : "bg-transparent text-teal-400"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setUseCustomShortcode(false)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all ${
                  !useCustomShortcode ? "bg-teal-500 text-white" : "bg-transparent text-teal-400"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Custom Shortcode Field */}
          {useCustomShortcode && (
            <div className="space-y-2 mt-4">
              <label className="block text-md text-gray-300"></label>
              <input
                type="text"
                className="w-full border-2 border-gray-600 rounded-3xl bg-white/10 backdrop-blur-lg py-2 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-teal-400"
                placeholder="Enter your custom shortcode (e.g., mylink123)"
                value={customShortcode}
                onChange={(e) => setCustomShortcode(e.target.value)}
              />
            </div>
          )}

          {/* Toggle for Password Protection */}
          <div className="mt-4">
            <label className="text-lg text-gray-300">Password Protection</label>
            <div className="flex items-center space-x-6 mt-2">
              <button
                onClick={() => setUsePassword(true)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all ${
                  usePassword ? "bg-teal-500 text-white" : "bg-transparent text-teal-400"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setUsePassword(false)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all ${
                  !usePassword ? "bg-teal-500 text-white" : "bg-transparent text-teal-400"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Password Protection Field */}
          {usePassword && (
            <div className="space-y-2 mt-4">
              <label className="block text-md text-gray-300"></label>
              <input
                type="password"
                className="w-full border-2 border-gray-600 rounded-3xl bg-white/10 backdrop-blur-lg py-2 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-teal-400"
                placeholder="Enter password (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {/* Toggle for Expiration Time */}
          <div className="mt-4">
            <label className="text-lg text-gray-300">Set Expiration Time</label>
            <div className="flex items-center space-x-6 mt-2">
              <button
                onClick={() => setUseExpiration(true)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all ${
                  useExpiration ? "bg-teal-500 text-white" : "bg-transparent text-teal-400"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setUseExpiration(false)}
                className={`px-6 py-2 rounded-full focus:outline-none transition-all ${
                  !useExpiration ? "bg-teal-500 text-white" : "bg-transparent text-teal-400"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* Expiration Time Field */}
          {useExpiration && (
            <div className="space-y-2 mt-4">
              <label className="block text-md text-gray-300"></label>
              <input
                type="number"
                min="1"
                className="w-full border-2 border-gray-600 rounded-3xl bg-white/10 backdrop-blur-lg  py-2 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring focus:ring-teal-400"
                placeholder="Enter expiration time in hours"
                value={expireInHours}
                onChange={(e) => setExpireInHours(Number(e.target.value))}
              />
            </div>
          )}

          {/* Shortened URL and Error Display */}
          <ShortenedLink shortenedUrl={shortenedUrl} error={error} />


          {/* Navigation Link */}
          <div className="text-center text-sm sm:text-lg text-gray-300">
            Want to generate a QR instead?{" "}
            <Link to="/dashboard/qr" className="text-teal-400 hover:underline">
              Generate QR
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkShort;
