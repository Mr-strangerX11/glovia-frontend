export function getServerErrorSummary(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "unknown error";
  }

  const possibleError = error as {
    message?: string;
    response?: { status?: number; statusText?: string };
    code?: string;
  };

  const status = possibleError.response?.status;
  const statusText = possibleError.response?.statusText;
  const message = possibleError.message;
  const code = possibleError.code;

  if (status && statusText) {
    return `${status} ${statusText}`;
  }

  if (status) {
    return `HTTP ${status}`;
  }

  if (message) {
    return code ? `${code}: ${message}` : message;
  }

  return "unknown error";
}