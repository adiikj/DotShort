import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
const USER_URL = import.meta.env.VITE_API_USER_URL;

interface ShortenUrlResponse {
  shortUrl: string;
  expiresAt?: string; // Optional expiration date
}

interface QrUrlResponse {
  qrCode: string;
}

interface Link {
  id: string;
  longUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt?: string;
}

interface GetLinksResponse {
  links: Link[];
}


interface LoginResponse {
  data: {
    accessToken: string; // Assuming the access token is inside the 'data' field
    refreshToken: string; // Assuming the refresh token is inside the 'data' field
  };
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
}

// Interface for Register User Input
interface RegisterUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Interface for Register User Response
interface RegisterUserResponse {
  message: string;
}

// Interface for User Profile Response
interface UserProfile {
  name: string;
}

export const shortenUrl = async (
  url: string,
  shortCode?: string,
  password?: string,
  expireInHours?: number
): Promise<ShortenUrlResponse> => {
  try {
    // Prepare the request body with optional parameters
    const requestBody: any = {
      longUrl: url,
    };

    if (shortCode) requestBody.shortCode = shortCode;
    if (password) requestBody.password = password;
    if (expireInHours) requestBody.expireInHours = expireInHours;

    // Get the access token from localStorage
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("You are not logged in. Please log in to shorten URLs.");
    }

    // Send the request to the backend with the token in headers
    const response = await axios.post(`${BACKEND_URL}/shorten`, requestBody, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token for authentication
      },
    });

    // Extract and return the relevant data from the response
    const { shortUrl, expiresAt } = response.data.data;

    return { shortUrl, expiresAt };
  } catch (error) {
    console.error("Error shortening the URL:", error);
    throw new Error("Error shortening the URL. Please try again.");
  }
};


export const qrUrl = async (url: string): Promise<QrUrlResponse> => {
  try {
    const response = await axios.post(`${BACKEND_URL}/shorten`, { longUrl: url });
    const { qrCode } = response.data.data;

    return {qrCode };
  } catch (error) {
    console.error("Error shortening the QR:", error);
    throw new Error("Error shortening the QR. Please try again.");
  }
};


export const getLinks = async (token: string): Promise<GetLinksResponse> => {
  try {
    const response = await axios.get<{ data: { links: Link[] } }>(`${BACKEND_URL}/user-links`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Extracting `links` from the response
    const { links } = response.data.data;

    return { links };
  } catch (error: any) {
    console.error("Error fetching user links:", error?.response?.data?.message || error.message);
    throw new Error(error?.response?.data?.message || "Error fetching links. Please try again.");
  }
};

export const deleteLinks = async (token: string, shortCode: string): Promise<string> => {
  try {
    console.log('Deleting link with shortcode:', shortCode); // Debug log
    console.log('Backend URL:', `${BACKEND_URL}/delete/${shortCode}`); // Debug log

    const response = await axios.delete(`${BACKEND_URL}/delete/${shortCode}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the authorization token
      },
    });

    console.log('Response from backend:', response.data); // Debug log
    return response.data.message || "Link deleted successfully";
  } catch (error: any) {
    console.error("Error deleting link:", error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || "Error deleting link. Please try again.");
  }
};




export const loginUser = async (
  emailOrUsername: string,
  password: string
): Promise<LoginResponse> => {
  try {
    // Make the POST request to login
    const response = await axios.post<LoginResponse>(
      `${USER_URL}/login`, // URL to your login endpoint
      { emailOrUsername, password },
      {
        withCredentials: true, // Ensure cookies are sent/received for authentication
      }
    );

    // Assuming the response includes the access token
    const { accessToken, refreshToken } = response.data.data;

    // Save the access token in localStorage (if it's part of the response)
    localStorage.setItem("accessToken", accessToken);
    
    // Optionally, store the refreshToken if needed
    localStorage.setItem("refreshToken", refreshToken);

    return response.data; // Return server response data (user data, success message, etc.)
  } catch (error: any) {
    // Log detailed error info for debugging
    console.error("Login API Error:", error.response || error.message);

    // Extract error message from server or fallback to a default message
    const message =
      error?.response?.data?.message ||
      error.message ||
      "An unexpected error occurred while logging in";

    throw new Error(message); // Re-throw error with user-friendly message
  }
};

// Logout User Function
export const logoutUser = async (token: string): Promise<string> => {
  try {
    const response = await axios.post(
      `${USER_URL}/logout`,
      {}, // Empty body
      {
        headers: { Authorization: `Bearer ${token}` }, // Pass token as Bearer
        withCredentials: true, // Ensure cookies are included
      }
    );

    return response.data.message; // Return success message
  } catch (error: any) {
    const message = error?.response?.data?.message || error.message || "Error logging out.";
    throw new Error(message);
  }
};

// Get Logged-in User's Profile Function
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const token = localStorage.getItem("authToken");

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await axios.get<{ status: number; data: UserProfile }>(
      `${USER_URL}/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.data; // Extract the "data" field containing the user profile
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    const message =
      error.response?.data?.message || error.message || "Failed to fetch user profile.";
    throw new Error(message);
  }
};


// Register User Function
export const registerUser = async (
  input: RegisterUserInput
): Promise<RegisterUserResponse> => {
  try {
    const response = await axios.post<RegisterUserResponse>(`${USER_URL}/register`, input);
    return response.data; // Return success message for OTP sent
  } catch (error: any) {
    const message = error?.response?.data?.message || error.message || "Error registering user.";
    throw new Error(message);
  }
};



