import React, { useEffect, useState } from 'react';
import { getLinks, deleteLinks } from '../../api/api';
import Header from '../dashboard/Header';
import { FaTrash } from 'react-icons/fa';

interface Link {
  _id: string;
  longUrl: string;
  shortCode: string;
  shortUrl: string;
  qrCode: string;
  password: string;
  expiresAt: string | null;
  user: string | null;
  createdAt: string;
}

const SavedLinks: React.FC = () => {
  const [links, setLinks] = useState<Link[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchLinks(token);
    } else {
      setError('You are not logged in');
    }
  }, []);

  const fetchLinks = async (token: string) => {
    try {
      const data = await getLinks(token);
      setLinks(data.links as unknown as Link[]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (shortCode: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You are not logged in');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this link?');
    if (!confirmDelete) return;

    try {
      setIsLoading(true);
      const message = await deleteLinks(token, shortCode);
      console.log('Delete message:', message);
      setLinks((prevLinks) => prevLinks.filter((link) => link.shortCode !== shortCode));
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex md:flex-row flex-col min-h-screen text-white">
      {/* Sidebar */}
      <div className="w-full sm:w-1/4 lg:w-1/5 sm:h-screen">
        <Header />
      </div>
      {/* Main Content */}
      <div className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
        {/* Error Message */}
        {error ? (
          <p className="text-center text-red-500 text-lg font-semibold">{error}</p>
        ) : (
          <>
            <h2 className="text-2xl sm:text-3xl font-semibold text-teal-500 mb-6">
              Saved Links
            </h2>

            {/* Links Table */}
            {links.length === 0 ? (
              <p className="text-center text-lg text-gray-300">
                No links found. Start saving your links!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-auto w-full border-collapse border border-gray-800 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-white/10 backdrop-blur-lg border border-white/20 text-left">
                      <th className="border border-gray-700 px-4 py-2 text-lg font-medium">
                        QR Code
                      </th>
                      <th className="border border-gray-700 px-4 py-2 text-lg font-medium">
                        Short URL
                      </th>
                      <th className="border border-gray-700 px-4 py-2 text-lg font-medium">
                        Long URL
                      </th>
                      <th className="border border-gray-700 px-4 py-2 text-lg font-medium">
                        Expires At
                      </th>
                      <th className="border border-gray-700 px-4 py-2 text-lg font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link, index) => (
                      <tr
                        key={link._id}
                        className={`hover:bg-gray-700 ${
                          index % 2 === 0
                            ? 'bg-white/10 backdrop-blur-sm'
                            : 'bg-white/5 backdrop-blur-sm'
                        }`}
                      >
                        <td className="border border-gray-700 px-4 py-2 w-28 text-center">
                          <img
                            src={link.qrCode}
                            alt="QR Code"
                            className="w-12 h-12 sm:w-16 sm:h-16 object-contain mx-auto"
                          />
                        </td>
                        <td className="border border-gray-700 px-4 py-2 text-sm break-all sm:truncate sm:w-40 overflow-hidden whitespace-nowrap text-ellipsis md:whitespace-normal md:text-balance">
                          <a
                            href={link.shortUrl}
                            className="text-blue-500 underline hover:text-blue-300"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {link.shortUrl}
                          </a>
                        </td>
                        <td className="border border-gray-700 px-4 py-2 text-sm break-all sm:truncate sm:w-40 overflow-hidden whitespace-nowrap text-ellipsis md:whitespace-normal">
                        <a
                        href={link.longUrl}
                        className="text-blue-500 underline hover:text-blue-300"
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        {link.longUrl}
                        </a>
                        </td>

                        <td className="border border-gray-700 px-4 py-2 w-32 text-xs sm:text-sm">
                          {link.expiresAt
                            ? new Date(link.expiresAt).toLocaleString()
                            : 'N/A'}
                        </td>
                        <td className="border border-gray-700 px-4 py-2 text-center w-20">
                          <button
                            onClick={() => handleDelete(link.shortCode)}
                            className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition disabled:bg-gray-500"
                            disabled={isLoading}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedLinks;
