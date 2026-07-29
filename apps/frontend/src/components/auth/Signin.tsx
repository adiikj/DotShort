import React, { useState, useEffect, FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from "../../api/api"; // Replace with the correct import path for your loginUser API
import Cookies from "js-cookie";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { login } from "../../redux/authSlice"; // Adjust to your actual Redux slice action path
import { Link } from 'react-router-dom';

// Define the root state type
interface RootState {
  auth: {
    isAuthenticated: boolean;
  };
}

const Signin: React.FC = () => {
  // Component state
  const [emailOrUsername, setEmailOrUsername] = useState<string>(""); // State for email or username
  const [password, setPassword] = useState<string>(""); // State for password
  const [showPassword, setShowPassword] = useState<boolean>(false); // State for toggling password visibility
  const [error, setError] = useState<string | null>(null); // State for errors
  const [isLoading, setIsLoading] = useState<boolean>(false); // State for loading
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get the authentication state from Redux
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle sign-in form submission
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    try {
      const response = await loginUser(emailOrUsername, password); // Ensure this returns the correct structure
      console.log("Login Response:", response);
  
      const accessToken = response?.data?.accessToken; // Adjust based on actual API response structure
      if (!accessToken) {
        console.error("Access Token missing in response:", response);
        throw new Error("Access Token not found");
      }
  
      // Store the token in cookies
      Cookies.set("accessToken", accessToken, { secure: true, sameSite: "lax" });
  
      // Dispatch login action to Redux
      dispatch(login(accessToken));
      localStorage.setItem("authToken", accessToken);
      console.log("Token stored successfully:", accessToken);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 sm:px-0">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-400 text-sm sm:text-base">
            Sign in to access your dashboard and manage your short URLs.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium mb-1">
              Email or Username :
            </label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded bg-white/5 backdrop-blur-md text-white"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password:
            </label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded bg-white/5 backdrop-blur-md text-white"
              placeholder="Enter your password"
              required
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>
          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        {error && <p className="text-red-500 text-center mt-2 text-sm">{error}</p>}
        <p className="text-gray-500 mt-4 text-center text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-500 hover:underline">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
