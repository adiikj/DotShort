import React, { useState } from "react";
import { qrUrl } from "../../api/api";
import { Link } from "react-router-dom";
import Header from "../dashboard/Header";

const QRPage: React.FC = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [url, setUrl] = useState<string>("");

  const MAX_FREE_QR = 50;

  const getQrCount = () => {
    const count = localStorage.getItem("qrCount");
    return count ? parseInt(count, 10) : 0;
  };

  const incrementQrCount = () => {
    const currentCount = getQrCount();
    localStorage.setItem("qrCount", (currentCount + 1).toString());
  };

  const handleQR = async (url: string) => {
    setError(null);

    const currentCount = getQrCount();
    if (currentCount >= MAX_FREE_QR) {
      setError(
        `You have reached the limit of ${MAX_FREE_QR} QR codes. Please log in for unlimited access.`
      );
      return;
    }

    setLoading(true);
    setQrCode(null); // Clear the previous QR code

    try {
      const { qrCode } = await qrUrl(url);
      setQrCode(qrCode);
      incrementQrCount(); // Increment the count on successful QR generation
    } catch (err) {
      setError("Failed to generate the QR Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUrl("");
    setQrCode(null);
    setError(null);
  };

  return (
    <div className="flex flex-col sm:flex-row min-h-screen text-white">
      {/* Sidebar (Header Component) */}
      <Header />

      {/* Main Content Area */}
      <div className="flex-1 p-6 sm:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-6 sm:p-8 rounded-xl shadow-xl space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-teal-400">
            Generate QR Code
          </h2>

          {/* Display QR Code */}
          <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white/5 backdrop-blur-md rounded-md flex justify-center items-center border border-white/20 mx-auto">
            {qrCode ? (
              <img
                src={qrCode}
                alt="Generated QR Code"
                className="w-full h-full object-contain"
              />
            ) : loading ? (
              <div className="text-teal-400">Generating...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="text-gray-300 text-center">
                No QR Code Generated
              </div>
            )}
          </div>

          {/* URL Input and Buttons */}
          <div className="w-full flex flex-col space-y-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-full bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
              placeholder="Enter your link"
            />
            <div className="flex flex-col sm:flex-row w-full justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleQR(url)}
                disabled={loading}
                className="w-full sm:flex-1 px-6 py-3 bg-teal-500 text-white rounded-full shadow-md hover:bg-teal-600 focus:ring-2 focus:ring-teal-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              <button
                onClick={handleReset}
                className="w-full sm:flex-1 px-6 py-3 bg-gray-500 text-white rounded-full shadow-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 transition"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Navigation Link */}
          <div className="text-center text-sm sm:text-lg">
            Want to shorten a URL instead?{" "}
            <Link
              to="/dashboard/shortlink"
              className="text-teal-400 hover:underline"
            >
              Shorten a URL
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPage;
