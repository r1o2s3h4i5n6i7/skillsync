// ─── Generic API Response Types ──────────────────────

export interface ApiErrorResponse {
  error: string;
}

/**
 * Type guard to check if an API response is an error.
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiErrorResponse).error === "string"
  );
}
