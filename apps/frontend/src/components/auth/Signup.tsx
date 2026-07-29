import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { registerUser } from '../../api/api';

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { name, username, email, password } = formData;

    // Simple validation
    if (!name || !username || !email || !password) {
      return setError('All fields are required.');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return setError('Username should only contain letters, numbers, and underscores.');
    }

    const payload = { name, username, email, password };

    try {
      setIsLoading(true);
      const response = await registerUser(payload);
      console.log('Registration Response:', response);

      // Redirect after successful registration
      navigate('/dashboard'); // Assuming you want to navigate to an OTP page
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 sm:px-0">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-lg shadow-lg max-w-3xl w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Join DotShort</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Create an account to unlock exclusive features!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Features Section */}
          <div className="flex-1 bg-white/5 backdrop-blur-md p-6 rounded-lg mb-6 sm:mb-0">
            <h3 className="text-xl font-semibold mb-4">Why Sign Up?</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Custom Short URLs</li>
              <li>Expiration Dates</li>
              <li>Basic Analytics (e.g., total clicks)</li>
              <li>Password Protection</li>
              <li>Unlimited Short URLs and QR Codes</li>
            </ul>
          </div>

          {/* Signup Form */}
          <div className="flex-1">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-700 rounded bg-white/5 backdrop-blur-md text-white"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username:
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-700 rounded bg-white/5 backdrop-blur-md text-white"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-700 rounded bg-white/5 backdrop-blur-md text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-700 rounded bg-white/5 backdrop-blur-md text-white"
                    placeholder="Enter your password"
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer pt-6"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </span>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </form>

            <p className="text-gray-500 mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link to="/signin" className="text-teal-500 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
