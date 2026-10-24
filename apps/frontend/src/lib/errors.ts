interface ApiErrorShape {
  message?: string;
  errors?: string[];
}

/** Narrow RTK Query's unknown error payload without trusting an unchecked cast. */
export function apiErrorShape(error: unknown): ApiErrorShape {
  if (typeof error !== "object" || error === null || !("data" in error)) return {};

  const data = error.data;
  if (typeof data !== "object" || data === null) return {};

  const message =
    "message" in data && typeof data.message === "string" ? data.message : undefined;
  const errors =
    "errors" in data && Array.isArray(data.errors)
      ? data.errors.filter((item): item is string => typeof item === "string")
      : undefined;

  return { message, errors };
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  return apiErrorShape(error).message ?? fallback;
}
