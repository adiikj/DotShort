/**
 * Drizzle wraps driver errors in DrizzleQueryError: the SQLSTATE lives on
 * `.cause` (and node-postgres exposes it as the string "23505"). Walk the
 * chain so unique-constraint races are detected wherever they surface.
 */
export const isUniqueViolation = (error: unknown): boolean => {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    if (typeof current === "object" && current !== null && "code" in current) {
      if (String((current as { code?: unknown }).code) === "23505") {
        return true;
      }
    }
    current = (current as { cause?: unknown }).cause;
  }
  return false;
};
