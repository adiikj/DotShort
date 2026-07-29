import React from "react";

interface ShortenedLinkProps {
  shortenedUrl: string | null;
  error: string | null;
}

const ShortenedLink: React.FC<ShortenedLinkProps> = ({ shortenedUrl, error }) => {
  const handleCopy = () => {
    if (shortenedUrl) {
      navigator.clipboard
        .writeText(shortenedUrl)
        .then(() => alert("URL copied to clipboard!"))
        .catch((err) => console.error("Error copying URL:", err));
    }
  };

  return (
    <div className="min-h-60 flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-lg shadow-lg space-y-6">
        {shortenedUrl && (
          <div className="flex flex-col items-center w-full space-y-4">
            <p className="text-teal-400 text-lg font-medium">Shortened URL</p>
            <div className="flex items-center justify-between w-full space-x-3">
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-teal-300 underline hover:text-teal-400 transition-all"
              >
                {shortenedUrl}
              </a>
              <button
                onClick={handleCopy}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                Copy
              </button>
            </div>
          </div>
        )}
        {error && (
          <p className="text-red-500 font-medium text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default ShortenedLink;
