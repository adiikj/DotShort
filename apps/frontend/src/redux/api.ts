import { createApi } from "@reduxjs/toolkit/query/react";
import { apiClient, extractErrorMessage } from "@/api/api";

interface ApiEnvelope<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface SerializedLink {
  _id: string;
  longUrl: string;
  shortCode: string;
  shortUrl: string;
  qrCode: string;
  hasPassword: boolean;
  expiresAt: string | null;
  clickCount: number;
  createdAt: string;
}

export interface TrendPoint {
  day: string;
  clicks: number;
}

export interface BreakdownEntry {
  value: string;
  count: number;
}

export interface Overview {
  totalLinks: number;
  totalClicks: number;
  clicksLast7Days: number;
  trend: TrendPoint[];
  recentLinks: SerializedLink[];
  topLink: SerializedLink | null;
}

export interface LinkAnalytics {
  link: SerializedLink;
  totalClicks: number;
  clicksLast7Days: number;
  trend: TrendPoint[];
  referrers: BreakdownEntry[];
  browsers: BreakdownEntry[];
  operatingSystems: BreakdownEntry[];
  devices: BreakdownEntry[];
  recentClicks: {
    clickedAt: string;
    referrer: string | null;
    browser: string | null;
    os: string | null;
    device: string | null;
  }[];
}

export interface AccountAnalytics {
  trend: TrendPoint[];
  referrers: BreakdownEntry[];
  browsers: BreakdownEntry[];
  operatingSystems: BreakdownEntry[];
  devices: BreakdownEntry[];
  clicksLast7Days: number;
  topLinks: SerializedLink[];
}

export interface Profile {
  name: string;
  username: string;
  email: string;
  memberSince: string;
}

/** RTK Query base query over our axios instance (auth + refresh handled there). */
const axiosBaseQuery =
  () =>
  async ({ url, method, body }: { url: string; method: "get" | "post" | "patch" | "put" | "delete"; body?: unknown }) => {
    try {
      const response = await apiClient.request<ApiEnvelope<unknown>>({
        url,
        method,
        data: body,
      });
      return { data: response.data.data };
    } catch (error) {
      const err = error as { response?: { status?: number; data?: unknown } };
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data ?? { message: extractErrorMessage(error, "Request failed") },
        },
      };
    }
  };

export const dotshortApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Links", "Overview", "Analytics", "Profile"],
  endpoints: (builder) => ({
    overview: builder.query<Overview, void>({
      query: () => ({ url: "/overview", method: "get" }),
      providesTags: ["Overview", "Links"],
    }),
    links: builder.query<{ links: SerializedLink[] }, void>({
      query: () => ({ url: "/user-links", method: "get" }),
      providesTags: ["Links"],
    }),
    linkAnalytics: builder.query<LinkAnalytics, string>({
      query: (shortCode) => ({ url: `/links/${encodeURIComponent(shortCode)}/analytics`, method: "get" }),
      providesTags: (_result, _error, shortCode) => [{ type: "Links", id: shortCode }, "Analytics"],
    }),
    accountAnalytics: builder.query<AccountAnalytics, void>({
      query: () => ({ url: "/analytics", method: "get" }),
      providesTags: ["Analytics", "Links"],
    }),
    profile: builder.query<Profile, void>({
      query: () => ({ url: "/user/profile", method: "get" }),
      providesTags: ["Profile"],
    }),
    shorten: builder.mutation<
      { shortUrl: string; qrCode: string; expiresAt: string | null; shortCode: string },
      { longUrl: string; shortCode?: string; password?: string; expireInHours?: number }
    >({
      query: (body) => ({ url: "/shorten", method: "post", body }),
      invalidatesTags: ["Overview", "Links", "Analytics"],
    }),
    updateLink: builder.mutation<
      SerializedLink,
      {
        shortCode: string;
        longUrl?: string;
        password?: string | null;
        expireInHours?: number | null;
      }
    >({
      query: ({ shortCode, ...body }) => ({
        url: `/links/${encodeURIComponent(shortCode)}`,
        method: "patch",
        body,
      }),
      invalidatesTags: (_result, _error, { shortCode }) => [
        "Overview",
        "Links",
        "Analytics",
        { type: "Links", id: shortCode },
      ],
    }),
    deleteLink: builder.mutation<{ message?: string }, string>({
      query: (shortCode) => ({ url: `/delete/${encodeURIComponent(shortCode)}`, method: "delete" }),
      invalidatesTags: ["Overview", "Links", "Analytics"],
    }),
    updateProfile: builder.mutation<Profile, { name?: string; username?: string }>({
      query: (body) => ({ url: "/user/profile", method: "patch", body }),
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation<
      { accessToken: string; refreshToken: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/user/password", method: "put", body }),
    }),
  }),
});

export const {
  useOverviewQuery,
  useLinksQuery,
  useLinkAnalyticsQuery,
  useAccountAnalyticsQuery,
  useProfileQuery,
  useShortenMutation,
  useUpdateLinkMutation,
  useDeleteLinkMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = dotshortApi;
