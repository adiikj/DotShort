import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setSession, clearSession } from "@/lib/auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const USER_URL =
  process.env.NEXT_PUBLIC_API_USER_URL || (BACKEND_URL ? `${BACKEND_URL}/user` : undefined);

// Single axios instance: attaches the access token when present, sends
// cookies, and transparently refreshes an expired access token once.
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const attemptTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken || !USER_URL) return null;

  try {
    // Use a bare axios call to avoid the interceptors recursing.
    const response = await axios.post<{ data?: { accessToken: string; refreshToken: string } }>(
      `${USER_URL}/refresh`,
      { refreshToken }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data.data ?? {};
    if (accessToken) {
      setSession({ accessToken, refreshToken: newRefreshToken });
      return accessToken;
    }
    return null;
  } catch {
    clearSession();
    return null;
  }
};

const isAuthEndpoint = (url?: string): boolean =>
  ["/login", "/register", "/refresh"].some((endpoint) => url?.includes(endpoint));

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = attemptTokenRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  }
);

/** Surface the backend's error message (and validation details) instead of a generic string. */
export const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string; errors?: string[] } | undefined;
    if (payload?.message) {
      return payload.errors?.length
        ? `${payload.message} (${payload.errors.join(", ")})`
        : payload.message;
    }
    if (!error.response) {
      return "Cannot reach the server. Please check your connection and try again.";
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

interface ApiEnvelope<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface LoginPayload {
  user: { id: string; name: string; email: string; username: string } | null;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export const loginUser = async (
  emailOrUsername: string,
  password: string
): Promise<{ data: LoginPayload; message: string }> => {
  try {
    const response = await axios.post<{ data: LoginPayload; message: string }>(
      `${USER_URL}/login`,
      { emailOrUsername, password },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "An unexpected error occurred while logging in"));
  }
};

export const registerUser = async (input: RegisterUserInput): Promise<{ message: string }> => {
  try {
    const response = await axios.post<ApiEnvelope<unknown>>(`${USER_URL}/register`, input, {
      withCredentials: true,
    });
    return { message: response.data.message };
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Error registering user."));
  }
};

export const logoutUser = async (): Promise<string> => {
  try {
    const response = await apiClient.post<ApiEnvelope<unknown>>("/user/logout");
    return response.data.message;
  } catch (error) {
    throw new Error(extractErrorMessage(error, "Error logging out."));
  }
};
